import { INotificationsRepository } from "./INotificationsRepository";
import { NotificationsRepository } from "./NotificationsRepository";
import {
  GetNotificationsRequest,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  BulkNotificationRequest,
} from "./NotificationsSchemas";
import {
  NotificationNotFoundError,
  InvalidNotificationActionError,
  InvalidRecipientError,
  NotificationCreateError,
  NotificationUpdateError,
} from "./NotificationsErrors";

export class NotificationsService {
  constructor(private repository: INotificationsRepository = new NotificationsRepository()) {}

  // Get user notifications
  async getUserNotifications(
    userId: string,
    userType: 'seller' | 'admin',
    options: GetNotificationsRequest,
  ) {
    const result = await this.repository.findByUserId(userId, userType, options);

    return {
      success: true,
      message: "Notifications retrieved successfully",
      data: result,
    };
  }

  // Create notification
  async createNotification(data: CreateNotificationRequest) {
    // Validate recipient
    if (!data.sellerId && !data.userId && !data.adminId) {
      throw new InvalidRecipientError();
    }

    try {
      const notification = await this.repository.create(data);

      return {
        success: true,
        message: "Notification created successfully",
        data: notification,
      };
    } catch (error) {
      throw new NotificationCreateError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Create bulk notifications (admin only)
  async createBulkNotifications(data: BulkNotificationRequest) {
    try {
      const count = await this.repository.createBulk(data);

      return {
        success: true,
        message: `${count} notifications created successfully`,
        data: { count },
      };
    } catch (error) {
      throw new NotificationCreateError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Update notification
  async updateNotification(
    userId: string,
    userType: 'seller' | 'admin',
    data: UpdateNotificationRequest,
  ) {
    try {
      let result;

      if (data.markAll) {
        // Mark all as read
        const count = await this.repository.markAllAsRead(userId, userType);
        result = { action: 'marked_all_read', count };
      } else if (data.dismissRead) {
        // Dismiss all read notifications
        const count = await this.repository.dismissAllRead(userId, userType);
        result = { action: 'dismissed_read', count };
      } else if (data.id) {
        // Update specific notification
        if (data.action === 'read') {
          const notification = await this.repository.markAsRead(userId, userType, data.id);
          result = { action: 'marked_read', notification };
        } else if (data.action === 'dismiss') {
          const notification = await this.repository.dismiss(userId, userType, data.id);
          result = { action: 'dismissed', notification };
        } else {
          throw new InvalidNotificationActionError(data.action);
        }
      } else {
        throw new InvalidNotificationActionError("No valid action specified");
      }

      return {
        success: true,
        message: "Notification updated successfully",
        data: result,
      };
    } catch (error) {
      if (error instanceof NotificationNotFoundError || error instanceof InvalidNotificationActionError) {
        throw error;
      }
      throw new NotificationUpdateError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Get unread count
  async getUnreadCount(userId: string, userType: 'seller' | 'admin') {
    const count = await this.repository.countUnread(userId, userType);

    return {
      success: true,
      data: { unreadCount: count },
    };
  }

  // Admin operations
  async getAllNotifications(options: { limit?: number; skip?: number }) {
    const result = await this.repository.findAllNotifications(options);

    return {
      success: true,
      message: "All notifications retrieved successfully",
      data: result,
    };
  }

  async deleteNotification(notificationId: string) {
    const deleted = await this.repository.deleteNotification(notificationId);
    
    if (!deleted) {
      throw new NotificationNotFoundError(notificationId);
    }

    return {
      success: true,
      message: "Notification deleted successfully",
    };
  }
}

// Create default instance
export const notificationsService = new NotificationsService();