import {
  INotificationsRepository,
  Notification,
  NotificationsResult,
} from "./INotificationsRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import {
  GetNotificationsRequest,
  CreateNotificationRequest,
  BulkNotificationRequest,
} from "./NotificationsSchemas";
import NotificationModel from "@/models/Notification";
import SellerModel from "@/models/Seller";
import AdminModel from "@/models/Admin";

export class NotificationsRepository implements INotificationsRepository {
  // Get notifications for user
  async findByUserId(
    userId: string,
    userType: 'seller' | 'admin',
    options: GetNotificationsRequest,
  ): Promise<NotificationsResult> {
    try {
      const { limit, includeRead } = options;
      
      // Build query based on user type
      const query: any = {};
      if (userType === 'seller') {
        query.sellerId = userId;
      } else {
        query.adminId = userId;
      }

      // Filter by read status if specified
      if (!includeRead) {
        query.read = false;
      }

      // Add expiration filter
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];

      const notifications = await NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Count unread notifications
      const unreadCount = await this.countUnread(userId, userType);

      return {
        notifications: notifications.map(this.mapToNotificationType),
        unreadCount,
      };
    } catch (error) {
      throw new RepositoryError("Failed to fetch notifications", "findByUserId", error as Error);
    }
  }

  // Create notification
  async create(data: CreateNotificationRequest): Promise<Notification> {
    try {
      const notificationData = {
        ...data,
        read: false,
        dismissed: false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      };

      const notification = await NotificationModel.create(notificationData);
      return this.mapToNotificationType(notification.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to create notification", "create", error as Error);
    }
  }

  // Bulk create notifications
  async createBulk(data: BulkNotificationRequest): Promise<number> {
    try {
      let recipientIds: string[] = [];

      // Get recipient IDs based on type
      switch (data.recipientType) {
        case 'all-sellers':
          const allSellers = await SellerModel.find({ status: 'active' }).select('_id');
          recipientIds = allSellers.map(s => s._id.toString());
          break;
        case 'all-admins':
          const allAdmins = await AdminModel.find({ status: 'active' }).select('_id');
          recipientIds = allAdmins.map(a => a._id.toString());
          break;
        case 'specific-sellers':
        case 'specific-admins':
          recipientIds = data.recipientIds || [];
          break;
      }

      // Create notifications for all recipients
      const notifications = recipientIds.map(recipientId => ({
        ...data,
        [data.recipientType.includes('seller') ? 'sellerId' : 'adminId']: recipientId,
        read: false,
        dismissed: false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      }));

      const result = await NotificationModel.insertMany(notifications);
      return result.length;
    } catch (error) {
      throw new RepositoryError("Failed to create bulk notifications", "createBulk", error as Error);
    }
  }

  // Mark as read
  async markAsRead(userId: string, userType: 'seller' | 'admin', notificationId: string): Promise<Notification> {
    try {
      const query: any = { _id: notificationId };
      if (userType === 'seller') {
        query.sellerId = userId;
      } else {
        query.adminId = userId;
      }

      const notification = await NotificationModel.findOneAndUpdate(
        query,
        { 
          read: true, 
          readAt: new Date() 
        },
        { new: true }
      ).lean();

      if (!notification) {
        throw new Error("Notification not found");
      }

      return this.mapToNotificationType(notification);
    } catch (error) {
      throw new RepositoryError("Failed to mark notification as read", "markAsRead", error as Error);
    }
  }

  // Mark all as read
  async markAllAsRead(userId: string, userType: 'seller' | 'admin'): Promise<number> {
    try {
      const query: any = { read: false };
      if (userType === 'seller') {
        query.sellerId = userId;
      } else {
        query.adminId = userId;
      }

      const result = await NotificationModel.updateMany(
        query,
        { 
          read: true, 
          readAt: new Date() 
        }
      );

      return result.modifiedCount;
    } catch (error) {
      throw new RepositoryError("Failed to mark all notifications as read", "markAllAsRead", error as Error);
    }
  }

  // Dismiss notification
  async dismiss(userId: string, userType: 'seller' | 'admin', notificationId: string): Promise<Notification> {
    try {
      const query: any = { _id: notificationId };
      if (userType === 'seller') {
        query.sellerId = userId;
      } else {
        query.adminId = userId;
      }

      const notification = await NotificationModel.findOneAndUpdate(
        query,
        { 
          dismissed: true, 
          dismissedAt: new Date() 
        },
        { new: true }
      ).lean();

      if (!notification) {
        throw new Error("Notification not found");
      }

      return this.mapToNotificationType(notification);
    } catch (error) {
      throw new RepositoryError("Failed to dismiss notification", "dismiss", error as Error);
    }
  }

  // Dismiss all read notifications
  async dismissAllRead(userId: string, userType: 'seller' | 'admin'): Promise<number> {
    try {
      const query: any = { read: true, dismissed: false };
      if (userType === 'seller') {
        query.sellerId = userId;
      } else {
        query.adminId = userId;
      }

      const result = await NotificationModel.updateMany(
        query,
        { 
          dismissed: true, 
          dismissedAt: new Date() 
        }
      );

      return result.modifiedCount;
    } catch (error) {
      throw new RepositoryError("Failed to dismiss read notifications", "dismissAllRead", error as Error);
    }
  }

  // Count unread notifications
  async countUnread(userId: string, userType: 'seller' | 'admin'): Promise<number> {
    try {
      const query: any = { read: false, dismissed: false };
      if (userType === 'seller') {
        query.sellerId = userId;
      } else {
        query.adminId = userId;
      }

      // Add expiration filter
      query.$or = [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];

      return await NotificationModel.countDocuments(query);
    } catch (error) {
      throw new RepositoryError("Failed to count unread notifications", "countUnread", error as Error);
    }
  }

  // Admin operations
  async findAllNotifications(options: { limit?: number; skip?: number }): Promise<NotificationsResult> {
    try {
      const { limit = 50, skip = 0 } = options;

      const notifications = await NotificationModel.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await NotificationModel.countDocuments({});

      return {
        notifications: notifications.map(this.mapToNotificationType),
        unreadCount: total, // For admin, this represents total count
      };
    } catch (error) {
      throw new RepositoryError("Failed to fetch all notifications", "findAllNotifications", error as Error);
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const result = await NotificationModel.findByIdAndDelete(notificationId);
      return !!result;
    } catch (error) {
      throw new RepositoryError("Failed to delete notification", "deleteNotification", error as Error);
    }
  }

  // Helper method
  private mapToNotificationType(notification: any): Notification {
    return {
      _id: notification._id.toString(),
      sellerId: notification.sellerId?.toString(),
      userId: notification.userId?.toString(),
      adminId: notification.adminId?.toString(),
      type: notification.type,
      subType: notification.subType,
      priority: notification.priority,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      actions: notification.actions,
      metadata: notification.metadata,
      channels: notification.channels,
      read: notification.read,
      readAt: notification.readAt,
      dismissed: notification.dismissed,
      dismissedAt: notification.dismissedAt,
      expiresAt: notification.expiresAt,
      groupId: notification.groupId,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}