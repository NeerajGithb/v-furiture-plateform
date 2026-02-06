import Pusher from 'pusher';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * Trigger a notification event for a specific seller
 */
export async function triggerSellerNotification(sellerId: string, notification: any) {
  try {
    await pusherServer.trigger(
      `seller-${sellerId}`,
      'new-notification',
      notification
    );
    console.log(`✅ Pusher notification sent to seller-${sellerId}`);
  } catch (error) {
    console.error('❌ Failed to send Pusher notification:', error);
  }
}

/**
 * Trigger a notification event for a specific user
 */
export async function triggerUserNotification(userId: string, notification: any) {
  try {
    await pusherServer.trigger(
      `user-${userId}`,
      'new-notification',
      notification
    );
    console.log(`✅ Pusher notification sent to user-${userId}`);
  } catch (error) {
    console.error('❌ Failed to send Pusher notification:', error);
  }
}
