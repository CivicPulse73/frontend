/**
 * Fallback utilities for graceful degradation in development
 * Provides offline capabilities and error recovery
 */

import DevUtils from '../utils/devUtils'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

export class FallbackService {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Cache data with TTL for offline use
   */
  cacheData<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })

    DevUtils.log('cache', `Data cached for key: ${key}`, { ttl })
  }

  /**
   * Retrieve cached data if still valid
   */
  getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      DevUtils.log('cache', `No cached data for key: ${key}`)
      return null
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      DevUtils.log('cache', `Expired cached data removed for key: ${key}`)
      return null
    }

    DevUtils.log('cache', `Retrieved cached data for key: ${key}`)
    return entry.data
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        removedCount++
      }
    }

    if (removedCount > 0) {
      DevUtils.log('cache', `Cleared ${removedCount} expired cache entries`)
    }
  }

  /**
   * Get fallback data when API calls fail
   */
  getEmptyState<T>(type: 'posts' | 'users' | 'comments' | 'notifications'): T {
    const fallbackData = {
      posts: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_more: false
      },
      users: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_more: false
      },
      comments: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_more: false
      },
      notifications: {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        has_more: false
      }
    }

    DevUtils.warn('fallback', `Using empty state for ${type}`)
    return fallbackData[type] as T
  }

  /**
   * Create offline indicator
   */
  createOfflineIndicator(): { isOffline: boolean; message: string } {
    const isOffline = !navigator.onLine
    
    return {
      isOffline,
      message: isOffline 
        ? 'You are offline. Some features may be limited.'
        : 'Connected'
    }
  }

  /**
   * Retry failed operations with exponential backoff
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        
        if (attempt > 1) {
          DevUtils.log('retry', `Operation succeeded on attempt ${attempt}`)
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt - 1)
          DevUtils.warn('retry', `Attempt ${attempt} failed, retrying in ${delay}ms`, error)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          DevUtils.error('retry', `All ${maxRetries} attempts failed`, error)
        }
      }
    }

    throw lastError!
  }
}

export const fallbackService = new FallbackService()

// Auto-cleanup expired cache entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    fallbackService.clearExpiredCache()
  }, 10 * 60 * 1000)
}
