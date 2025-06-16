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

    if (!skills) {
      console.log('BadgeEngine - No skills data for student:', student.id);
      return { earned: false, progress: 0, score: 0 };
    }

    let totalScore = 0;
    let maxScore = 0;
    let requiredRulesPassed = 0;
    let totalRequiredRules = 0;

    console.log('BadgeEngine - Evaluating badge rules:', {
      badgeName: badge.name,
      ruleCount: rules.length
    });

    for (const rule of rules) {
      const { fieldName, operator, value, weight, isRequired } = rule;
      
      if (isRequired) {
        totalRequiredRules++;
      }
      
      maxScore += weight;

      // Get the field value from skills
      const fieldValue = skills[fieldName];
      
      console.log('BadgeEngine - Evaluating rule:', {
        fieldName,
        fieldValue,
        operator,
        targetValue: value,
        weight,
        isRequired
      });

      if (fieldValue === null || fieldValue === undefined || fieldValue === 0) {
        console.log('BadgeEngine - Field value is null/undefined/zero (no input), skipping rule');
        continue;
      }

      const ruleResult = this.evaluateRule(fieldValue, operator, value);
      
      console.log('BadgeEngine - Rule result:', {
        fieldName,
        passed: ruleResult,
        fieldValue,
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
        const errorMsg = `Error evaluating student ${student.studentName}: ${error.message}`;
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
} 