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
      case 'all':
      default:
        return null;
    }

    return startDate;
  }

  async getAllNotifications(sellerId: string, limit: number = 20) {
    try {
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
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new NotificationsFetchError("Failed to fetch notifications");
    }
  }

  async getNotificationById(sellerId: string, notificationId: string) {
    try {
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
    } catch (error) {
      if (error instanceof NotificationNotFoundError) {
        throw error;
      }
      console.error("Error fetching notification:", error);
      throw new NotificationsFetchError("Failed to fetch notification");
    }
  }

  async getUnreadCount(sellerId: string) {
    try {
      return await NotificationService.getUnreadCount(sellerId);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      throw new NotificationsFetchError("Failed to get unread count");
    }
  }

  async markAsRead(notificationId: string, sellerId: string) {
    try {
      await NotificationService.markAsRead(notificationId, sellerId);
      await this.invalidateCache(sellerId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new NotificationUpdateError("Failed to mark notification as read");
    }
  }

  async markAllAsRead(sellerId: string) {
    try {
      await NotificationService.markAllAsRead(sellerId);
      await this.invalidateCache(sellerId);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new NotificationUpdateError("Failed to mark all notifications as read");
    }
  }

  async deleteNotification(notificationId: string, sellerId: string) {
    try {
      await NotificationService.dismiss(notificationId, sellerId);
      await this.invalidateCache(sellerId);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new NotificationDeleteError("Failed to delete notification");
    }
  }

  async bulkDeleteNotifications(notificationIds: string[], sellerId: string) {
    try {
      for (const notificationId of notificationIds) {
        await NotificationService.dismiss(notificationId, sellerId);
      }
      await this.invalidateCache(sellerId);
      return notificationIds.length;
    } catch (error) {
      console.error("Error bulk deleting notifications:", error);
      throw new NotificationDeleteError("Failed to delete notifications");
    }
  }

  async clearAllNotifications(sellerId: string) {
    try {
      await NotificationService.cleanupOldNotifications(0);
      await this.invalidateCache(sellerId);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw new NotificationDeleteError("Failed to clear all notifications");
    }
  }

  private async invalidateCache(sellerId: string) {
    try {
      await invalidateClientCache(`notifications:seller:${sellerId}`);
    } catch (cacheError) {
      console.error('Failed to invalidate notification cache:', cacheError);
      // Don't throw here as cache invalidation failure shouldn't break the main operation
    }
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