import { sellerNotificationsRepository } from "./SellerNotificationsRepository";
import { 
  SellerNotificationsQueryRequest, 
  BulkDeleteNotificationsRequest 
} from "./SellerNotificationsSchemas";
import { InvalidNotificationIdsError } from "./SellerNotificationsErrors";

export class SellerNotificationsService {
  async getNotifications(sellerId: string, query: SellerNotificationsQueryRequest = {
    page: 1,
    limit: 20,
    period: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }): Promise<{
    notifications: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      link?: string;
      read: boolean;
      priority: string;
      createdAt: Date;
      readAt?: Date;
      metadata?: any;
    }>;
    stats: any;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } | { count: number }> {
    const { page = 1, limit = 20, action } = query;

    // Handle specific actions
    if (action === 'unread-count') {
      const count = await sellerNotificationsRepository.getUnreadCount(sellerId);
      return { count };
    }

    // Get all notifications
    const allNotifications = await sellerNotificationsRepository.getAllNotifications(sellerId, 1000); // Get more for filtering

    // Apply filters
    const filteredNotifications = sellerNotificationsRepository.applyFilters(allNotifications, {
      search: query.search,
      type: query.type,
      read: query.read,
      priority: query.priority,
      period: query.period,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    // Calculate stats based on filtered notifications
    const stats = sellerNotificationsRepository.calculateStats(filteredNotifications);

    // Apply pagination
    const total = filteredNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    return {
      notifications: paginatedNotifications,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async getNotificationById(sellerId: string, notificationId: string) {
    return await sellerNotificationsRepository.getNotificationById(sellerId, notificationId);
  }

  async getUnreadCount(sellerId: string) {
    return await sellerNotificationsRepository.getUnreadCount(sellerId);
  }

  async markAsRead(notificationId: string, sellerId: string) {
    if (notificationId === 'all') {
      await sellerNotificationsRepository.markAllAsRead(sellerId);
      return { message: 'All notifications marked as read' };
    }
    
    await sellerNotificationsRepository.markAsRead(notificationId, sellerId);
    return { message: 'Notification marked as read' };
  }

  async deleteNotification(notificationId: string, sellerId: string) {
    await sellerNotificationsRepository.deleteNotification(notificationId, sellerId);
    return { message: 'Notification deleted successfully' };
  }

  async bulkDeleteNotifications(sellerId: string, bulkData: BulkDeleteNotificationsRequest) {
    const { notificationIds } = bulkData;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new InvalidNotificationIdsError();
    }

    const deletedCount = await sellerNotificationsRepository.bulkDeleteNotifications(notificationIds, sellerId);
    return { 
      message: `${deletedCount} notification(s) deleted successfully`,
      deletedCount 
    };
  }

  async clearAllNotifications(sellerId: string) {
    await sellerNotificationsRepository.clearAllNotifications(sellerId);
    return { message: 'All notifications cleared successfully' };
  }

  async performBulkAction(sellerId: string, action: string, data?: any) {
    switch (action) {
      case 'mark-all-read':
        return await this.markAsRead('all', sellerId);
      
      case 'bulk-delete':
        return await this.bulkDeleteNotifications(sellerId, data);
      
      case 'clear-all':
        return await this.clearAllNotifications(sellerId);
      
      default:
        throw new Error(`Unknown bulk action: ${action}`);
    }
  }
}

export const sellerNotificationsService = new SellerNotificationsService();