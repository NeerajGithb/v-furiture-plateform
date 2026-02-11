import { BasePrivateService } from "../baseService";
import { 
  SellerNotification,
  NotificationsQuery,
  BulkNotificationAction
} from "@/types/seller/notifications";

interface NotificationsResponse {
  notifications: SellerNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class SellerNotificationsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get notifications with pagination and filters
  async getNotifications(params: NotificationsQuery = {}): Promise<NotificationsResponse> {
    const result = await this.getPaginated<any>("/seller/notifications", params);
    
    return {
      notifications: result.data || [],
      pagination: result.pagination
    };
  }

  // Get unread count
  async getUnreadCount(): Promise<number> {
    const response = await this.get<{ count: number }>("/seller/notifications", { action: "unread-count" });

    if (response.success) {
      return response.data!.count;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch unread count.",
      );
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ message: string }> {
    const response = await this.patch<{ message: string }>(`/seller/notifications/${notificationId}`);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to mark notification as read.",
      );
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await this.delete<{ message: string }>(`/seller/notifications/${notificationId}`);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to delete notification.",
      );
    }
  }

  // Bulk delete notifications
  async bulkDeleteNotifications(data: { notificationIds: string[] }): Promise<{ message: string }> {
    const response = await this.patch<{ message: string }>("/seller/notifications", {
      action: "bulk-delete",
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk delete notifications.",
      );
    }
  }

  // Perform bulk action
  async performBulkAction(actionType: string, data: BulkNotificationAction): Promise<{ message: string }> {
    const { action: _, ...cleanData } = data as any;
    const response = await this.patch<{ message: string }>("/seller/notifications", {
      action: actionType,
      ...cleanData,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to perform bulk action.",
      );
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<{ message: string }> {
    const response = await this.delete<{ message: string }>("/seller/notifications");

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to clear all notifications.",
      );
    }
  }
}

// Export singleton instance
export const sellerNotificationsService = new SellerNotificationsService();