import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get user count from database
    const userCount = await prisma.user.count();
    const coachCount = await prisma.coach.count();
    const studentCount = await prisma.student.count();

    return NextResponse.json({
      status: "Authentication status check",
      session: session ? {
        hasSession: true,
        userId: session.user?.id,
        userEmail: session.user?.email,
        userRole: session.user?.role,
        isAuthenticated: true
      } : {
        hasSession: false,
        isAuthenticated: false
      },
      database: {
        totalUsers: userCount,
        coaches: coachCount,
        students: studentCount
      },
      guidance: session ? {
        message: "✅ User is authenticated and can upload videos",
        nextStep: "Try uploading a video now - it should work!"
      } : {
        message: "❌ No active session found",
        nextStep: "Please sign in first at https://www.peakplayai.com/auth/signin",
        testAccounts: "Use any existing account or create a new coach account"
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    });

  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      { 
        error: "Failed to check authentication status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 