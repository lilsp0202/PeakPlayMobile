import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface NotificationData {
  studentId: string;
  studentName: string;
  type: 'NEGATIVE_TREND' | 'POSITIVE_MILESTONE' | 'MISSED_CHECKIN' | 'OVERDUE_FEEDBACK';
  category: 'PHYSICAL' | 'MENTAL' | 'NUTRITION' | 'TECHNIQUE' | 'GENERAL';
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  data?: Record<string, any>;
}

export class NotificationAnalyzer {
  private coachId: string;
  private preferences: any;

  constructor(coachId: string, preferences: any) {
    this.coachId = coachId;
    this.preferences = preferences;
  }

  async analyzeAllStudents(): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    
    // Get all students assigned to this coach
    const coach = await prisma.coach.findUnique({
      where: { id: this.coachId },
      include: {
        students: {
          include: {
            skillHistory: {
              orderBy: { date: 'desc' },
              take: 30 // Get last 30 days of data
            },
            skills: true,
            hooperEntries: {
              orderBy: { date: 'desc' },
              take: 30
            }
          }
        }
      }
    });

    if (!coach?.students) {
      return notifications;
    }

    // Analyze each student
    for (const student of coach.students) {
      const studentNotifications = await this.analyzeStudent(student);
      notifications.push(...studentNotifications);
    }

    // Check for overdue feedback
    if (this.preferences.overdueFeedback) {
      const overdueNotifications = await this.checkOverdueFeedback(coach.students);
      notifications.push(...overdueNotifications);
    }

    return notifications;
  }

  private async analyzeStudent(student: any): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    
    // Check for negative trends
    if (this.preferences.negativeTrends) {
      const negativeNotifications = await this.detectNegativeTrends(student);
      notifications.push(...negativeNotifications);
    }

    // Check for positive milestones
    if (this.preferences.positiveMilestones) {
      const positiveNotifications = await this.detectPositiveMilestones(student);
      notifications.push(...positiveNotifications);
    }

    // Check for missed check-ins
    if (this.preferences.missedCheckIns) {
      const missedNotifications = await this.detectMissedCheckIns(student);
      notifications.push(...missedNotifications);
    }

    return notifications;
  }

  private async detectNegativeTrends(student: any): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    const trendDays = this.preferences.trendDays || 3;
    
    // Analyze physical trends
    const physicalTrend = this.analyzePhysicalTrend(student.skillHistory, trendDays);
    if (physicalTrend.isNegative) {
      notifications.push({
        studentId: student.id,
        studentName: student.studentName,
        type: 'NEGATIVE_TREND',
        category: 'PHYSICAL',
        title: `${student.studentName} - Physical Performance Declining`,
        message: `⚠️ ${student.studentName}'s physical performance has declined for ${trendDays} consecutive days. ${physicalTrend.details}`,
        severity: 'MEDIUM',
        data: {
          trend: physicalTrend.data,
          days: trendDays
        }
      });
    }

    // Analyze mental/wellness trends
    const mentalTrend = this.analyzeMentalTrend(student.skillHistory, student.hooperEntries, trendDays);
    if (mentalTrend.isNegative) {
      notifications.push({
        studentId: student.id,
        studentName: student.studentName,
        type: 'NEGATIVE_TREND',
        category: 'MENTAL',
        title: `${student.studentName} - Mental Wellness Declining`,
        message: `⚠️ ${student.studentName}'s mood and sleep scores have declined for ${trendDays} consecutive days. ${mentalTrend.details}`,
        severity: 'HIGH',
        data: {
          trend: mentalTrend.data,
          days: trendDays
        }
      });
    }

    // Analyze nutrition trends
    const nutritionTrend = this.analyzeNutritionTrend(student.skillHistory, trendDays);
    if (nutritionTrend.isNegative) {
      notifications.push({
        studentId: student.id,
        studentName: student.studentName,
        type: 'NEGATIVE_TREND',
        category: 'NUTRITION',
        title: `${student.studentName} - Nutrition Declining`,
        message: `⚠️ ${student.studentName}'s nutrition score has declined for ${trendDays} consecutive days. ${nutritionTrend.details}`,
        severity: 'MEDIUM',
        data: {
          trend: nutritionTrend.data,
          days: trendDays
        }
      });
    }

    return notifications;
  }

  private async detectPositiveMilestones(student: any): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    
    // Check for new personal bests
    const personalBests = await this.detectPersonalBests(student);
    notifications.push(...personalBests);

    // Check for consistent improvement
    const improvements = await this.detectConsistentImprovement(student);
    notifications.push(...improvements);

    return notifications;
  }

  private async detectMissedCheckIns(student: any): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    // Check for missed SkillSnap updates
    const recentSkillHistory = student.skillHistory.filter((sh: any) => 
      new Date(sh.date) >= threeDaysAgo
    );

    if (recentSkillHistory.length === 0) {
      notifications.push({
        studentId: student.id,
        studentName: student.studentName,
        type: 'MISSED_CHECKIN',
        category: 'GENERAL',
        title: `${student.studentName} - No Recent SkillSnap Updates`,
        message: `⏰ ${student.studentName} hasn't updated their SkillSnap in 3+ days. Consider checking in with them.`,
        severity: 'LOW',
        data: {
          lastUpdate: student.skillHistory[0]?.date || null,
          daysAgo: 3
        }
      });
    }

    // Check for missed Hooper Index entries
    const recentHooperEntries = student.hooperEntries.filter((he: any) => 
      new Date(he.date) >= threeDaysAgo
    );

    if (recentHooperEntries.length === 0) {
      notifications.push({
        studentId: student.id,
        studentName: student.studentName,
        type: 'MISSED_CHECKIN',
        category: 'MENTAL',
        title: `${student.studentName} - No Recent Wellness Check-ins`,
        message: `⏰ ${student.studentName} hasn't completed their wellness check-in in 3+ days. Mental health monitoring is important.`,
        severity: 'MEDIUM',
        data: {
          lastEntry: student.hooperEntries[0]?.date || null,
          daysAgo: 3
        }
      });
    }

    return notifications;
  }

  private async checkOverdueFeedback(students: any[]): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    const feedbackDays = this.preferences.feedbackDays || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - feedbackDays);

    for (const student of students) {
      const recentFeedback = await prisma.feedback.findFirst({
        where: {
          studentId: student.id,
          coachId: this.coachId,
          createdAt: {
            gte: cutoffDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (!recentFeedback) {
        notifications.push({
          studentId: student.id,
          studentName: student.studentName,
          type: 'OVERDUE_FEEDBACK',
          category: 'GENERAL',
          title: `Feedback Overdue - ${student.studentName}`,
          message: `⏳ You haven't provided feedback to ${student.studentName} in ${feedbackDays}+ days. Regular feedback helps maintain engagement.`,
          severity: 'LOW',
          data: {
            daysWithoutFeedback: feedbackDays,
            lastFeedback: null
          }
        });
      }
    }

    return notifications;
  }

  private analyzePhysicalTrend(skillHistory: any[], days: number) {
    if (skillHistory.length < days) {
      return { isNegative: false, details: '', data: null };
    }

    const recentEntries = skillHistory.slice(0, days);
    const physicalScores = recentEntries
      .filter(entry => entry.physicalScore !== null)
      .map(entry => entry.physicalScore);

    if (physicalScores.length < days) {
      return { isNegative: false, details: '', data: null };
    }

    // Check if there's a declining trend
    let declining = 0;
    for (let i = 1; i < physicalScores.length; i++) {
      if (physicalScores[i] < physicalScores[i - 1]) {
        declining++;
      }
    }

    const isNegative = declining >= days - 1;
    const startScore = physicalScores[physicalScores.length - 1];
    const endScore = physicalScores[0];
    const decline = startScore - endScore;

    return {
      isNegative,
      details: isNegative ? `Physical score dropped from ${startScore.toFixed(1)} to ${endScore.toFixed(1)} (-${decline.toFixed(1)} points)` : '',
      data: {
        scores: physicalScores,
        decline: decline
      }
    };
  }

  private analyzeMentalTrend(skillHistory: any[], hooperEntries: any[], days: number) {
    const recentHooper = hooperEntries.slice(0, days);
    const recentSkills = skillHistory.slice(0, days);

    if (recentHooper.length < days && recentSkills.length < days) {
      return { isNegative: false, details: '', data: null };
    }

    // Analyze Hooper Index trend (higher is worse)
    let hooperTrend = null;
    if (recentHooper.length >= days) {
      const hooperScores = recentHooper.map(entry => entry.hooperIndex);
      let increasing = 0;
      for (let i = 1; i < hooperScores.length; i++) {
        if (hooperScores[i] > hooperScores[i - 1]) {
          increasing++;
        }
      }
      hooperTrend = {
        isNegative: increasing >= days - 1,
        scores: hooperScores,
        change: hooperScores[0] - hooperScores[hooperScores.length - 1]
      };
    }

    // Analyze mental scores from skill history
    let mentalTrend = null;
    const mentalScores = recentSkills
      .filter(entry => entry.mentalScore !== null)
      .map(entry => entry.mentalScore);

    if (mentalScores.length >= days) {
      let declining = 0;
      for (let i = 1; i < mentalScores.length; i++) {
        if (mentalScores[i] < mentalScores[i - 1]) {
          declining++;
        }
      }
      mentalTrend = {
        isNegative: declining >= days - 1,
        scores: mentalScores,
        change: mentalScores[0] - mentalScores[mentalScores.length - 1]
      };
    }

    const isNegative = hooperTrend?.isNegative || mentalTrend?.isNegative;
    let details = '';
    if (hooperTrend?.isNegative) {
      details += `Hooper Index increased from ${hooperTrend.scores[hooperTrend.scores.length - 1]} to ${hooperTrend.scores[0]}. `;
    }
    if (mentalTrend?.isNegative) {
      details += `Mental score declined from ${mentalTrend.scores[mentalTrend.scores.length - 1].toFixed(1)} to ${mentalTrend.scores[0].toFixed(1)}.`;
    }

    return {
      isNegative,
      details,
      data: {
        hooperTrend,
        mentalTrend
      }
    };
  }

  private analyzeNutritionTrend(skillHistory: any[], days: number) {
    if (skillHistory.length < days) {
      return { isNegative: false, details: '', data: null };
    }

    const recentEntries = skillHistory.slice(0, days);
    const nutritionScores = recentEntries
      .filter(entry => entry.nutritionScore !== null)
      .map(entry => entry.nutritionScore);

    if (nutritionScores.length < days) {
      return { isNegative: false, details: '', data: null };
    }

    // Check if there's a declining trend
    let declining = 0;
    for (let i = 1; i < nutritionScores.length; i++) {
      if (nutritionScores[i] < nutritionScores[i - 1]) {
        declining++;
      }
    }

    const isNegative = declining >= days - 1;
    const startScore = nutritionScores[nutritionScores.length - 1];
    const endScore = nutritionScores[0];
    const decline = startScore - endScore;

    return {
      isNegative,
      details: isNegative ? `Nutrition score dropped from ${startScore.toFixed(1)} to ${endScore.toFixed(1)} (-${decline.toFixed(1)} points)` : '',
      data: {
        scores: nutritionScores,
        decline: decline
      }
    };
  }

  private async detectPersonalBests(student: any): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    
    if (student.skillHistory.length < 2) {
      return notifications;
    }

    const latest = student.skillHistory[0];
    const previous = student.skillHistory.slice(1);

    // Check for physical score PB
    if (latest.physicalScore) {
      const previousBest = Math.max(...previous.map((h: any) => h.physicalScore || 0));
      if (latest.physicalScore > previousBest) {
        notifications.push({
          studentId: student.id,
          studentName: student.studentName,
          type: 'POSITIVE_MILESTONE',
          category: 'PHYSICAL',
          title: `${student.studentName} - New Physical Score PB!`,
          message: `🎉 ${student.studentName} hit a new personal best in Physical Score: ${latest.physicalScore.toFixed(1)} (previous best: ${previousBest.toFixed(1)})!`,
          severity: 'LOW',
          data: {
            newScore: latest.physicalScore,
            previousBest: previousBest,
            improvement: latest.physicalScore - previousBest
          }
        });
      }
    }

    // Check for mental score PB
    if (latest.mentalScore) {
      const previousBest = Math.max(...previous.map((h: any) => h.mentalScore || 0));
      if (latest.mentalScore > previousBest) {
        notifications.push({
          studentId: student.id,
          studentName: student.studentName,
          type: 'POSITIVE_MILESTONE',
          category: 'MENTAL',
          title: `${student.studentName} - New Mental Wellness PB!`,
          message: `🎉 ${student.studentName} achieved a new personal best in Mental Wellness: ${latest.mentalScore.toFixed(1)} (previous best: ${previousBest.toFixed(1)})!`,
          severity: 'LOW',
          data: {
            newScore: latest.mentalScore,
            previousBest: previousBest,
            improvement: latest.mentalScore - previousBest
          }
        });
      }
    }

    return notifications;
  }

  private async detectConsistentImprovement(student: any): Promise<NotificationData[]> {
    const notifications: NotificationData[] = [];
    
    if (student.skillHistory.length < 7) {
      return notifications;
    }

    const lastWeek = student.skillHistory.slice(0, 7);
    
    // Check for consistent physical improvement
    const physicalScores = lastWeek
      .filter((entry: any) => entry.physicalScore !== null)
      .map((entry: any) => entry.physicalScore);

    if (physicalScores.length >= 5) {
      const avgFirst = physicalScores.slice(-3).reduce((a: number, b: number) => a + b, 0) / 3;
      const avgLast = physicalScores.slice(0, 3).reduce((a: number, b: number) => a + b, 0) / 3;
      
      if (avgLast > avgFirst && (avgLast - avgFirst) > 2) {
        notifications.push({
          studentId: student.id,
          studentName: student.studentName,
          type: 'POSITIVE_MILESTONE',
          category: 'PHYSICAL',
          title: `${student.studentName} - Consistent Physical Improvement!`,
          message: `🎯 ${student.studentName} has shown consistent physical improvement over the past week. Average score increased from ${avgFirst.toFixed(1)} to ${avgLast.toFixed(1)}!`,
          severity: 'LOW',
          data: {
            weeklyImprovement: avgLast - avgFirst,
            averageStart: avgFirst,
            averageEnd: avgLast
          }
        });
      }
    }

    return notifications;
  }
}

// Utility function to generate notifications for a coach
export async function generateNotificationsForCoach(coachId: string): Promise<NotificationData[]> {
  // Get coach preferences
  const preferences = await prisma.notificationPreference.findUnique({
    where: { coachId }
  });

  // Use default preferences if none exist
  const defaultPreferences = {
    negativeTrends: true,
    positiveMilestones: true,
    missedCheckIns: true,
    overdueFeedback: true,
    trendDays: 3,
    feedbackDays: 7
  };

  const analyzer = new NotificationAnalyzer(coachId, preferences || defaultPreferences);
  return await analyzer.analyzeAllStudents();
}

// Utility function to save notifications to database
export async function saveNotifications(coachId: string, notifications: NotificationData[]): Promise<void> {
  for (const notification of notifications) {
    // Check if a similar notification already exists (prevent duplicates)
    const existing = await prisma.smartNotification.findFirst({
      where: {
        coachId,
        studentId: notification.studentId,
        type: notification.type,
        category: notification.category,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
        }
      }
    });

    if (!existing) {
      await prisma.smartNotification.create({
        data: {
          coachId,
          studentId: notification.studentId,
          type: notification.type,
          category: notification.category,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          data: notification.data ? JSON.stringify(notification.data) : null
        }
      });
    }
  }
} 