import {
  GetNotificationsRequest,
  CreateNotificationRequest,
  BulkNotificationRequest,
} from "./NotificationsSchemas";

export interface Notification {
  _id: string;
  sellerId?: string;
  userId?: string;
  adminId?: string;
  type: string;
  subType: string;
  priority: number;
  title: string;
  message: string;
  link?: string;
  actions?: Array<{
    label: string;
    action: string;
    style?: "primary" | "secondary" | "danger";
  }>;
  metadata?: Record<string, any>;
  channels: string[];
  read: boolean;
  readAt?: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  expiresAt?: Date;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationsResult {
  notifications: Notification[];
  unreadCount: number;
}

export interface INotificationsRepository {
  // Get notifications for different user types
  findByUserId(
    userId: string,
    userType: 'seller' | 'admin',
    options: GetNotificationsRequest,
  ): Promise<NotificationsResult>;

  // Create notification
  create(data: CreateNotificationRequest): Promise<Notification>;

  // Bulk create notifications (for admin broadcasts)
  createBulk(data: BulkNotificationRequest): Promise<number>; // returns count of created notifications

  // Update notification
  markAsRead(userId: string, userType: 'seller' | 'admin', notificationId: string): Promise<Notification>;
  markAllAsRead(userId: string, userType: 'seller' | 'admin'): Promise<number>; // returns count of updated notifications

  // Dismiss notification
  dismiss(userId: string, userType: 'seller' | 'admin', notificationId: string): Promise<Notification>;
  dismissAllRead(userId: string, userType: 'seller' | 'admin'): Promise<number>; // returns count of dismissed notifications

  // Count unread notifications
  countUnread(userId: string, userType: 'seller' | 'admin'): Promise<number>;

  // Admin operations
  findAllNotifications(options: { limit?: number; skip?: number }): Promise<NotificationsResult>;
  deleteNotification(notificationId: string): Promise<boolean>;
}