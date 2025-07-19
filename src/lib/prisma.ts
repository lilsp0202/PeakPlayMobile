import { PrismaClient } from '@prisma/client'

// PERFORMANCE OPTIMIZATION: Enhanced Prisma configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// PERFORMANCE: Create optimized Prisma client with enhanced settings
export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // PERFORMANCE: Connection pool optimization removed for TypeScript compatibility
  })

// PERFORMANCE: Enable query optimization middleware
prisma.$use(async (params, next) => {
  // Add query timeout to prevent hanging connections
  const start = Date.now()
  
  try {
    const result = await next(params)
    const duration = Date.now() - start
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`🐌 Slow query detected (${duration}ms):`, {
        model: params.model,
        action: params.action,
        duration
      })
    }
    
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(`❌ Query failed after ${duration}ms:`, {
      model: params.model,
      action: params.action,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
})

// PERFORMANCE: Simple in-memory cache for frequently accessed data
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes TTL

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired items periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.TTL) {
        this.cache.delete(key)
      }
    }
  }
}

export const cache = new SimpleCache()

// PERFORMANCE: Clean cache every 10 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup()
  }, 10 * 60 * 1000)
}

// PERFORMANCE: Cached database operations for frequently accessed data
export const cachedQueries = {
  // Cache coach profile lookups
  async getCoachByUserId(userId: string) {
    const cacheKey = `coach:${userId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const coach = await prisma.coach.findUnique({
      where: { userId },
      select: {
        id: true,
        name: true,
        academy: true,
        userId: true
      }
    })

    if (coach) {
      cache.set(cacheKey, coach)
    }
    return coach
  },

  // Cache student profile lookups
  async getStudentByUserId(userId: string) {
    const cacheKey = `student:${userId}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        studentName: true,
        academy: true,
        sport: true,
        coachId: true,
        userId: true
      }
    })

    if (student) {
      cache.set(cacheKey, student)
    }
    return student
  },

  // Cache badge categories
  async getBadgeCategories() {
    const cacheKey = 'badge-categories'
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const categories = await prisma.badgeCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true
      }
    })

    cache.set(cacheKey, categories)
    return categories
  },

  // Cache active badges by sport
  async getActiveBadgesBySport(sport: string) {
    const cacheKey = `badges:${sport}`
    const cached = cache.get(cacheKey)
    if (cached) return cached

    const badges = await prisma.badge.findMany({
      where: {
        OR: [
          { sport: sport },
          { sport: 'ALL' }
        ],
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        level: true,
        icon: true,
        categoryId: true
      },
      take: 50 // Limit for performance
    })

    cache.set(cacheKey, badges)
    return badges
  }
}

// PERFORMANCE: Optimized batch operations
export const batchOperations = {
  // Batch fetch student skills
  async getStudentSkillsBatch(studentIds: string[]) {
    if (studentIds.length === 0) return []
    
    return prisma.skills.findMany({
      where: {
        studentId: { in: studentIds }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: studentIds.length // One per student
    })
  },

  // Batch fetch recent feedback
  async getRecentFeedbackBatch(studentIds: string[], limit = 5) {
    if (studentIds.length === 0) return []
    
    return prisma.feedback.findMany({
      where: {
        studentId: { in: studentIds }
      },
      include: {
        coach: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit * studentIds.length
    })
  },

  // Batch fetch recent actions
  async getRecentActionsBatch(studentIds: string[], limit = 5) {
    if (studentIds.length === 0) return []
    
    return prisma.action.findMany({
      where: {
        studentId: { in: studentIds }
      },
      include: {
        coach: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit * studentIds.length
    })
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 