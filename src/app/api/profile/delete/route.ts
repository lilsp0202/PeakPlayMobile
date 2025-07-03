import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import * as Sentry from "@sentry/nextjs";
import bcrypt from "bcryptjs";

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting - 3 requests per hour for account deletion
    const rateLimitResponse = await checkRateLimit(request, 3);
    if (rateLimitResponse) return rateLimitResponse;

    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Require password confirmation for security
    const body = await request.json();
    const { password, reason } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password confirmation required" },
        { status: 400 }
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true, email: true }
    });

    if (!user?.password) {
      return NextResponse.json(
        { error: "Invalid user account" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Log deletion request for audit
    console.log(`[ACCOUNT_DELETION] User ${session.user.id} (${user.email}) requested account deletion. Reason: ${reason || 'Not specified'}`);

    // Use transaction to ensure all data is deleted
    await prisma.$transaction(async (tx) => {
      // Delete all related data in correct order
      if (session.user.role === 'ATHLETE') {
        // Delete athlete-specific data
        await tx.sessionTodoStudent.deleteMany({
          where: { student: { userId: session.user.id } }
        });
        await tx.coachReview.deleteMany({
          where: { athlete: { userId: session.user.id } }
        });
        await tx.coachingBooking.deleteMany({
          where: { athlete: { userId: session.user.id } }
        });
        await tx.studentBadge.deleteMany({
          where: { student: { userId: session.user.id } }
        });
        await tx.matchPerformance.deleteMany({
          where: { student: { userId: session.user.id } }
        });
        await tx.feedback.deleteMany({
          where: { student: { userId: session.user.id } }
        });
        await tx.skills.deleteMany({
          where: { userId: session.user.id }
        });
        await tx.student.deleteMany({
          where: { userId: session.user.id }
        });
      } else if (session.user.role === 'COACH') {
        // Delete coach-specific data
        await tx.sessionTodoItem.deleteMany({
          where: { todo: { coachId: { in: await tx.coach.findMany({ where: { userId: session.user.id }, select: { id: true } }).then(coaches => coaches.map(c => c.id)) } } }
        });
        await tx.sessionTodoStudent.deleteMany({
          where: { todo: { coachId: { in: await tx.coach.findMany({ where: { userId: session.user.id }, select: { id: true } }).then(coaches => coaches.map(c => c.id)) } } }
        });
        await tx.sessionTodo.deleteMany({
          where: { coach: { userId: session.user.id } }
        });
        await tx.feedback.deleteMany({
          where: { coach: { userId: session.user.id } }
        });
        // Unassign students
        await tx.student.updateMany({
          where: { coach: { userId: session.user.id } },
          data: { coachId: null }
        });
        await tx.coach.deleteMany({
          where: { userId: session.user.id }
        });
      }

      // Delete auth-related data
      await tx.session.deleteMany({
        where: { userId: session.user.id }
      });
      await tx.account.deleteMany({
        where: { userId: session.user.id }
      });
      
      // Finally, delete the user
      await tx.user.delete({
        where: { id: session.user.id }
      });
    });

    // Log successful deletion
    console.log(`[ACCOUNT_DELETION] Successfully deleted account for user ${session.user.id}`);
    
    // Report to monitoring
    Sentry.captureMessage(`Account deleted: ${session.user.id}`, 'info');

    return NextResponse.json(
      { 
        message: "Account successfully deleted",
        info: "All your data has been permanently removed from our systems."
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Account deletion error:", error);
    
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/profile/delete',
        userId: ((await getServerSession(authOptions)) as Session | null)?.user?.id,
      },
    });

    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    );
  }
}

// Export data endpoint
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Gather all user data
    const userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
        sessions: {
          select: {
            expires: true,
          }
        },
        student: {
          include: {
            skills: true,
            badges: {
              include: {
                badge: true
              }
            },
            matchPerformances: {
              include: {
                match: true
              }
            },
            receivedFeedback: {
              include: {
                coach: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            coachingBookings: true,
            coachReviews: true,
          }
        },
        coach: {
          include: {
            students: {
              select: {
                studentName: true,
                email: true
              }
            },
            givenFeedback: {
              select: {
                title: true,
                content: true,
                createdAt: true,
                student: {
                  select: {
                    studentName: true
                  }
                }
              }
            },
            sessionTodos: {
              include: {
                items: true,
                students: {
                  include: {
                    student: {
                      select: {
                        studentName: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Remove sensitive fields
    if (userData) {
      delete (userData as any).password;
      userData.accounts.forEach((account: any) => {
        delete account.access_token;
        delete account.refresh_token;
        delete account.id_token;
      });
    }

    // Return data as JSON download
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="peakplay-data-${session.user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/profile/delete',
        action: 'export',
      },
    });

    return NextResponse.json(
      { error: "Failed to export data. Please try again." },
      { status: 500 }
    );
  }
} 