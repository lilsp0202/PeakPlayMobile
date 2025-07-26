// PERFORMANCE: API Response Caching System
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  /**
   * PERFORMANCE: Get cached data or return null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * PERFORMANCE: Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  /**
   * PERFORMANCE: Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * PERFORMANCE: Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * PERFORMANCE: Get cache statistics
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * PERFORMANCE: Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// PERFORMANCE: Global cache instance
export const apiCache = new APICache();

/**
 * PERFORMANCE: Cache decorator for API functions
 */
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300000 // 5 minutes default
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Check cache first
      const cached = apiCache.get<T>(key);
      if (cached !== null) {
        console.log(`⚡ Cache hit for: ${key}`);
        resolve(cached);
        return;
      }

      // Fetch fresh data
      console.log(`🔄 Cache miss, fetching: ${key}`);
      const data = await fetcher();
      
      // Cache the result
      apiCache.set(key, data, ttl);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * PERFORMANCE: Cached API helper functions
 */
export class CachedAPI {
  
  /**
   * PERFORMANCE: Cache student skills data
   */
  static async getStudentSkills(studentId: string): Promise<any> {
    return withCache(
      `student_skills_${studentId}`,
      async () => {
        const response = await fetch(`/api/skills?studentId=${studentId}`);
        return response.json();
      },
      180000 // 3 minutes cache for skills
    );
  }

  /**
   * PERFORMANCE: Cache badge progress data
   */
  static async getBadgeProgress(studentId: string): Promise<any> {
    return withCache(
      `badge_progress_${studentId}`,
      async () => {
        const response = await fetch(`/api/badges?type=progress&studentId=${studentId}`);
        return response.json();
      },
      300000 // 5 minutes cache for badge progress
    );
  }

  /**
   * PERFORMANCE: Cache teams data
   */
  static async getTeamsData(includeMembers: boolean = true): Promise<any> {
    return withCache(
      `teams_data_${includeMembers}`,
      async () => {
        const response = await fetch(`/api/teams?includeMembers=${includeMembers}&includeStats=true`);
        return response.json();
      },
      600000 // 10 minutes cache for teams
    );
  }

  /**
   * PERFORMANCE: Cache feedback data
   */
  static async getFeedbackData(): Promise<any> {
    return withCache(
      'feedback_data',
      async () => {
        const response = await fetch('/api/feedback');
        return response.json();
      },
      240000 // 4 minutes cache for feedback
    );
  }

  /**
   * PERFORMANCE: Cache hooper index data
   */
  static async getHooperIndex(): Promise<any> {
    return withCache(
      'hooper_index',
      async () => {
        const response = await fetch('/api/hooper-index');
        return response.json();
      },
      900000 // 15 minutes cache for hooper index
    );
  }

  /**
   * PERFORMANCE: Invalidate specific cache entries
   */
  static invalidateStudentCache(studentId: string): void {
    apiCache.delete(`student_skills_${studentId}`);
    apiCache.delete(`badge_progress_${studentId}`);
    console.log(`🧹 Invalidated cache for student: ${studentId}`);
  }

  /**
   * PERFORMANCE: Invalidate teams cache
   */
  static invalidateTeamsCache(): void {
    apiCache.delete('teams_data_true');
    apiCache.delete('teams_data_false');
    console.log('🧹 Invalidated teams cache');
  }

  /**
   * PERFORMANCE: Invalidate feedback cache
   */
  static invalidateFeedbackCache(): void {
    apiCache.delete('feedback_data');
    console.log('🧹 Invalidated feedback cache');
  }
}

// PERFORMANCE: Automatic cache cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
    console.log('🧹 Automatic cache cleanup completed');
  }, 600000); // 10 minutes
}

export default apiCache; 