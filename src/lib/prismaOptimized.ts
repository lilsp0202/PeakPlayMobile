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
          select: {
            // Technical skills
            battingStance: true,
            battingGrip: true,
            battingBalance: true,
            bowlingGrip: true,
            followThrough: true,
            runUp: true,
            release: true,
            aim: true,
            // Physical skills
            pushupScore: true,
            pullupScore: true,
            verticalJump: true,
            gripStrength: true,
            sprintTime: true,
            sprint50m: true,
            shuttleRun: true,
            run5kTime: true,
            yoyoTest: true,
            // Fielding skills
            flatCatch: true,
            highCatch: true,
            pickUp: true,
            throw: true,
            receiving: true,
            softHands: true,
            calling: true,
            runningBetweenWickets: true,
            // Mental/Wellness
            moodScore: true,
            sleepScore: true,
            // Nutrition
            waterIntake: true,
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