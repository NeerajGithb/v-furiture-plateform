import Notification from '@/models/Notification';
import dbConnect from '@/lib/db/mongodb';
import { invalidateClientCache } from '@/lib/cache/invalidateClientCache';
import { triggerSellerNotification, triggerUserNotification } from '@/lib/pusher/server';

interface CreateNotificationParams {
  sellerId?: string;
  userId?: string;
  type: 'order' | 'account' | 'product' | 'payment' | 'inventory' | 'performance' | 'customer' | 'system';
  subType: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  link?: string;
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: {
    orderId?: string;
    productId?: string;
    orderNumber?: string;
    productName?: string;
    amount?: number;
    customerId?: string;
    reviewId?: string;
    rating?: number;
    [key: string]: any;
  };
  channels?: Array<'app' | 'email' | 'sms' | 'whatsapp'>;
  expiresAt?: Date;
  groupId?: string;
}

/**
 * Central notification service
 * Use this to create notifications from anywhere in the app
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  static async create(params: CreateNotificationParams): Promise<void> {
    try {
      await dbConnect();
      
      // Validate that at least one of sellerId or userId is provided
      if (!params.sellerId && !params.userId) {
        console.error('❌ Cannot create notification: Either sellerId or userId must be provided');
        return;
      }
      
      const notificationData: any = {
        type: params.type,
        subType: params.subType,
        priority: params.priority || 'medium',
        title: params.title,
        message: params.message,
        link: params.link,
        actions: params.actions || [],
        metadata: params.metadata || {},
        channels: params.channels || ['app'],
        expiresAt: params.expiresAt,
        groupId: params.groupId,
        read: false,
        dismissed: false,
      };

      // Add sellerId or userId based on what's provided
      if (params.sellerId) {
        notificationData.sellerId = params.sellerId;
      }
      if (params.userId) {
        notificationData.userId = params.userId;
      }

      const notification = await Notification.create(notificationData);

      // 🔥 Automatically invalidate notification cache after creation
      try {
        if (params.userId) {
          await invalidateClientCache(`notifications:user:${params.userId}`);
        }
        if (params.sellerId) {
          await invalidateClientCache(`notifications:seller:${params.sellerId}`);
        }
      } catch (cacheError) {
        console.error('Failed to invalidate notification cache:', cacheError);
        // Don't fail notification creation if cache invalidation fails
      }

      // 🔔 Send real-time notification via Pusher
      try {
        const notificationPayload = {
          id: notification._id.toString(),
          type: notification.type,
          subType: notification.subType,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          createdAt: notification.createdAt,
        };

        if (params.sellerId) {
          await triggerSellerNotification(params.sellerId, notificationPayload);
        }
        if (params.userId) {
          await triggerUserNotification(params.userId, notificationPayload);
        }
      } catch (pusherError) {
        console.error('Failed to send Pusher notification:', pusherError);
        // Don't fail notification creation if Pusher fails
      }
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
    }
  }

  // ==================== ORDER NOTIFICATIONS ====================
  
  /**
   * New order received
   */
  static async notifyNewOrder(sellerId: string, orderNumber: string, orderId: string, amount: number): Promise<void> {
    await this.create({
      sellerId,
      type: 'order',
      subType: 'new_order',
      priority: 'high',
      title: 'New Order Received! 🎉',
      message: `Order #${orderNumber} has been placed. Amount: ₹${amount.toLocaleString('en-IN')}`,
      link: `/seller/orders/${orderId}`,
      actions: [
        { label: 'View Order', action: `/seller/orders/${orderId}`, style: 'primary' },
        { label: 'Confirm Order', action: `confirm_order_${orderId}`, style: 'primary' },
      ],
      metadata: { orderId, orderNumber, amount },
      channels: ['app', 'email'],
    });
  }

  /**
   * Order status changed
   */
  static async notifyOrderStatusChange(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    newStatus: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      confirmed: 'has been confirmed and is being prepared',
      processing: 'is now being processed',
      shipped: 'has been shipped and is on the way',
      delivered: 'has been delivered successfully',
      cancelled: 'has been cancelled',
    };

    await this.create({
      sellerId,
      type: 'order',
      subType: `order_${newStatus}`,
      priority: newStatus === 'cancelled' ? 'high' : 'medium',
      title: 'Order Status Updated',
      message: `Order #${orderNumber} ${statusMessages[newStatus] || 'status has been updated'}`,
      link: `/seller/orders/${orderId}`,
      metadata: { orderId, orderNumber, status: newStatus },
    });
  }

  /**
   * Order cancelled by customer
   */
  static async notifyOrderCancelledByCustomer(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    amount: number,
    reason?: string
  ): Promise<void> {
    await this.create({
      sellerId,
      type: 'order',
      subType: 'order_cancelled_by_customer',
      priority: 'high',
      title: 'Order Cancelled by Customer',
      message: `Customer cancelled Order #${orderNumber}. Refund of ₹${amount.toLocaleString('en-IN')} will be processed.${reason ? ` Reason: ${reason}` : ''}`,
      link: `/seller/orders/${orderId}`,
      metadata: { orderId, orderNumber, amount, reason },
      channels: ['app', 'email'],
    });
  }

  /**
   * Return request received
   */
  static async notifyReturnRequest(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    productName: string,
    reason: string
  ): Promise<void> {
    await this.create({
      sellerId,
      type: 'order',
      subType: 'return_request',
      priority: 'critical',
      title: 'Return Request Received ⚠️',
      message: `Customer requested return for "${productName}" in Order #${orderNumber}. Reason: ${reason}`,
      link: `/seller/orders/${orderId}`,
      actions: [
        { label: 'Accept Return', action: `accept_return_${orderId}`, style: 'primary' },
        { label: 'Reject Return', action: `reject_return_${orderId}`, style: 'danger' },
      ],
      metadata: { orderId, orderNumber, productName, reason },
      channels: ['app', 'email', 'sms'],
    });
  }

  // ==================== PAYMENT NOTIFICATIONS ====================
  
  /**
   * Payment received
   */
  static async notifyPaymentReceived(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    amount: number
  ): Promise<void> {
    await this.create({
      sellerId,
      type: 'payment',
      subType: 'payment_received',
      priority: 'high',
      title: 'Payment Received 💰',
      message: `Payment of ₹${amount.toLocaleString('en-IN')} received for Order #${orderNumber}`,
      link: `/seller/orders/${orderId}`,
      metadata: { orderId, orderNumber, amount },
      channels: ['app'],
    });
  }

  /**
   * Payment failed
   */
  static async notifyPaymentFailed(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    amount: number
  ): Promise<void> {
    await this.create({
      sellerId,
      type: 'payment',
      subType: 'payment_failed',
      priority: 'high',
      title: 'Payment Failed',
      message: `Payment of ₹${amount.toLocaleString('en-IN')} failed for Order #${orderNumber}. Customer may retry.`,
      link: `/seller/orders/${orderId}`,
      metadata: { orderId, orderNumber, amount },
    });
  }

  /**
   * Payout completed
   */
  static async notifyPayoutCompleted(sellerId: string, amount: number, payoutId: string): Promise<void> {
    await this.create({
      sellerId,
      type: 'payment',
      subType: 'payout_completed',
      priority: 'high',
      title: 'Payout Completed 🎉',
      message: `₹${amount.toLocaleString('en-IN')} has been transferred to your account`,
      link: `/seller/earnings`,
      metadata: { amount, payoutId },
      channels: ['app', 'email', 'sms'],
    });
  }

  /**
   * Payout scheduled
   */
  static async notifyPayoutScheduled(sellerId: string, amount: number, scheduledDate: Date): Promise<void> {
    await this.create({
      sellerId,
      type: 'payment',
      subType: 'payout_scheduled',
      priority: 'medium',
      title: 'Payout Scheduled',
      message: `Payout of ₹${amount.toLocaleString('en-IN')} scheduled for ${scheduledDate.toLocaleDateString('en-IN')}`,
      link: `/seller/earnings`,
      metadata: { amount, scheduledDate: scheduledDate.toISOString() },
    });
  }

  // ==================== CUSTOMER NOTIFICATIONS ====================
  
  /**
   * Customer review received
   */
  static async notifyCustomerReview(
    sellerId: string,
    productName: string,
    productId: string,
    rating: number,
    reviewText: string,
    reviewId: string
  ): Promise<void> {
    const stars = '⭐'.repeat(rating);
    const priority = rating <= 2 ? 'critical' : rating === 3 ? 'high' : 'medium';
    
    await this.create({
      sellerId,
      type: 'customer',
      subType: 'review_received',
      priority,
      title: `New ${rating}-Star Review ${stars}`,
      message: `"${reviewText.substring(0, 100)}${reviewText.length > 100 ? '...' : ''}" - Review on "${productName}"`,
      link: `/seller/products`,
      actions: rating <= 3 ? [
        { label: 'Respond to Review', action: `respond_review_${reviewId}`, style: 'primary' },
      ] : undefined,
      metadata: { productId, productName, rating, reviewId },
      channels: rating <= 2 ? ['app', 'email'] : ['app'],
    });
  }

  /**
   * Customer question received
   */
  static async notifyCustomerQuestion(
    sellerId: string,
    productName: string,
    productId: string,
    question: string,
    customerId: string
  ): Promise<void> {
    await this.create({
      sellerId,
      type: 'customer',
      subType: 'question_received',
      priority: 'high',
      title: 'Customer Question',
      message: `"${question}" - Question about "${productName}"`,
      link: `/seller/products`,
      actions: [
        { label: 'Answer Question', action: `answer_question_${productId}`, style: 'primary' },
      ],
      metadata: { productId, productName, question, customerId },
    });
  }

  // ==================== PRODUCT NOTIFICATIONS ====================
  
  /**
   * Product approved
   */
  static async notifyProductApproved(sellerId: string, productName: string, productId: string): Promise<void> {
    await this.create({
      sellerId,
      type: 'product',
      subType: 'product_approved',
      priority: 'medium',
      title: 'Product Approved ✅',
      message: `Your product "${productName}" has been approved and is now live on the platform`,
      link: `/seller/products`,
      metadata: { productId, productName },
    });
  }

  /**
   * Product rejected
   */
  static async notifyProductRejected(
    sellerId: string,
    productName: string,
    productId: string,
    reason?: string
  ): Promise<void> {
    await this.create({
      sellerId,
      type: 'product',
      subType: 'product_rejected',
      priority: 'high',
      title: 'Product Rejected',
      message: `Your product "${productName}" was rejected. ${reason || 'Please review and resubmit.'}`,
      link: `/seller/products/new?id=${productId}`,
      actions: [
        { label: 'Edit Product', action: `/seller/products/new?id=${productId}`, style: 'primary' },
      ],
      metadata: { productId, productName, reason },
      channels: ['app', 'email'],
    });
  }

  // ==================== INVENTORY NOTIFICATIONS ====================
  
  /**
   * Low stock alert
   */
  static async notifyLowStock(sellerId: string, productName: string, productId: string, quantity: number): Promise<void> {
    await this.create({
      sellerId,
      type: 'inventory',
      subType: 'low_stock',
      priority: 'high',
      title: 'Low Stock Alert 📦',
      message: `${productName} has only ${quantity} item${quantity > 1 ? 's' : ''} left in stock`,
      link: `/seller/inventory`,
      actions: [
        { label: 'Restock Now', action: `/seller/inventory`, style: 'primary' },
      ],
      metadata: { productId, productName, quantity },
    });
  }

  /**
   * Out of stock
   */
  static async notifyOutOfStock(sellerId: string, productName: string, productId: string): Promise<void> {
    await this.create({
      sellerId,
      type: 'inventory',
      subType: 'out_of_stock',
      priority: 'critical',
      title: 'Product Out of Stock ⚠️',
      message: `${productName} is now out of stock. Restock to continue selling.`,
      link: `/seller/inventory`,
      actions: [
        { label: 'Restock Now', action: `/seller/inventory`, style: 'primary' },
      ],
      metadata: { productId, productName, quantity: 0 },
      channels: ['app', 'email'],
    });
  }

  // ==================== ACCOUNT NOTIFICATIONS ====================
  
  /**
   * Account approved
   */
  static async notifyAccountApproved(sellerId: string): Promise<void> {
    await this.create({
      sellerId,
      type: 'account',
      subType: 'account_approved',
      priority: 'high',
      title: 'Account Approved! 🎉',
      message: 'Your seller account has been approved by admin. You can now start adding products!',
      link: '/seller/products/new',
      actions: [
        { label: 'Add Product', action: '/seller/products/new', style: 'primary' },
      ],
      channels: ['app', 'email', 'sms'],
    });
  }

  /**
   * Account suspended
   */
  static async notifyAccountSuspended(sellerId: string, reason?: string): Promise<void> {
    await this.create({
      sellerId,
      type: 'account',
      subType: 'account_suspended',
      priority: 'critical',
      title: 'Account Suspended',
      message: reason || 'Your account has been suspended. Please contact support for more information.',
      link: `/seller/settings`,
      channels: ['app', 'email', 'sms'],
    });
  }

  // ==================== PERFORMANCE NOTIFICATIONS ====================
  
  /**
   * Rating improved
   */
  static async notifyRatingImproved(sellerId: string, newRating: number, oldRating: number): Promise<void> {
    await this.create({
      sellerId,
      type: 'performance',
      subType: 'rating_improved',
      priority: 'medium',
      title: 'Rating Improved! 🌟',
      message: `Great job! Your rating improved from ${oldRating.toFixed(1)} to ${newRating.toFixed(1)} ⭐`,
      link: `/seller/dashboard`,
      metadata: { newRating, oldRating },
    });
  }

  /**
   * Rating dropped
   */
  static async notifyRatingDropped(sellerId: string, newRating: number, oldRating: number): Promise<void> {
    await this.create({
      sellerId,
      type: 'performance',
      subType: 'rating_dropped',
      priority: 'high',
      title: 'Rating Dropped',
      message: `Your rating dropped from ${oldRating.toFixed(1)} to ${newRating.toFixed(1)}. Check recent reviews to improve.`,
      link: `/seller/dashboard`,
      actions: [
        { label: 'View Reviews', action: `/seller/products`, style: 'primary' },
      ],
      metadata: { newRating, oldRating },
      channels: ['app', 'email'],
    });
  }

  /**
   * Performance warning
   */
  static async notifyPerformanceWarning(sellerId: string, issue: string, details: string): Promise<void> {
    await this.create({
      sellerId,
      type: 'performance',
      subType: 'performance_warning',
      priority: 'critical',
      title: 'Performance Warning ⚠️',
      message: `${issue}: ${details}`,
      link: `/seller/dashboard`,
      metadata: { issue, details },
      channels: ['app', 'email'],
    });
  }

  // ==================== SYSTEM NOTIFICATIONS ====================
  
  /**
   * System notification
   */
  static async notifySystem(sellerId: string, title: string, message: string, link?: string): Promise<void> {
    await this.create({
      sellerId,
      type: 'system',
      subType: 'system_message',
      priority: 'medium',
      title,
      message,
      link,
    });
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Get unread count for a seller
   */
  static async getUnreadCount(sellerId: string): Promise<number> {
    try {
      await dbConnect();
      return await Notification.countDocuments({ sellerId, read: false, dismissed: false });
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, sellerId: string): Promise<void> {
    try {
      await dbConnect();
      await Notification.updateOne(
        { _id: notificationId, sellerId },
        { read: true, readAt: new Date() }
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(sellerId: string): Promise<void> {
    try {
      await dbConnect();
      await Notification.updateMany(
        { sellerId, read: false },
        { read: true, readAt: new Date() }
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  /**
   * Dismiss notification
   */
  static async dismiss(notificationId: string, sellerId: string): Promise<void> {
    try {
      await dbConnect();
      await Notification.updateOne(
        { _id: notificationId, sellerId },
        { dismissed: true }
      );
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }

  /**
   * Get all notifications for a seller
   */
  static async getAll(sellerId: string, limit: number = 50): Promise<any[]> {
    try {
      await dbConnect();
      return await Notification.find({ sellerId, dismissed: false })
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  /**
   * Delete old read notifications (cleanup)
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      await dbConnect();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await Notification.deleteMany({
        read: true,
        dismissed: true,
        createdAt: { $lt: cutoffDate },
      });
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
    }
  }
}
