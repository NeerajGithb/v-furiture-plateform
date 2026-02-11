import { NotificationService } from "@/services/notificationService";
import { invalidateClientCache } from "@/lib/cache/invalidateClientCache";
import { 
  NotificationNotFoundError, 
  NotificationsFetchError, 
  NotificationUpdateError,
  NotificationDeleteError,
  NotificationCacheError 
} from "./SellerNotificationsErrors";

export class SellerNotificationsRepository {
  private getDateFilter(period: string) {
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case '30min':
        startDate = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case '1hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '1day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return null;
    }

    return startDate;
  }

  async getAllNotifications(sellerId: string, limit: number = 20) {
    const notifications = await NotificationService.getAll(sellerId, limit);
    return notifications.map(n => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      read: n.read,
      priority: n.priority,
      createdAt: n.createdAt,
      readAt: n.readAt,
      metadata: n.metadata,
    }));
  }

  async getNotificationById(sellerId: string, notificationId: string) {
    const notifications = await NotificationService.getAll(sellerId);
    const notification = notifications.find(n => n._id.toString() === notificationId);

    if (!notification) {
      throw new NotificationNotFoundError(notificationId);
    }

    return {
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      read: notification.read,
      priority: notification.priority,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      metadata: notification.metadata,
    };
  }

  async getUnreadCount(sellerId: string) {
    return await NotificationService.getUnreadCount(sellerId);
  }

  async markAsRead(notificationId: string, sellerId: string) {
    await NotificationService.markAsRead(notificationId, sellerId);
    await this.invalidateCache(sellerId);
  }

  async markAllAsRead(sellerId: string) {
    await NotificationService.markAllAsRead(sellerId);
    await this.invalidateCache(sellerId);
  }

  async deleteNotification(notificationId: string, sellerId: string) {
    await NotificationService.dismiss(notificationId, sellerId);
    await this.invalidateCache(sellerId);
  }

  async bulkDeleteNotifications(notificationIds: string[], sellerId: string) {
    for (const notificationId of notificationIds) {
      await NotificationService.dismiss(notificationId, sellerId);
    }
    await this.invalidateCache(sellerId);
    return notificationIds.length;
  }

  async clearAllNotifications(sellerId: string) {
    await NotificationService.cleanupOldNotifications(0);
    await this.invalidateCache(sellerId);
  }

  private async invalidateCache(sellerId: string) {
    await invalidateClientCache(`notifications:seller:${sellerId}`);
  }

  applyFilters(notifications: any[], filters: {
    search?: string;
    type?: string;
    read?: string;
    priority?: string;
    period?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    let filtered = [...notifications];

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm) ||
        n.message.toLowerCase().includes(searchTerm) ||
        n.type.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date filter
    if (filters.period) {
      const dateFilter = this.getDateFilter(filters.period);
      if (dateFilter) {
        filtered = filtered.filter(n => 
          new Date(n.createdAt) >= dateFilter
        );
      }
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    // Apply read filter
    if (filters.read !== null && filters.read !== undefined) {
      const isRead = filters.read === 'true';
      filtered = filtered.filter(n => n.read === isRead);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }

  calculateStats(notifications: any[]) {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {
        order: notifications.filter(n => n.type === 'order').length,
        review: notifications.filter(n => n.type === 'customer').length,
        product: notifications.filter(n => n.type === 'product').length,
        payout: notifications.filter(n => n.type === 'payment').length,
        system: notifications.filter(n => n.type === 'system').length,
      },
      byPriority: {
        low: notifications.filter(n => n.priority === 'low').length,
        medium: notifications.filter(n => n.priority === 'medium').length,
        high: notifications.filter(n => n.priority === 'high').length,
        urgent: notifications.filter(n => n.priority === 'critical').length,
      },
    };
  }
}

export const sellerNotificationsRepository = new SellerNotificationsRepository();