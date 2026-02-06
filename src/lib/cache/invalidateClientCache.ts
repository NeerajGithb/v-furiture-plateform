import { Redis } from "@upstash/redis";

/**
 * Redis client for invalidating client cache
 * Uses the same Redis instance as the client
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

/**
 * Invalidate client cache by prefix using SCAN (production-safe)
 */
export async function invalidateClientCache(prefix: string): Promise<void> {
  try {
    let cursor = 0;
    let deleted = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });

      cursor = Number(nextCursor);

      if (keys.length > 0) {
        await redis.del(...keys);
        deleted += keys.length;
      }
    } while (cursor !== 0);

    if (deleted > 0) {
      console.log(`[CACHE INVALIDATE] ${prefix}* (${deleted} keys deleted)`);
    }
  } catch (error) {
    console.error(`[CACHE INVALIDATE ERROR] ${prefix}:`, error);
  }
}

/**
 * Invalidate all product-related caches on CLIENT app
 * Call this when a product is created, updated, deleted, or status changed
 * This ensures client app shows only approved & published products
 */
export async function invalidateProductCaches(productId?: string): Promise<void> {
  const prefixes = [
    'products:',           // Main product listings
    'showcase:',           // Homepage showcase
    'relatedProducts:',    // Related products
    'categoryProducts:',   // Products by category
    'productsByCategory:', // Products grouped by category
    'product:',            // Individual product cache
    'search:',             // Search results
  ];

  // If specific product ID, also invalidate that product's cache
  if (productId) {
    prefixes.push(`product:${productId}`);
  }

  await Promise.all(prefixes.map(prefix => invalidateClientCache(prefix)));
  
  // Set a cache version timestamp to help frontend know cache was invalidated
  try {
    await redis.set('cache:version:products', Date.now().toString());
    console.log(`[CACHE INVALIDATE] ✅ Client product caches cleared${productId ? ` for product ${productId}` : ''}`);
  } catch (error) {
    console.error('[CACHE VERSION ERROR]:', error);
  }
}

/**
 * Invalidate category-related caches
 * Call this when categories or subcategories are modified
 */
export async function invalidateCategoryCaches(): Promise<void> {
  const prefixes = [
    'categories:',
    'subcategories:',
    'products:',
  ];

  await Promise.all(prefixes.map(prefix => invalidateClientCache(prefix)));
}

/**
 * Invalidate all order-related caches
 * Call this when an order is created, updated, or deleted
 * 
 * @param orderId - MongoDB ObjectId of the order
 * @param orderNumber - Order number (e.g., "OD-20260127-000002")
 * @param userId - User ID who owns the order
 */
export async function invalidateOrderCaches(
  orderId: string,
  orderNumber: string,
  userId: string
): Promise<void> {
  try {
    await Promise.all([
      invalidateClientCache(`order:id:${orderId}:user:${userId}`),
      invalidateClientCache(`order:id:${orderId}`),
      invalidateClientCache(`order:${orderNumber}:user:${userId}`),
      invalidateClientCache(`order:${orderNumber}`),
      invalidateClientCache(`orders:user:${userId}`),
    ]);
    console.log(`[CACHE INVALIDATE] Order caches cleared for ${orderNumber}`);
  } catch (error) {
    console.error(`[CACHE INVALIDATE ERROR] Order ${orderNumber}:`, error);
  }
}
