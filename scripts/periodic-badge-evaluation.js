#!/usr/bin/env node

/**
 * Periodic Badge Evaluation Script
 * 
 * This script automatically evaluates all students for badge achievements.
 * It can be run as a cron job for automatic badge awarding.
 * 
 * Usage:
 * - node scripts/periodic-badge-evaluation.js
 * - Or set up as a cron job: 0 *\/6 * * * node /path/to/scripts/periodic-badge-evaluation.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Badge evaluation logic (simplified version of BadgeEngine)
class BadgeEvaluator {
  static async evaluateAllStudents() {
    console.log('🔄 Starting periodic badge evaluation...');
    
    const students = await prisma.student.findMany({
      include: { 
        skills: true,
        badges: {
          include: { badge: true }
        }
      }
    });

    let studentsEvaluated = 0;
    let totalNewBadges = 0;
    const errors = [];

    for (const student of students) {
      try {
        if (!student.skills) {
          console.log(`⏭️  Skipping ${student.studentName} - no skills data`);
          continue;
        }

        const newBadges = await this.evaluateStudentBadges(student);
        studentsEvaluated++;
        totalNewBadges += newBadges;

        if (newBadges > 0) {
          console.log(`🏆 Awarded ${newBadges} new badges to ${student.studentName}`);
        }
      } catch (error) {
        const errorMsg = `Error evaluating ${student.studentName}: ${error.message}`;
        console.error('❌', errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log('✅ Periodic evaluation complete:', {
      studentsEvaluated,
      totalNewBadges,
      errors: errors.length
    });

    return { studentsEvaluated, totalNewBadges, errors };
  }

  static async evaluateStudentBadges(student) {
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
        studentBadges: {
          where: { studentId: student.id }
        }
      }
    });

    let newBadgesCount = 0;

    for (const badge of badges) {
      const existingBadge = badge.studentBadges.find(sb => !sb.isRevoked);
      
      if (existingBadge) {
        continue; // Badge already earned
      }

      const evaluation = this.evaluateBadge(badge, student);
      
      if (evaluation.earned) {
        await prisma.studentBadge.create({
          data: {
            studentId: student.id,
            badgeId: badge.id,
            score: evaluation.score,
            progress: 100
          }
        });
        
        newBadgesCount++;
        console.log(`  ✅ ${student.studentName} earned: ${badge.name}`);
      }
    }

    return newBadgesCount;
  }

  static evaluateBadge(badge, student) {
    const { rules } = badge;
    const skills = student.skills;

    if (!skills) {
      return { earned: false, progress: 0, score: 0 };
    }

    let totalScore = 0;
    let maxScore = 0;
    let requiredRulesPassed = 0;
    let totalRequiredRules = 0;

    for (const rule of rules) {
      const { fieldName, operator, value, weight, isRequired } = rule;
      
      if (isRequired) {
        totalRequiredRules++;
      }
      
      maxScore += weight;

      const fieldValue = skills[fieldName];

      if (fieldValue === null || fieldValue === undefined || fieldValue === 0) {
        continue;
      }

      const ruleResult = this.evaluateRule(fieldValue, operator, value);
      
      if (ruleResult) {
        totalScore += weight;
        if (isRequired) {
          requiredRulesPassed++;
        }
      }
    }

    const progress = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const earned = totalRequiredRules > 0 ? requiredRulesPassed === totalRequiredRules : progress >= 100;

    return { earned, progress, score: totalScore };
  }

  static evaluateRule(fieldValue, operator, targetValue) {
    const numericValue = parseFloat(fieldValue);
    const numericTarget = parseFloat(targetValue);

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
        console.warn('Unknown operator:', operator);
        return false;
    }
  }
}

// Main execution
async function main() {
  try {
    const startTime = new Date();
    console.log(`🚀 Starting badge evaluation at ${startTime.toISOString()}`);
    
    const result = await BadgeEvaluator.evaluateAllStudents();
    
    const endTime = new Date();
    const duration = endTime - startTime;
    
    console.log(`🎉 Badge evaluation completed in ${duration}ms`);
    console.log(`📊 Summary:`, {
      studentsEvaluated: result.studentsEvaluated,
      totalNewBadges: result.totalNewBadges,
      errors: result.errors.length,
      duration: `${duration}ms`
    });

    if (result.errors.length > 0) {
      console.log('❌ Errors encountered:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Exit with appropriate code
    process.exit(result.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Fatal error during badge evaluation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { BadgeEvaluator }; 