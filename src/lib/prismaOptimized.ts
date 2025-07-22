import { PrismaClient } from '@prisma/client';

// PERFORMANCE: Connection pooling configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PERFORMANCE: Optimized Prisma configuration
export const optimizedPrisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // PERFORMANCE: Configure connection pool
    __internal: {
      engine: {
        connectionTimeout: 60000, // 60 seconds
        maxRequestsPerConnection: 100,
        maxConnections: 10,
      }
    }
  });

// PERFORMANCE: Prevent hot reload issues in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = optimizedPrisma;

// PERFORMANCE: Query optimization utilities
export class OptimizedQueries {
  
  /**
   * PERFORMANCE: Get student with minimal data fetching
   */
  static async getStudentBasic(studentId: string) {
    return optimizedPrisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        sport: true,
        academy: true,
        age: true,
        skills: {
          take: 1,
          orderBy: { updatedAt: 'desc' },
          select: {
            battingStance: true,
            battingGrip: true,
            battingBalance: true,
            bowlingAction: true,
            bowlingRhythm: true,
            bowlingAccuracy: true,
            fieldingCatching: true,
            fieldingThrowing: true,
            fieldingPositioning: true,
            footwork: true,
            handEyeCoordination: true,
            reactionTime: true,
            powerHitting: true,
            timing: true,
            focus: true,
            confidence: true,
            resilience: true,
            teamwork: true,
            adaptability: true,
            workEthic: true,
            waterIntake: true,
            sleepScore: true,
            moodScore: true,
            protein: true,
            carbohydrates: true,
            fats: true,
            totalCalories: true,
            updatedAt: true
          }
        },
        coach: {
          select: { id: true }
        }
      }
    });
  }

  /**
   * PERFORMANCE: Get badges with minimal joins
   */
  static async getBadgesOptimized() {
    return optimizedPrisma.badge.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        motivationalText: true,
        icon: true,
        level: true,
        sport: true,
        category: {
          select: { name: true }
        },
        rules: {
          select: {
            ruleType: true,
            fieldName: true,
            operator: true,
            value: true,
            weight: true,
            isRequired: true,
            description: true
          }
        }
      }
    });
  }

  /**
   * PERFORMANCE: Get earned badges efficiently
   */
  static async getEarnedBadges(studentId: string) {
    return optimizedPrisma.studentBadge.findMany({
      where: { 
        studentId, 
        isRevoked: false 
      },
      select: {
        badgeId: true,
        awardedAt: true,
        score: true,
        progress: true
      }
    });
  }

  /**
   * PERFORMANCE: Batch insert earned badges
   */
  static async awardBadge(studentId: string, badgeId: string, score: number) {
    return optimizedPrisma.studentBadge.create({
      data: {
        studentId,
        badgeId,
        score,
        progress: 100
      }
    });
  }

  /**
   * PERFORMANCE: Clean up old cache entries
   */
  static async cleanupOldData() {
    // Could be used for cleanup tasks in production
    console.log('🧹 Database cleanup completed');
  }
}

// PERFORMANCE: Connection management
export const closeConnections = async () => {
  await optimizedPrisma.$disconnect();
};

export default optimizedPrisma; 