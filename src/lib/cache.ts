// ============================================
// Restaurant OS - Caching Utilities
// Redis-based caching for production
// Memory-based caching for development
// ============================================

/**
 * Cache configuration
 */
interface CacheConfig {
  ttl: number; // Time to live in seconds
  prefix: string;
}

/**
 * Default cache configurations
 */
export const cacheConfigs = {
  // Short-lived caches (1-5 minutes)
  orderStatus: { ttl: 60, prefix: 'order:status' },
  driverLocation: { ttl: 30, prefix: 'driver:loc' },
  activeOrders: { ttl: 60, prefix: 'orders:active' },
  
  // Medium caches (5-15 minutes)
  menuItems: { ttl: 300, prefix: 'menu:items' },
  restaurantInfo: { ttl: 300, prefix: 'restaurant:info' },
  deliveryZones: { ttl: 300, prefix: 'delivery:zones' },
  
  // Long caches (15-60 minutes)
  dashboardStats: { ttl: 900, prefix: 'dashboard:stats' },
  customerProfile: { ttl: 900, prefix: 'customer:profile' },
  driverStats: { ttl: 900, prefix: 'driver:stats' },
  
  // Very long caches (1-24 hours)
  organizationSettings: { ttl: 3600, prefix: 'org:settings' },
  currencies: { ttl: 86400, prefix: 'currencies' },
  countries: { ttl: 86400, prefix: 'countries' },
} as const;

/**
 * In-memory cache store for development
 */
class MemoryCache {
  private cache: Map<string, { value: unknown; expiresAt: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt < now) {
          this.cache.delete(key);
        }
      }
    }, 60000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// Global cache instance
const globalForCache = globalThis as unknown as { cache: MemoryCache };
const memoryCache = globalForCache.cache ?? new MemoryCache();
if (process.env.NODE_ENV !== 'production') globalForCache.cache = memoryCache;

/**
 * Redis client for production (lazy loaded)
 */
let redisClient: any = null;

async function getRedisClient() {
  if (redisClient) return redisClient;
  
  if (process.env.REDIS_URL) {
    try {
      // Dynamic import with try-catch for environments without Redis
      const redisModule = await import('redis').catch(() => null);
      if (!redisModule) {
        console.warn('[Cache] Redis module not available, falling back to memory cache');
        return null;
      }
      const { createClient } = redisModule;
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      return redisClient;
    } catch (error) {
      console.warn('[Cache] Redis not available, falling back to memory cache');
      return null;
    }
  }
  
  return null;
}

/**
 * Cache key generator
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      const value = await redis.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error('[Cache] Redis get error:', error);
      return null;
    }
  }
  
  return memoryCache.get<T>(key);
}

/**
 * Set value in cache
 */
export async function setCache<T>(key: string, value: T, ttl: number): Promise<void> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      await redis.setEx(key, ttl, JSON.stringify(value));
      return;
    } catch (error) {
      console.error('[Cache] Redis set error:', error);
    }
  }
  
  return memoryCache.set(key, value, ttl);
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch (error) {
      console.error('[Cache] Redis delete error:', error);
    }
  }
  
  return memoryCache.delete(key);
}

/**
 * Delete multiple keys matching pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  const redis = await getRedisClient();
  
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      return;
    } catch (error) {
      console.error('[Cache] Redis delete pattern error:', error);
    }
  }
  
  return memoryCache.deletePattern(pattern);
}

/**
 * Get or set cache with factory function
 */
export async function getOrSetCache<T>(
  key: string,
  ttl: number,
  factory: () => Promise<T>
): Promise<T> {
  const cached = await getCache<T>(key);
  
  if (cached !== null) {
    return cached;
  }
  
  const value = await factory();
  await setCache(key, value, ttl);
  
  return value;
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  async invalidateRestaurant(restaurantId: string) {
    await deleteCachePattern(`restaurant:${restaurantId}:*`);
    await deleteCachePattern(`menu:${restaurantId}:*`);
    await deleteCachePattern(`orders:${restaurantId}:*`);
  },
  
  async invalidateOrder(orderId: string, restaurantId: string) {
    await deleteCache(`order:status:${orderId}`);
    await deleteCachePattern(`orders:active:${restaurantId}`);
    await deleteCachePattern(`dashboard:stats:${restaurantId}`);
  },
  
  async invalidateCustomer(customerId: string) {
    await deleteCachePattern(`customer:profile:${customerId}:*`);
  },
  
  async invalidateDriver(driverId: string) {
    await deleteCachePattern(`driver:loc:${driverId}`);
    await deleteCachePattern(`driver:stats:${driverId}`);
  },
  
  async invalidateMenu(restaurantId: string) {
    await deleteCachePattern(`menu:${restaurantId}:*`);
  },
  
  async invalidateOrganization(organizationId: string) {
    await deleteCachePattern(`org:settings:${organizationId}`);
  },
};

/**
 * Higher-order function to cache API responses
 */
export function withCache<T>(
  config: CacheConfig,
  keyGenerator: (...args: unknown[]) => string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const key = keyGenerator(...args);
      
      const cached = await getCache<T>(key);
      if (cached !== null) {
        return cached;
      }
      
      const result = await originalMethod.apply(this, args);
      await setCache(key, result, config.ttl);
      
      return result;
    };

    return descriptor;
  };
}

/**
 * Cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  type: 'memory' | 'redis';
  keys?: number;
  memoryUsage?: string;
}> {
  const redis = await getRedisClient();
  
  if (redis) {
    const info = await redis.info('memory');
    const dbSize = await redis.dbSize();
    
    return {
      type: 'redis',
      keys: dbSize,
      memoryUsage: info.match(/used_memory_human:(\S+)/)?.[1] || 'unknown',
    };
  }
  
  return {
    type: 'memory',
    // Memory cache doesn't expose stats easily
  };
}
