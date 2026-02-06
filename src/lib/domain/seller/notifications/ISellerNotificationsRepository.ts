export interface SellerNotification {
  id: string;
  sellerId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface ISellerNotificationsRepository {
  // Notification queries
  getNotifications(sellerId: string, options: {
    page: number;
    limit: number;
    type?: string;
    isRead?: boolean;
    priority?: string;
  }): Promise<{
    notifications: SellerNotification[];
    total: number;
  }>;
  
  getNotificationById(sellerId: string, notificationId: string): Promise<SellerNotification>;
  getNotificationStats(sellerId: string): Promise<NotificationStats>;
  getUnreadCount(sellerId: string): Promise<number>;
  
  // Notification management
  markAsRead(sellerId: string, notificationId: string): Promise<SellerNotification>;
  markAllAsRead(sellerId: string): Promise<{ updatedCount: number }>;
  deleteNotification(sellerId: string, notificationId: string): Promise<void>;
  bulkDelete(sellerId: string, notificationIds: string[]): Promise<{ deletedCount: number }>;
  
  // Notification creation (for internal use)
  createNotification(data: {
    sellerId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    priority?: string;
  }): Promise<SellerNotification>;
}