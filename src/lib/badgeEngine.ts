import { prisma } from '@/lib/prisma';

export interface BadgeEvaluationContext {
  studentId: string;
  skills?: any;
  matchPerformances?: any[];
  feedback?: any[];
  currentDate?: Date;
}

export interface BadgeProgress {
  badgeId: string;
  badgeName: string;
  level: string;
  category: string;
  progress: number;
  description: string;
  motivationalText: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
}

export class BadgeEngine {
  
  static async evaluateStudentBadges(context: BadgeEvaluationContext): Promise<{
    newBadges: string[],
    updatedProgress: BadgeProgress[]
  }> {
    const { studentId } = context;
    const newBadges: string[] = [];
    const updatedProgress: BadgeProgress[] = [];

    try {
      console.log('BadgeEngine - Starting evaluation for student:', studentId);
      
      // Get student data including skills
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          skills: true,
          coach: true, // Include coach information for filtering coach-created badges
          badges: {
            include: { badge: true }
          }
        }
      });

      if (!student) {
        console.log('BadgeEngine - Student not found:', studentId);
        throw new Error('Student not found');
      }

      console.log('BadgeEngine - Student found:', {
        id: student.id,
        name: student.studentName,
        sport: student.sport,
        hasSkills: !!student.skills,
        existingBadges: student.badges.length,
        hasCoach: !!student.coach
      });

      // Get all active badges for the student's sport
      const badges = await prisma.badge.findMany({
        where: {
          OR: [
            { sport: student.sport },
            { sport: 'ALL' }
          ],
          isActive: true
        },
        include: {
          rules: true,
          category: true,
          studentBadges: {
            where: { studentId }
          }
        }
      });

      // Filter badges based on coach-student relationships
      const relevantBadges = badges.filter(badge => {
        // If it's a system badge (no coach marker), include it
        if (!badge.description.includes('|||COACH_CREATED:')) {
          return true;
        }
        
        // If it's a coach-created badge, only include if it was created by this student's coach
        if (student.coach) {
          return badge.description.includes(`|||COACH_CREATED:${student.coach.id}`);
        }
        
        // If student has no coach, exclude all coach-created badges
        return false;
      });

      console.log('BadgeEngine - Found badges for evaluation:', {
        total: badges.length,
        relevant: relevantBadges.length,
        sport: student.sport,
        badgeNames: relevantBadges.map(b => b.name)
      });

      // Evaluate each badge
      for (const badge of relevantBadges) {
        console.log('BadgeEngine - Evaluating badge:', badge.name);
        
        const existingBadge = badge.studentBadges.find(sb => !sb.isRevoked);
        
        if (existingBadge) {
          console.log('BadgeEngine - Badge already earned:', badge.name);
          // Badge already earned and not revoked
          continue;
        }

        console.log('BadgeEngine - Badge not yet earned, evaluating rules:', {
          badgeName: badge.name,
          ruleCount: badge.rules.length,
          rules: badge.rules.map(r => ({
            ruleType: r.ruleType,
            fieldName: r.fieldName,
            operator: r.operator,
            value: r.value,
            weight: r.weight,
            isRequired: r.isRequired
          }))
        });

        const evaluation = await this.evaluateBadge(badge, student);
        
        console.log('BadgeEngine - Badge evaluation result:', {
          badgeName: badge.name,
          earned: evaluation.earned,
          progress: evaluation.progress,
          score: evaluation.score
        });
        
        if (evaluation.earned) {
          console.log('BadgeEngine - Awarding badge:', badge.name);
          // Award the badge
          await prisma.studentBadge.create({
            data: {
              studentId,
              badgeId: badge.id,
              score: evaluation.score,
              progress: 100
            }
          });
          
          newBadges.push(badge.id);
        }

        // Track progress regardless of earning
        updatedProgress.push({
          badgeId: badge.id,
          badgeName: badge.name,
          level: badge.level,
          category: badge.category.name,
          progress: evaluation.progress,
          description: badge.description,
          motivationalText: badge.motivationalText,
          icon: badge.icon,
          earned: evaluation.earned,
          earnedAt: evaluation.earned ? new Date() : undefined
        });
      }

      console.log('BadgeEngine - Evaluation complete:', {
        newBadges: newBadges.length,
        totalProgress: updatedProgress.length
      });

      return { newBadges, updatedProgress };
    } catch (error) {
      console.error('BadgeEngine - Error during evaluation:', error);
      throw error;
    }
  }

  private static async evaluateBadge(badge: any, student: any): Promise<{
    earned: boolean,
    progress: number,
    score: number
  }> {
    const { rules } = badge;
    const skills = student.skills;

    let totalScore = 0;
    let maxScore = 0;
    let requiredRulesPassed = 0;
    let totalRequiredRules = 0;

    console.log('BadgeEngine - Evaluating badge rules:', {
      badgeName: badge.name,
      ruleCount: rules.length
    });

    for (const rule of rules) {
      const { ruleType, fieldName, operator, value, weight, isRequired, description } = rule;
      
      if (isRequired) {
        totalRequiredRules++;
      }
      
      maxScore += weight;

      let ruleResult = false;

      console.log('BadgeEngine - Rule evaluation:', {
        ruleType,
        fieldName,
        operator,
        value,
        weight,
        isRequired
      });

      switch (ruleType) {
        case 'SKILLS_METRIC':
          if (!skills) {
            console.log('BadgeEngine - No skills data for SKILLS_METRIC rule');
            continue;
          }
          const fieldValue = skills[fieldName];
          if (fieldValue === null || fieldValue === undefined || fieldValue === 0) {
            console.log('BadgeEngine - Field value is null/undefined/zero (no input), skipping rule');
            continue;
          }
          ruleResult = this.evaluateRule(fieldValue, operator, value);
          break;

        case 'MATCH_COUNT':
          // Get match count based on fieldName
          const matchCount = await this.getMatchCount(student.id, fieldName);
          ruleResult = this.evaluateRule(matchCount, operator, value);
          break;

        case 'MATCH_STAT':
          // Get match statistic
          const matchStat = await this.getMatchStat(student.id, fieldName);
          ruleResult = this.evaluateRule(matchStat, operator, value);
          break;

        case 'WELLNESS_STREAK':
          // Check wellness streak
          const streakDays = await this.getWellnessStreak(student.id, fieldName, parseFloat(value), description);
          ruleResult = streakDays > 0;
          break;

        case 'MATCH_STREAK':
          // Check match performance streak
          const matchStreak = await this.getMatchStreak(student.id, fieldName, parseFloat(value), description);
          ruleResult = matchStreak > 0;
          break;

        case 'SKILLS_AVERAGE':
          // Check skills average over time
          const skillsAvg = await this.getSkillsAverage(student.id, description);
          ruleResult = this.evaluateRule(skillsAvg, operator, value);
          break;

        case 'SKILLS_ANY':
          // Check if any skill meets criteria
          if (!skills) continue;
          ruleResult = await this.checkAnySkill(skills, operator, value);
          break;

        case 'FITNESS_PERCENTILE':
          // Check fitness percentile
          const percentile = await this.getFitnessPercentile(student);
          ruleResult = this.evaluateRule(percentile, operator, value);
          break;

        case 'MATCH_AVERAGE':
          // Check match rating average
          const matchAvg = await this.getMatchAverage(student.id, fieldName, description);
          ruleResult = this.evaluateRule(matchAvg, operator, value);
          break;

        case 'PEAKSCORE_PERCENTILE':
          // Check PeakScore percentile
          const peakPercentile = await this.getPeakScorePercentile(student);
          ruleResult = this.evaluateRule(peakPercentile, operator, value);
          break;

        default:
          console.warn('BadgeEngine - Unknown rule type:', ruleType);
      }

      console.log('BadgeEngine - Rule result:', {
        ruleType,
        fieldName,
        passed: ruleResult,
        operator,
        targetValue: value
      });

      if (ruleResult) {
        totalScore += weight;
        if (isRequired) {
          requiredRulesPassed++;
        }
      }
    }

    // Calculate progress percentage
    const progress = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    // Badge is earned if all required rules pass
    const earned = totalRequiredRules > 0 ? requiredRulesPassed === totalRequiredRules : progress >= 100;

    console.log('BadgeEngine - Final evaluation:', {
      badgeName: badge.name,
      totalScore,
      maxScore,
      requiredRulesPassed,
      totalRequiredRules,
      progress,
      earned
    });

    return {
      earned,
      progress,
      score: totalScore
    };
  }

  private static evaluateRule(fieldValue: any, operator: string, targetValue: string): boolean {
    const numericValue = parseFloat(fieldValue);
    const numericTarget = parseFloat(targetValue);

    console.log('BadgeEngine - Evaluating rule condition:', {
      fieldValue,
      numericValue,
      operator,
      targetValue,
      numericTarget
    });

    switch (operator.toUpperCase()) {
      case 'GT':
        return numericValue > numericTarget;
      case 'GTE':
        return numericValue >= numericTarget;
      case 'LT':
        return numericValue < numericTarget;
      case 'LTE':
        return numericValue <= numericTarget;
      case 'EQ':
        return numericValue === numericTarget;
      case 'NEQ':
        return numericValue !== numericTarget;
      case 'BETWEEN':
        const [min, max] = targetValue.split(',').map(v => parseFloat(v.trim()));
        return numericValue >= min && numericValue <= max;
      default:
        console.warn('BadgeEngine - Unknown operator:', operator);
        return false;
    }
  }

  static async getStudentBadges(studentId: string) {
    return await prisma.studentBadge.findMany({
      where: {
        studentId,
        isRevoked: false
      },
      include: {
        badge: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        awardedAt: 'desc'
      }
    });
  }

  static async getBadgeProgress(studentId: string): Promise<BadgeProgress[]> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        skills: true,
        coach: {
          select: { id: true, name: true }
        }
      }
    });

    if (!student) return [];

    // PERFORMANCE OPTIMIZATION: Batch fetch all necessary data in parallel
    const [badges, matchPerformances, skillHistory] = await Promise.all([
      prisma.badge.findMany({
        where: {
          OR: [
            { sport: student.sport },
            { sport: 'ALL' }
          ],
          isActive: true
        },
        include: {
          rules: {
            take: 10 // PERFORMANCE: Limit rules per badge
          },
          category: {
            select: { name: true }
          },
          studentBadges: {
            where: { studentId, isRevoked: false },
            select: { 
              id: true, 
              awardedAt: true, 
              score: true, 
              progress: true 
            }
          }
        }
      }),
      prisma.matchPerformance.findMany({
        where: { studentId },
        include: { 
          match: {
            select: {
              matchDate: true,
              result: true
            }
          }
        },
        orderBy: { match: { matchDate: 'desc' } },
        take: 10 // PERFORMANCE: Limit to recent matches only
      }),
      prisma.skillHistory.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
        take: 15 // PERFORMANCE: Limit skill history
      })
    ]);

    // PERFORMANCE OPTIMIZATION: Filter badges efficiently
    const relevantBadges = badges.filter(badge => {
      if (!badge.description.includes('|||COACH_CREATED:')) {
        return true;
      }
      if (student.coach) {
        return badge.description.includes(`|||COACH_CREATED:${student.coach.id}`);
      }
      return false;
    });

    // PERFORMANCE OPTIMIZATION: Pre-calculate student data for faster evaluation
    const latestSkills = student.skills?.[0];
    const studentData = {
      skills: latestSkills,
      matchPerformances,
      skillHistory,
      sport: student.sport,
      academy: student.academy,
      age: student.age,
      weight: student.weight,
      height: student.height
    };

    const progress: BadgeProgress[] = [];

    // PERFORMANCE OPTIMIZATION: Process badges in smaller batches to avoid timeouts
    const batchSize = 5;
    for (let i = 0; i < relevantBadges.length; i += batchSize) {
      const batch = relevantBadges.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (badge) => {
        const earnedBadge = badge.studentBadges.find((sb: any) => !sb.isRevoked);
        
        if (earnedBadge) {
          return {
            badgeId: badge.id,
            badgeName: badge.name,
            level: badge.level,
            category: badge.category.name,
            progress: 100,
            description: badge.description.split('|||')[0], // Clean description
            motivationalText: badge.motivationalText,
            icon: badge.icon,
            earned: true,
            earnedAt: earnedBadge.awardedAt
          };
        } else {
          // PERFORMANCE: Use optimized evaluation with pre-fetched data
          const evaluation = await this.evaluateBadgeOptimized(badge, studentData);
          
          if (evaluation.earned) {
            try {
              const newBadge = await prisma.studentBadge.create({
                data: {
                  studentId,
                  badgeId: badge.id,
                  score: evaluation.score,
                  progress: 100
                }
              });
              
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
                earnedAt: newBadge.awardedAt
              };
            } catch (error) {
              console.error('Error awarding badge:', error);
              return {
                badgeId: badge.id,
                badgeName: badge.name,
                level: badge.level,
                category: badge.category.name,
                progress: evaluation.progress,
                description: badge.description.split('|||')[0],
                motivationalText: badge.motivationalText,
                icon: badge.icon,
                earned: false
              };
            }
          } else {
            return {
              badgeId: badge.id,
              badgeName: badge.name,
              level: badge.level,
              category: badge.category.name,
              progress: evaluation.progress,
              description: badge.description.split('|||')[0],
              motivationalText: badge.motivationalText,
              icon: badge.icon,
              earned: false
            };
          }
        }
      });

      const batchResults = await Promise.all(batchPromises);
      progress.push(...batchResults);
    }

    return progress;
  }

  static async revokeBadge(studentBadgeId: string, revokedBy: string, reason: string) {
    return await prisma.studentBadge.update({
      where: { id: studentBadgeId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedBy,
        revokeReason: reason
      }
    });
  }

  // New method for automatic evaluation of all students
  static async evaluateAllStudents(): Promise<{
    studentsEvaluated: number,
    totalNewBadges: number,
    errors: string[]
  }> {
    console.log('BadgeEngine - Starting automatic evaluation of all students');
    
    const students = await prisma.student.findMany({
      include: { skills: true }
    });

    let studentsEvaluated = 0;
    let totalNewBadges = 0;
    const errors: string[] = [];

    for (const student of students) {
      try {
        if (!student.skills) {
          console.log(`BadgeEngine - Skipping student ${student.studentName} - no skills data`);
          continue;
        }

        const result = await this.evaluateStudentBadges({
          studentId: student.id,
          skills: student.skills
        });

        studentsEvaluated++;
        totalNewBadges += result.newBadges.length;

        if (result.newBadges.length > 0) {
          console.log(`BadgeEngine - Awarded ${result.newBadges.length} new badges to ${student.studentName}`);
        }
      } catch (error) {
        const errorMsg = `Error evaluating student ${student.studentName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error('BadgeEngine -', errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log('BadgeEngine - Automatic evaluation complete:', {
      studentsEvaluated,
      totalNewBadges,
      errors: errors.length
    });

    return {
      studentsEvaluated,
      totalNewBadges,
      errors
    };
  }

  // Helper methods for new rule types
  private static async getMatchCount(studentId: string, fieldName: string): Promise<number> {
    const performances = await prisma.matchPerformance.findMany({
      where: { studentId },
      include: { match: true }
    });

    switch (fieldName) {
      case 'matchesPlayed':
        return performances.filter(p => p.played).length;
      case 'matchesWon':
        return performances.filter(p => p.match.result === 'WIN').length;
      case 'fieldingPerformances':
        return performances.length;
      default:
        return 0;
    }
  }

  private static async getMatchStat(studentId: string, fieldName: string): Promise<number> {
    const performances = await prisma.matchPerformance.findMany({
      where: { studentId }
    });

    let maxValue = 0;
    for (const perf of performances) {
      try {
        const stats = JSON.parse(perf.stats);
        const value = stats[fieldName] || 0;
        if (value > maxValue) maxValue = value;
      } catch (e) {
        console.error('Error parsing match stats:', e);
      }
    }
    return maxValue;
  }

  // PERFORMANCE OPTIMIZATION: Optimized badge evaluation using pre-fetched data
  private static async evaluateBadgeOptimized(badge: any, studentData: any): Promise<{ score: number; progress: number; earned: boolean }> {
    const rules = badge.rules;
    let totalScore = 0;
    let maxScore = 0;
    let requiredRulesPassed = 0;
    let totalRequiredRules = 0;

    for (const rule of rules) {
      maxScore += rule.weight;
      if (rule.isRequired) totalRequiredRules++;

      let passed = false;
      
      try {
        switch (rule.ruleType) {
          case 'SKILLS_METRIC':
            passed = this.evaluateSkillsMetricOptimized(rule, studentData.skills);
            break;
          case 'SKILLS_AVERAGE':
            passed = this.evaluateSkillsAverageOptimized(rule, studentData.skills);
            break;
          case 'WELLNESS_STREAK':
            passed = this.evaluateWellnessStreakOptimized(rule, studentData.skillHistory);
            break;
          case 'MATCH_AVERAGE':
            passed = this.evaluateMatchAverageOptimized(rule, studentData.matchPerformances);
            break;
          case 'MATCH_STAT':
            passed = this.evaluateMatchStatOptimized(rule, studentData.matchPerformances);
            break;
          case 'MATCH_STREAK':
            passed = this.evaluateMatchStreakOptimized(rule, studentData.matchPerformances);
            break;
          case 'PEAKSCORE_PERCENTILE':
            passed = this.evaluatePeakScoreOptimized(rule, studentData);
            break;
          default:
            console.log('BadgeEngine - Unknown rule type:', rule.ruleType);
            passed = false;
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.ruleType}:`, error);
        passed = false;
      }

      if (passed) {
        totalScore += rule.weight;
        if (rule.isRequired) requiredRulesPassed++;
      }
    }

    const progress = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const earned = totalRequiredRules > 0 ? 
      (requiredRulesPassed === totalRequiredRules) : 
      (progress >= 80); // PERFORMANCE: Simplified earning criteria

    return { score: totalScore, progress, earned };
  }

  // PERFORMANCE OPTIMIZATION: Efficient rule evaluation methods
  private static evaluateSkillsMetricOptimized(rule: any, skills: any): boolean {
    if (!skills) return false;
    const fieldValue = skills[rule.fieldName];
    if (!fieldValue || fieldValue === 0) return false;
    return this.evaluateRule(fieldValue, rule.operator, rule.value);
  }

  private static evaluateSkillsAverageOptimized(rule: any, skills: any): boolean {
    if (!skills) return false;
    
    const technicalSkills = [
      'battingStance', 'battingGrip', 'battingBalance', 'bowlingGrip', 
      'throw', 'flatCatch', 'highCatch', 'receiving'
    ];

    const values = technicalSkills
      .map(field => skills[field])
      .filter(val => val && val > 0);

    if (values.length === 0) return false;
    
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return this.evaluateRule(average, rule.operator, rule.value);
  }

  private static evaluateWellnessStreakOptimized(rule: any, skillHistory: any[]): boolean {
    if (!skillHistory || skillHistory.length === 0) return false;
    
    const targetValue = parseFloat(rule.value);
    const recentEntries = skillHistory.slice(0, 5); // Check recent 5 entries only
    
    if (rule.fieldName === 'waterIntake') {
      return recentEntries.length >= 3 && 
        recentEntries.every(entry => entry.wellnessScore && entry.wellnessScore >= targetValue);
    }
    
    return false;
  }

  private static evaluateMatchAverageOptimized(rule: any, matchPerformances: any[]): boolean {
    if (!matchPerformances || matchPerformances.length === 0) return false;
    
    const ratings = matchPerformances
      .map(p => p.rating)
      .filter(rating => rating && rating > 0);
      
    if (ratings.length === 0) return false;
    
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return this.evaluateRule(average, rule.operator, rule.value);
  }

  private static evaluateMatchStatOptimized(rule: any, matchPerformances: any[]): boolean {
    if (!matchPerformances || matchPerformances.length === 0) return false;
    
    let maxValue = 0;
    for (const performance of matchPerformances) {
      try {
        if (performance.stats) {
          const stats = typeof performance.stats === 'string' ? 
            JSON.parse(performance.stats) : performance.stats;
          const value = stats[rule.fieldName];
          if (value && value > maxValue) {
            maxValue = value;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return maxValue >= parseFloat(rule.value);
  }

  private static evaluateMatchStreakOptimized(rule: any, matchPerformances: any[]): boolean {
    const count = parseInt(rule.description?.match(/\d+/)?.[0] || '3');
    if (count === 0 || !matchPerformances || matchPerformances.length < count) return false;

    const recentMatches = matchPerformances.slice(0, count);
    const targetValue = parseFloat(rule.value);

    return recentMatches.every(p => {
      if (rule.fieldName === 'matchRating') {
        return p.rating && p.rating >= targetValue;
      }
      try {
        if (p.stats) {
          const stats = typeof p.stats === 'string' ? JSON.parse(p.stats) : p.stats;
          const value = stats[rule.fieldName];
          return value && value >= targetValue;
        }
      } catch (e) {
        return false;
      }
      return false;
    });
  }

  private static evaluatePeakScoreOptimized(rule: any, studentData: any): boolean {
    const skills = studentData.skills;
    if (!skills) return false;
    
    // PERFORMANCE: Simplified PeakScore calculation
    const technicalFields = ['battingStance', 'battingGrip', 'battingBalance'];
    const technicalValues = technicalFields
      .map(field => skills[field])
      .filter(v => v && v > 0);
    
    if (technicalValues.length === 0) return false;
    
    const technicalAvg = technicalValues.reduce((sum, val) => sum + val, 0) / technicalValues.length;
    const peakScore = Math.min(technicalAvg * 10, 100); // Simple approximation
    
    return peakScore >= parseFloat(rule.value);
  }

  private static async getWellnessStreak(studentId: string, fieldName: string, targetValue: number, description?: string): Promise<number> {
    const days = parseInt(description?.match(/\d+/)?.[0] || '0');
    if (days === 0) return 0;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const skills = await prisma.skills.findMany({
      where: {
        studentId,
        updatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: days // Limit results for performance
    });

    if (skills.length < days) return 0;

    // Check if all wellness metrics meet criteria
    if (fieldName === 'allMetrics') {
      return skills.every(s => 
        s.waterIntake && s.sleepScore && s.moodScore && 
        s.protein && s.carbohydrates && s.fats && s.totalCalories
      ) ? days : 0;
    }

    // Check specific metric
    return skills.every(s => {
      const value = (s as any)[fieldName];
      return value && value >= targetValue;
    }) ? days : 0;
  }

  private static async getMatchStreak(studentId: string, fieldName: string, targetValue: number, description?: string): Promise<number> {
    const count = parseInt(description?.match(/\d+/)?.[0] || '0');
    if (count === 0) return 0;

    const performances = await prisma.matchPerformance.findMany({
      where: { studentId },
      include: { match: true },
      orderBy: { match: { matchDate: 'desc' } },
      take: count
    });

    if (performances.length < count) return 0;

    return performances.every(p => {
      if (fieldName === 'matchRating') {
        return p.rating && p.rating >= targetValue;
      }
      try {
        const stats = JSON.parse(p.stats);
        return stats[fieldName] >= targetValue;
      } catch {
        return false;
      }
    }) ? count : 0;
  }

  private static async getSkillsAverage(studentId: string, description?: string): Promise<number> {
    const skills = await prisma.skills.findUnique({
      where: { studentId }
    });

    if (!skills) return 0;

    const technicalSkills = [
      'aim', 'backFootDrag', 'backFootLanding', 'backLift', 'battingBalance',
      'battingGrip', 'battingStance', 'bowlingGrip', 'calling', 'cockingOfWrist',
      'flatCatch', 'followThrough', 'frontFootLanding', 'highCatch', 'highElbow',
      'hipDrive', 'nonBowlingArm', 'pickUp', 'positioningOfBall', 'receiving',
      'release', 'runUp', 'runningBetweenWickets', 'softHands', 'throw', 'topHandDominance'
    ];

    let total = 0;
    let count = 0;

    for (const skill of technicalSkills) {
      const value = (skills as any)[skill];
      if (value && value > 0) {
        total += value;
        count++;
      }
    }

    return count > 0 ? total / count : 0;
  }

  private static async checkAnySkill(skills: any, operator: string, value: string): Promise<boolean> {
    const technicalSkills = [
      'aim', 'backFootDrag', 'backFootLanding', 'backLift', 'battingBalance',
      'battingGrip', 'battingStance', 'bowlingGrip', 'calling', 'cockingOfWrist',
      'flatCatch', 'followThrough', 'frontFootLanding', 'highCatch', 'highElbow',
      'hipDrive', 'nonBowlingArm', 'pickUp', 'positioningOfBall', 'receiving',
      'release', 'runUp', 'runningBetweenWickets', 'softHands', 'throw', 'topHandDominance'
    ];

    for (const skill of technicalSkills) {
      const fieldValue = skills[skill];
      if (fieldValue && this.evaluateRule(fieldValue, operator, value)) {
        return true;
      }
    }
    return false;
  }

  private static async getFitnessPercentile(student: any): Promise<number> {
    // This is a simplified version - in production you'd calculate actual percentiles
    const skills = student.skills;
    if (!skills) return 0;

    const fitnessScore = (
      (skills.pushupScore || 0) +
      (skills.pullupScore || 0) * 5 +
      (skills.verticalJump || 0) +
      (skills.gripStrength || 0) +
      (100 - (skills.sprint50m || 100)) +
      (100 - (skills.run5kTime || 100))
    ) / 6;

    // Simplified percentile calculation
    if (fitnessScore > 80) return 95;
    if (fitnessScore > 70) return 90;
    if (fitnessScore > 60) return 75;
    if (fitnessScore > 50) return 50;
    return 25;
  }

  private static async getMatchAverage(studentId: string, fieldName: string, description?: string): Promise<number> {
    const count = parseInt(description?.match(/\d+/)?.[0] || '10');
    
    const performances = await prisma.matchPerformance.findMany({
      where: { studentId },
      include: { match: true },
      orderBy: { match: { matchDate: 'desc' } },
      take: count
    });

    if (performances.length === 0) return 0;

    const total = performances.reduce((sum, p) => sum + (p.rating || 0), 0);
    return total / performances.length;
  }

  private static async getPeakScorePercentile(student: any): Promise<number> {
    // This would need actual PeakScore calculation logic
    // For now, return a simplified version
    const skills = student.skills;
    if (!skills) return 0;

    // Calculate a simple score based on all metrics
    const overallScore = 75; // Placeholder
    
    // Simplified percentile
    if (overallScore > 90) return 95;
    if (overallScore > 80) return 85;
    if (overallScore > 70) return 70;
    if (overallScore > 60) return 50;
    return 30;
  }
} 