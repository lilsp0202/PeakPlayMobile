import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BadgeEngine } from '@/lib/badgeEngine';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Unauthorized - Only coaches can access student progress' },
        { status: 401 }
      );
    }

    // Get coach information
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          include: {
            skills: true,
            badges: {
              include: {
                badge: {
                  include: {
                    category: true,
                    rules: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }

    // Get all badges for reference
    const allBadges = await prisma.badge.findMany({
      where: {
        OR: [
          { sport: 'ALL' },
          { sport: { in: coach.students.map(s => s.sport) } }
        ],
        isActive: true
      },
      include: {
        category: true,
        rules: true,
        studentBadges: {
          where: {
            studentId: { in: coach.students.map(s => s.id) }
          }
        }
      }
    });

    // Process student badge progress
    const studentsProgress = await Promise.all(
      coach.students.map(async (student) => {
        const earnedBadges = student.badges.filter(sb => !sb.isRevoked);
        const totalBadges = allBadges.filter(badge => 
          badge.sport === 'ALL' || badge.sport === student.sport
        ).length;

        // Calculate progress percentage
        const progressPercentage = totalBadges > 0 ? Math.round((earnedBadges.length / totalBadges) * 100) : 0;

        // Get recent badges (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentBadges = earnedBadges.filter(sb => 
          sb.awardedAt && new Date(sb.awardedAt) > thirtyDaysAgo
        );

        // Get category breakdown
        const categoryBreakdown = earnedBadges.reduce((acc, sb) => {
          const categoryName = sb.badge.category?.name || 'General';
          acc[categoryName] = (acc[categoryName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Get all badges with progress for this student
        const allBadgeProgress = await BadgeEngine.getBadgeProgress(student.id);

        return {
          student: {
            id: student.id,
            name: student.studentName,
            email: student.email,
            sport: student.sport,
            academy: student.academy,
            age: student.age
          },
          badges: {
            earned: earnedBadges.length,
            total: totalBadges,
            progressPercentage,
            recent: recentBadges.length,
            categoryBreakdown,
            latestBadge: earnedBadges.length > 0 ? 
              earnedBadges.sort((a, b) => new Date(b.awardedAt || 0).getTime() - new Date(a.awardedAt || 0).getTime())[0] : null
          },
          recentBadges: recentBadges.map(sb => ({
            id: sb.id,
            badge: {
              id: sb.badge.id,
              name: sb.badge.name,
              icon: sb.badge.icon,
              level: sb.badge.level,
              category: sb.badge.category?.name || 'General'
            },
            awardedAt: sb.awardedAt,
            score: sb.score
          })),
          allBadgeProgress: allBadgeProgress
        };
      })
    );

    // Sort by progress (highest first)
    studentsProgress.sort((a, b) => b.badges.progressPercentage - a.badges.progressPercentage);

    return NextResponse.json({
      success: true,
      coach: {
        id: coach.id,
        name: coach.name,
        academy: coach.academy,
        totalStudents: coach.students.length
      },
      students: studentsProgress,
      summary: {
        totalStudents: coach.students.length,
        averageProgress: studentsProgress.length > 0 ? 
          Math.round(studentsProgress.reduce((sum, sp) => sum + sp.badges.progressPercentage, 0) / studentsProgress.length) : 0,
        totalBadgesEarned: studentsProgress.reduce((sum, sp) => sum + sp.badges.earned, 0),
        topPerformer: studentsProgress.length > 0 ? studentsProgress[0].student : null
      }
    });

  } catch (error) {
    console.error('Error fetching student badge progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student badge progress' },
      { status: 500 }
    );
  }
} 