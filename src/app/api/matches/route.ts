import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    // If coach is requesting specific student data
    if (studentId && session.user.role === "COACH") {
      const matches = await prisma.matchPerformance.findMany({
        where: { studentId },
        include: {
          match: true,
          student: {
            select: {
              studentName: true,
              sport: true,
              role: true,
            },
          },
        },
        orderBy: {
          match: {
            matchDate: "desc",
          },
        },
        take: 10, // Latest 10 matches
      });
      
      return NextResponse.json(matches, { status: 200 });
    }
    
    // For athletes, get their own match performances
    if (session.user.role === "ATHLETE") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      
      const matches = await prisma.matchPerformance.findMany({
        where: { studentId: student.id },
        include: {
          match: true,
          student: {
            select: {
              studentName: true,
              sport: true,
              role: true,
            },
          },
        },
        orderBy: {
          match: {
            matchDate: "desc",
          },
        },
        take: 10, // Latest 10 matches
      });
      
      return NextResponse.json(matches, { status: 200 });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Matches API - Request body:", body);
    
    let studentId = body.studentId;
    let isCoach = session.user.role === "COACH";
    let isAthlete = session.user.role === "ATHLETE";

    // For athletes, determine their own studentId
    if (isAthlete) {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (!student) {
        console.error("Matches API - Student not found for user:", session.user.id);
        return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
      }
      studentId = student.id;
      console.log("Matches API - Using athlete's studentId:", studentId);
    }

    // For coaches, require studentId in body
    if (isCoach && !studentId) {
      console.error("Matches API - Coach request missing studentId");
      return NextResponse.json({ error: "Student ID required for coach" }, { status: 400 });
    }

    // Validate required fields
    const {
      matchName,
      opponent,
      venue,
      matchDate,
      sport = "CRICKET",
      matchType = "PRACTICE",
      result = "WIN",
      position,
      stats,
      rating,
      notes,
    } = body;

    if (!matchName || !opponent || !matchDate) {
      console.error("Matches API - Missing required fields:", { matchName, opponent, matchDate });
      return NextResponse.json({ error: "Missing required fields: matchName, opponent, matchDate" }, { status: 400 });
    }

    console.log("Matches API - Creating match with data:", {
      matchName,
      opponent,
      venue,
      matchDate,
      sport,
      matchType,
      result
    });

    // Create or find the match
    let match = await prisma.match.findFirst({
      where: {
        matchName,
        opponent,
        matchDate: new Date(matchDate),
        sport,
      },
    });

    if (!match) {
      match = await prisma.match.create({
        data: {
          matchName,
          opponent,
          venue: venue || "",
          matchDate: new Date(matchDate),
          sport,
          matchType,
          result,
        },
      });
      console.log("Matches API - Created new match:", match.id);
    } else {
      console.log("Matches API - Using existing match:", match.id);
    }

    // Parse stats if it's a string
    let parsedStats = stats;
    if (typeof stats === 'string') {
      try {
        parsedStats = JSON.parse(stats);
      } catch (e) {
        console.error("Matches API - Error parsing stats:", e);
        parsedStats = {};
      }
    }

    console.log("Matches API - Creating performance with:", {
      studentId,
      matchId: match.id,
      position,
      stats: parsedStats,
      rating,
      notes
    });

    // Create or update match performance
    const performance = await prisma.matchPerformance.upsert({
      where: {
        studentId_matchId: {
          studentId,
          matchId: match.id,
        },
      },
      update: {
        position: position || "Player",
        stats: JSON.stringify(parsedStats || {}),
        rating: rating ? parseFloat(rating) : null,
        notes: notes || "",
      },
      create: {
        studentId,
        matchId: match.id,
        position: position || "Player",
        stats: JSON.stringify(parsedStats || {}),
        rating: rating ? parseFloat(rating) : null,
        notes: notes || "",
      },
      include: {
        match: true,
        student: {
          select: {
            studentName: true,
            sport: true,
            role: true,
          },
        },
      },
    });

    console.log("Matches API - Successfully created performance:", performance.id);
    return NextResponse.json(performance, { status: 201 });
  } catch (error) {
    console.error("Matches API - Error creating match performance:", error);
    return NextResponse.json({ error: "Failed to create match performance" }, { status: 500 });
  }
} 