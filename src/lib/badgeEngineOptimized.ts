import { prisma } from './prisma';

interface BadgeProgress {
  badgeId: string;
  badgeName: string;
  level: number;
  category: string;
  progress: number;
  description: string;
  motivationalText: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
}

interface BadgeEvaluationContext {
  studentId: string;
}

// PERFORMANCE: In-memory cache for badge data
const badgeCache = new Map<string, any>();
const studentDataCache = new Map<string, any>();
const CACHE_TTL = 300000; // 5 minutes cache

export class OptimizedBadgeEngine {
  
  /**
   * PERFORMANCE OPTIMIZED: Get badge progress with aggressive caching and parallelization
   * Target: <500ms response time (down from 2780ms)
   */
  static async getBadgeProgressOptimized(studentId: string): Promise<BadgeProgress[]> {
    try {
      console.log('🚀 OptimizedBadgeEngine - Starting optimized evaluation for:', studentId);
      const startTime = Date.now();
      
      // PERFORMANCE: Check cache first
      const cacheKey = `badge_progress_${studentId}`;
      const cachedData = studentDataCache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
        console.log('⚡ Cache hit for badge progress:', (Date.now() - startTime) + 'ms');
        return cachedData.data;
      }

      // PERFORMANCE: Parallel data fetching with optimized queries
      const [student, badges, earnedBadges] = await Promise.all([
        // Optimized student query - only fetch necessary fields
        prisma.student.findUnique({
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
        }),
        
        // Optimized badges query with caching
        this.getCachedBadges(),
        
        // Pre-fetch earned badges
        prisma.studentBadge.findMany({
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
        })
      ]);

      if (!student) {
        console.log('❌ Student not found:', studentId);
        return [];
      }

      const skills = student.skills;
      if (!skills) {
        console.log('⚠️ No skills data found for student:', studentId);
        return [];
      }

      // PERFORMANCE: Filter relevant badges efficiently
      const relevantBadges = badges.filter(badge => {
        if (badge.sport !== 'ALL' && badge.sport !== student.sport) return false;
        if (!badge.description.includes('|||COACH_CREATED:')) return true;
        return student.coach && badge.description.includes(`|||COACH_CREATED:${student.coach.id}`);
      });

      console.log(`📊 Processing ${relevantBadges.length} relevant badges for ${student.sport}`);

      // PERFORMANCE: Pre-calculate earned badges map
      const earnedBadgesMap = new Map(earnedBadges.map(eb => [eb.badgeId, eb]));

      // PERFORMANCE: Process badges in batches to avoid memory issues
      const batchSize = 8;
      const progress: BadgeProgress[] = [];
      
      for (let i = 0; i < relevantBadges.length; i += batchSize) {
        const batch = relevantBadges.slice(i, i + batchSize);
        
        const batchResults = await Promise.all(
          batch.map(async (badge) => {
            const earnedBadge = earnedBadgesMap.get(badge.id);
            
            if (earnedBadge) {
              return {
                badgeId: badge.id,
                badgeName: badge.name,
                level: badge.level,
                category: badge.category.name,
                progress: 100,
                description: badge.description.split('|||')[0],
                motivationalText: badge.motivationalText,
                icon: badge.icon,
                earned: true,
                earnedAt: earnedBadge.awardedAt
              };
            }

            // PERFORMANCE: Use optimized rule evaluation
            const evaluation = await this.evaluateBadgeRulesOptimized(badge.rules, skills, studentId);
            
            return {
              badgeId: badge.id,
              badgeName: badge.name,
              level: badge.level,
              category: badge.category.name,
              progress: evaluation.progress,
              description: badge.description.split('|||')[0],
              motivationalText: badge.motivationalText,
              icon: badge.icon,
              earned: evaluation.earned,
              earnedAt: evaluation.earned ? new Date() : undefined
            };
          })
        );
        
        progress.push(...batchResults);
      }

      // PERFORMANCE: Cache the results
      studentDataCache.set(cacheKey, {
        data: progress,
        timestamp: Date.now()
      });

      const totalTime = Date.now() - startTime;
      console.log(`✅ OptimizedBadgeEngine completed in ${totalTime}ms (target: <500ms)`);

      return progress;
    } catch (error) {
      console.error('❌ OptimizedBadgeEngine error:', error);
      throw error;
    }
  }

  /**
   * PERFORMANCE: Cached badge loading with optimized queries
   */
  private static async getCachedBadges(): Promise<any[]> {
    const cacheKey = 'all_badges';
    const cachedBadges = badgeCache.get(cacheKey);
    
    if (cachedBadges && (Date.now() - cachedBadges.timestamp) < CACHE_TTL) {
      return cachedBadges.data;
    }

    // PERFORMANCE: Optimized badge query - only fetch necessary data
    const badges = await prisma.badge.findMany({
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

    badgeCache.set(cacheKey, {
      data: badges,
      timestamp: Date.now()
    });

    return badges;
  }

  /**
   * PERFORMANCE: Optimized rule evaluation with minimal database queries
   * NOW WITH PARTIAL PROGRESS CALCULATION
   */
  private static async evaluateBadgeRulesOptimized(
    rules: any[], 
    skills: any, 
    studentId: string
  ): Promise<{ progress: number; earned: boolean; score: number }> {
    let totalScore = 0;
    let maxScore = 0;
    let requiredRulesPassed = 0;
    let totalRequiredRules = 0;

    for (const rule of rules) {
      maxScore += rule.weight;
      if (rule.isRequired) totalRequiredRules++;

      let ruleProgress = 0; // Change from boolean to progress percentage
      let rulePassed = false;

      try {
        switch (rule.ruleType) {
          case 'SKILLS_METRIC':
            const skillsResult = this.evaluateSkillsMetricWithProgress(rule, skills);
            ruleProgress = skillsResult.progress;
            rulePassed = skillsResult.passed;
            break;
          case 'SKILLS_AVERAGE':
            const avgResult = this.evaluateSkillsAverageWithProgress(rule, skills);
            ruleProgress = avgResult.progress;
            rulePassed = avgResult.passed;
            break;
          case 'WELLNESS_STREAK':
            // Keep original boolean logic for non-metric rules
            rulePassed = this.evaluateWellnessStreak(rule, skills);
            ruleProgress = rulePassed ? 100 : 0;
            break;
          default:
            // PERFORMANCE: Skip complex queries for now, focus on skills-based badges
            ruleProgress = 0;
            rulePassed = false;
        }
      } catch (error) {
        console.error(`Rule evaluation error for ${rule.ruleType}:`, error);
        ruleProgress = 0;
        rulePassed = false;
      }

      // Add weighted partial score instead of all-or-nothing
      totalScore += (ruleProgress / 100) * rule.weight;
      
      if (rulePassed && rule.isRequired) {
        requiredRulesPassed++;
      }
    }

    const progress = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const earned = totalRequiredRules > 0 ? 
      (requiredRulesPassed === totalRequiredRules) : 
      (progress >= 100); // Full completion required for earning

    return { progress, earned, score: totalScore };
  }

  /**
   * PERFORMANCE: Fast skills metric evaluation
   */
  private static evaluateSkillsMetric(rule: any, skills: any): boolean {
    if (!skills) return false;
    
    const fieldValue = skills[rule.fieldName];
    if (!fieldValue || fieldValue === 0) return false;
    
    const numericValue = parseFloat(fieldValue);
    const targetValue = parseFloat(rule.value);

    switch (rule.operator.toUpperCase()) {
      case 'GT': return numericValue > targetValue;
      case 'GTE': return numericValue >= targetValue;
      case 'LT': return numericValue < targetValue;
      case 'LTE': return numericValue <= targetValue;
      case 'EQ': return numericValue === targetValue;
      default: return false;
    }
  }

  /**
   * PERFORMANCE: Fast skills average evaluation
   */
  private static evaluateSkillsAverage(rule: any, skills: any): boolean {
    if (!skills) return false;

    const skillFields = [
      'battingStance', 'battingGrip', 'battingBalance',
      'bowlingGrip', 'followThrough', 'runUp',
      'flatCatch', 'highCatch', 'pickUp', 'throw'
    ];

    const values = skillFields
      .map(field => skills[field])
      .filter(value => value && value > 0);

    if (values.length === 0) return false;

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const targetValue = parseFloat(rule.value);

    return average >= targetValue;
  }

  /**
   * PERFORMANCE: Fast wellness streak evaluation
   */
  private static evaluateWellnessStreak(rule: any, skills: any): boolean {
    if (!skills) return false;

    // Simplified wellness check based on current skills data
    const wellnessFields = ['waterIntake', 'sleepScore', 'moodScore'];
    const allWellnessGood = wellnessFields.every(field => {
      const value = skills[field];
      return value && value >= 7; // Simplified threshold
    });

    return allWellnessGood;
  }

  /**
   * PERFORMANCE: Clear cache when needed
   */
  static clearCache(): void {
    badgeCache.clear();
    studentDataCache.clear();
    console.log('🧹 BadgeEngine cache cleared');
  }

  /**
   * PERFORMANCE: Get cache statistics
   */
  static getCacheStats(): { badgeCache: number; studentCache: number } {
    return {
      badgeCache: badgeCache.size,
      studentCache: studentDataCache.size
    };
  }

  /**
   * NEW: Calculate partial progress for skills metrics
   */
  private static evaluateSkillsMetricWithProgress(rule: any, skills: any): { progress: number; passed: boolean } {
    if (!skills) return { progress: 0, passed: false };
    
    const fieldValue = skills[rule.fieldName];
    if (!fieldValue || fieldValue === 0) return { progress: 0, passed: false };
    
    const numericValue = parseFloat(fieldValue);
    const targetValue = parseFloat(rule.value);
    let progress = 0;
    let passed = false;

    switch (rule.operator.toUpperCase()) {
      case 'GT':
        passed = numericValue > targetValue;
        progress = Math.min(100, Math.max(0, (numericValue / targetValue) * 100));
        break;
      case 'GTE':
        passed = numericValue >= targetValue;
        progress = Math.min(100, Math.max(0, (numericValue / targetValue) * 100));
        break;
      case 'LT':
        passed = numericValue < targetValue;
        // For "less than" goals, progress is inverse (closer to target = higher progress)
        if (numericValue > targetValue) {
          progress = 0; // If above target, no progress
        } else {
          progress = Math.min(100, Math.max(0, ((targetValue - numericValue) / targetValue) * 100));
        }
        break;
      case 'LTE':
        passed = numericValue <= targetValue;
        // For "less than or equal" goals
        if (numericValue > targetValue) {
          progress = 0;
        } else {
          progress = Math.min(100, Math.max(0, ((targetValue - numericValue) / targetValue) * 100));
        }
        break;
      case 'EQ':
        passed = numericValue === targetValue;
        // For equality, progress based on how close to target
        const difference = Math.abs(numericValue - targetValue);
        const tolerance = targetValue * 0.1; // 10% tolerance
        progress = Math.max(0, 100 - ((difference / tolerance) * 100));
        break;
      default:
        return { progress: 0, passed: false };
    }

    return { progress: Math.round(progress), passed };
  }

  /**
   * NEW: Calculate partial progress for skills averages
   */
  private static evaluateSkillsAverageWithProgress(rule: any, skills: any): { progress: number; passed: boolean } {
    if (!skills) return { progress: 0, passed: false };

    const skillFields = [
      'battingStance', 'battingGrip', 'battingBalance',
      'bowlingGrip', 'followThrough', 'runUp',
      'flatCatch', 'highCatch', 'pickUp', 'throw'
    ];

    const values = skillFields
      .map(field => skills[field])
      .filter(value => value && value > 0);

    if (values.length === 0) return { progress: 0, passed: false };

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const targetValue = parseFloat(rule.value);
    
    const passed = average >= targetValue;
    const progress = Math.min(100, Math.max(0, (average / targetValue) * 100));

    return { progress: Math.round(progress), passed };
  }
} 