import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: performanceId } = await params;
    const body = await request.json();
    console.log("Match UPDATE API - Request body:", body);

    // Check if the performance exists and user has permission
    const existingPerformance = await prisma.matchPerformance.findUnique({
      where: { id: performanceId },
      include: {
        match: true,
        student: true,
      },
    });

    if (!existingPerformance) {
      return NextResponse.json({ error: "Match performance not found" }, { status: 404 });
    }

    // Authorization check
    if (session.user.role === "ATHLETE") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (!student || student.id !== existingPerformance.studentId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role === "COACH") {
      // Coaches can edit any student's performance
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Update match details
    const updatedMatch = await prisma.match.update({
      where: { id: existingPerformance.matchId },
      data: {
        matchName: matchName || existingPerformance.match.matchName,
        opponent: opponent || existingPerformance.match.opponent,
        venue: venue !== undefined ? venue : existingPerformance.match.venue,
        matchDate: matchDate ? new Date(matchDate) : existingPerformance.match.matchDate,
        sport: sport || existingPerformance.match.sport,
        matchType: matchType || existingPerformance.match.matchType,
        result: result || existingPerformance.match.result,
      },
    });

    // Parse stats if it's a string
    let parsedStats = stats;
    if (typeof stats === 'string') {
      try {
        parsedStats = JSON.parse(stats);
      } catch (e) {
        console.error("Match UPDATE API - Error parsing stats:", e);
        parsedStats = {};
      }
    }

    // Update performance details
    const updatedPerformance = await prisma.matchPerformance.update({
      where: { id: performanceId },
      data: {
        position: position !== undefined ? position : existingPerformance.position,
        stats: parsedStats !== undefined ? JSON.stringify(parsedStats) : existingPerformance.stats,
        rating: rating !== undefined ? (rating ? parseFloat(rating) : null) : existingPerformance.rating,
        notes: notes !== undefined ? notes : existingPerformance.notes,
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

    console.log("Match UPDATE API - Successfully updated performance:", updatedPerformance.id);
    return NextResponse.json(updatedPerformance, { status: 200 });
  } catch (error) {
    console.error("Match UPDATE API - Error updating match performance:", error);
    return NextResponse.json({ error: "Failed to update match performance" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: performanceId } = await params;

    // Check if the performance exists and user has permission
    const existingPerformance = await prisma.matchPerformance.findUnique({
      where: { id: performanceId },
      include: {
        match: true,
        student: true,
      },
    });

    if (!existingPerformance) {
      return NextResponse.json({ error: "Match performance not found" }, { status: 404 });
    }

    // Authorization check
    if (session.user.role === "ATHLETE") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (!student || student.id !== existingPerformance.studentId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (session.user.role === "COACH") {
      // Coaches can delete any student's performance
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the performance
    await prisma.matchPerformance.delete({
      where: { id: performanceId },
    });

    // Check if this was the only performance for this match
    const remainingPerformances = await prisma.matchPerformance.findMany({
      where: { matchId: existingPerformance.matchId },
    });

    // If no other performances exist for this match, delete the match too
    if (remainingPerformances.length === 0) {
      await prisma.match.delete({
        where: { id: existingPerformance.matchId },
      });
      console.log("Match DELETE API - Also deleted match:", existingPerformance.matchId);
    }

    console.log("Match DELETE API - Successfully deleted performance:", performanceId);
    return NextResponse.json({ message: "Match performance deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Match DELETE API - Error deleting match performance:", error);
    return NextResponse.json({ error: "Failed to delete match performance" }, { status: 500 });
  }
}
