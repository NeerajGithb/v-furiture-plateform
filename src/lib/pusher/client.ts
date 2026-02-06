'use client';

import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

/**
 * Get or create Pusher client instance
 */
export function getPusherClient(): Pusher {
  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      throw new Error('Pusher configuration missing. Please set NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER in environment variables.');
    }

    pusherClient = new Pusher(key, {
      cluster,
      forceTLS: true,
    });
  }
  return pusherClient;
}

/**
 * Subscribe to seller notifications
 */
export function subscribeToSellerNotifications(
  sellerId: string,
  onNotification: (notification: any) => void
) {
  const pusher = getPusherClient();
  const channel = pusher.subscribe(`seller-${sellerId}`);
  
  channel.bind('new-notification', onNotification);
  
  console.log(`📡 Subscribed to seller-${sellerId} notifications`);
  
  return () => {
    channel.unbind('new-notification', onNotification);
    pusher.unsubscribe(`seller-${sellerId}`);
    console.log(`📡 Unsubscribed from seller-${sellerId} notifications`);
  };
}

/**
 * Subscribe to user notifications
 */
export function subscribeToUserNotifications(
  userId: string,
  onNotification: (notification: any) => void
) {
  const pusher = getPusherClient();
  const channel = pusher.subscribe(`user-${userId}`);
  
  channel.bind('new-notification', onNotification);
  
  console.log(`📡 Subscribed to user-${userId} notifications`);
  
  return () => {
    channel.unbind('new-notification', onNotification);
    pusher.unsubscribe(`user-${userId}`);
    console.log(`📡 Unsubscribed from user-${userId} notifications`);
  };
}
