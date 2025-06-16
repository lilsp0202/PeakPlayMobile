import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let studentId = body.studentId;
    let isCoach = session.user.role === "COACH";
    let isAthlete = session.user.role === "ATHLETE";

    // For athletes, determine their own studentId
    if (isAthlete) {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      studentId = student.id;
    }

    // For coaches, require studentId in body
    if (isCoach && !studentId) {
      return NextResponse.json({ error: "Student ID required" }, { status: 400 });
    }

    const {
      matchName,
      opponent,
      venue,
      matchDate,
      sport,
      matchType,
      result,
      position,
      stats,
      rating,
      notes,
    } = body;

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
          venue,
          matchDate: new Date(matchDate),
          sport,
          matchType,
          result,
        },
      });
    }

    // Create or update match performance
    const performance = await prisma.matchPerformance.upsert({
      where: {
        studentId_matchId: {
          studentId,
          matchId: match.id,
        },
      },
      update: {
        position,
        stats: JSON.stringify(stats),
        rating,
        notes,
      },
      create: {
        studentId,
        matchId: match.id,
        position,
        stats: JSON.stringify(stats),
        rating,
        notes,
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

    return NextResponse.json(performance, { status: 201 });
  } catch (error) {
    console.error("Error creating match performance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 