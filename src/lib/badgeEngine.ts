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
        existingBadges: student.badges.length
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

      console.log('BadgeEngine - Found badges for evaluation:', {
        total: badges.length,
        sport: student.sport,
        badgeNames: badges.map(b => b.name)
      });

      // Evaluate each badge
      for (const badge of badges) {
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
        newBadgesAwarded: newBadges.length,
        totalProgress: updatedProgress.length
      });

      return { newBadges, updatedProgress };

    } catch (error) {
      console.error('Badge evaluation error:', error);
      throw error;
    }
  }

  private static async evaluateBadge(badge: any, student: any): Promise<{
    earned: boolean;
    progress: number;
    score: number;
  }> {
    const rules = badge.rules;
    const skills = student.skills;
    
    if (!rules || rules.length === 0) {
      return { earned: false, progress: 0, score: 0 };
    }

    let totalScore = 0;
    let maxScore = 0;
    let requiredRulesPassed = 0;
    let totalRequiredRules = 0;

    for (const rule of rules) {
      const ruleResult = await this.evaluateRule(rule, student);
      
      if (rule.isRequired) {
        totalRequiredRules++;
        if (ruleResult.passed) {
          requiredRulesPassed++;
        }
      }

      totalScore += ruleResult.score * rule.weight;
      maxScore += rule.weight;
    }

    // Check if all required rules passed
    const allRequiredPassed = totalRequiredRules === 0 || requiredRulesPassed === totalRequiredRules;
    
    // Calculate progress percentage
    const progress = maxScore > 0 ? Math.min(100, (totalScore / maxScore) * 100) : 0;
    
    // Badge is earned if all required rules pass and progress >= 80%
    const earned = allRequiredPassed && progress >= 80;

    return {
      earned,
      progress,
      score: totalScore
    };
  }

  private static async evaluateRule(rule: any, student: any): Promise<{
    passed: boolean;
    score: number;
  }> {
    const { ruleType, fieldName, operator, value } = rule;
    
    console.log('BadgeEngine - Evaluating rule:', {
      ruleType,
      fieldName,
      operator,
      value,
      weight: rule.weight,
      isRequired: rule.isRequired
    });
    
    let fieldValue: any;
    let targetValue: any;

    try {
      targetValue = this.parseValue(value);
    } catch (error) {
      console.error(`Failed to parse rule value: ${value}`, error);
      return { passed: false, score: 0 };
    }

    switch (ruleType) {
      case 'PERFORMANCE':
        fieldValue = student.skills?.[fieldName];
        console.log('BadgeEngine - PERFORMANCE rule:', {
          fieldName,
          fieldValue,
          targetValue,
          hasSkills: !!student.skills
        });
        break;
        
      case 'WELLNESS':
        fieldValue = student.skills?.[fieldName];
        console.log('BadgeEngine - WELLNESS rule:', {
          fieldName,
          fieldValue,
          targetValue,
          hasSkills: !!student.skills
        });
        break;
        
      case 'CONSISTENCY':
        // For now, simulate consistency based on data presence
        fieldValue = student.skills ? 1 : 0;
        console.log('BadgeEngine - CONSISTENCY rule:', {
          fieldValue,
          targetValue,
          hasSkills: !!student.skills
        });
        break;
        
      case 'STREAK':
        // Simulate streak data - in real implementation, would calculate from daily logs
        fieldValue = Math.floor(Math.random() * 30); // Random streak for demo
        console.log('BadgeEngine - STREAK rule (simulated):', {
          fieldValue,
          targetValue
        });
        break;
        
      case 'IMPROVEMENT':
        // Simulate improvement - in real implementation, would compare historical data
        fieldValue = Math.floor(Math.random() * 50); // Random improvement for demo
        console.log('BadgeEngine - IMPROVEMENT rule (simulated):', {
          fieldValue,
          targetValue
        });
        break;
        
      case 'COACH_RATING':
        // Simulate coach rating - in real implementation, would get from feedback/ratings
        fieldValue = Math.floor(Math.random() * 10) + 1; // Random rating 1-10 for demo
        console.log('BadgeEngine - COACH_RATING rule (simulated):', {
          fieldValue,
          targetValue
        });
        break;
        
      default:
        console.warn(`Unknown rule type: ${ruleType}`);
        return { passed: false, score: 0 };
    }

    if (fieldValue === undefined || fieldValue === null) {
      console.log('BadgeEngine - Rule failed: field value is null/undefined');
      return { passed: false, score: 0 };
    }

    const comparison = this.compareValues(fieldValue, operator, targetValue);
    
    console.log('BadgeEngine - Rule comparison result:', {
      fieldValue,
      operator,
      targetValue,
      passed: comparison.passed,
      score: comparison.partial
    });
    
    return { 
      passed: comparison.passed, 
      score: comparison.partial // partial is actually the score value
    };
  }

  private static parseValue(value: string): any {
    // Handle array values for BETWEEN operator
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch {
        return parseFloat(value.slice(1, -1));
      }
    }
    
    // Try to parse as number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return numValue;
    }
    
    // Return as string
    return value;
  }

  private static compareValues(fieldValue: any, operator: string, targetValue: any): {
    passed: boolean;
    partial: number;
  } {
    const numFieldValue = typeof fieldValue === 'number' ? fieldValue : parseFloat(fieldValue);
    const normalizedOperator = operator.toUpperCase(); // Normalize to uppercase
    
    switch (normalizedOperator) {
      case 'GTE':
        const gteResult = numFieldValue >= targetValue;
        return {
          passed: gteResult,
          partial: gteResult ? 1 : Math.max(0, numFieldValue / targetValue)
        };
        
      case 'GT':
        const gtResult = numFieldValue > targetValue;
        return {
          passed: gtResult,
          partial: gtResult ? 1 : Math.max(0, numFieldValue / targetValue)
        };
        
      case 'LTE':
        return { passed: numFieldValue <= targetValue, partial: 0 };
        
      case 'LT':
        return { passed: numFieldValue < targetValue, partial: 0 };
        
      case 'EQ':
        return { passed: numFieldValue === targetValue, partial: 0 };
        
      case 'BETWEEN':
        if (Array.isArray(targetValue) && targetValue.length === 2) {
          const [min, max] = targetValue;
          const withinRange = numFieldValue >= min && numFieldValue <= max;
          return {
            passed: withinRange,
            partial: withinRange ? 1 : 0
          };
        }
        return { passed: false, partial: 0 };
        
      case 'STREAK_DAYS':
        const streakResult = numFieldValue >= targetValue;
        return {
          passed: streakResult,
          partial: streakResult ? 1 : Math.max(0, numFieldValue / targetValue)
        };
        
      default:
        console.warn(`Unknown operator: ${operator} (normalized: ${normalizedOperator})`);
        return { passed: false, partial: 0 };
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
      include: { skills: true }
    });

    if (!student) return [];

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
          where: { studentId, isRevoked: false }
        }
      }
    });

    const progress: BadgeProgress[] = [];

    for (const badge of badges) {
      const earnedBadge = badge.studentBadges.find(sb => !sb.isRevoked);
      
      if (earnedBadge) {
        // Badge is already earned
        progress.push({
          badgeId: badge.id,
          badgeName: badge.name,
          level: badge.level,
          category: badge.category.name,
          progress: 100,
          description: badge.description,
          motivationalText: badge.motivationalText,
          icon: badge.icon,
          earned: true,
          earnedAt: earnedBadge.awardedAt
        });
      } else {
        // Badge not earned yet, calculate progress
        const evaluation = await this.evaluateBadge(badge, student);
        
        // Automatically award badge if criteria are met
        if (evaluation.earned) {
          const newBadge = await prisma.studentBadge.create({
            data: {
              studentId,
              badgeId: badge.id,
              score: evaluation.score,
              progress: 100
            }
          });
          
          progress.push({
            badgeId: badge.id,
            badgeName: badge.name,
            level: badge.level,
            category: badge.category.name,
            progress: 100,
            description: badge.description,
            motivationalText: badge.motivationalText,
            icon: badge.icon,
            earned: true,
            earnedAt: newBadge.awardedAt
          });
        } else {
          progress.push({
            badgeId: badge.id,
            badgeName: badge.name,
            level: badge.level,
            category: badge.category.name,
            progress: evaluation.progress,
            description: badge.description,
            motivationalText: badge.motivationalText,
            icon: badge.icon,
            earned: false
          });
        }
      }
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

  static async bulkEvaluate(studentIds: string[]) {
    const results = [];
    
    for (const studentId of studentIds) {
      try {
        const result = await this.evaluateStudentBadges({ studentId });
        results.push({ studentId, ...result, success: true });
      } catch (error) {
        results.push({ 
          studentId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return results;
  }
} 