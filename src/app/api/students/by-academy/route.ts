import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized", students: [] },
        { status: 401 }
      );
    }

    // Get the academy parameter from the query string
    const { searchParams } = new URL(request.url);
    const academy = searchParams.get('academy');

    if (!academy) {
      return NextResponse.json(
        { message: "Academy parameter is required", students: [] },
        { status: 400 }
      );
    }

    // Fetch all students in the specified academy without a coach
    const students = await prisma.student.findMany({
      where: {
        academy: academy,
        coachId: null, // Only unassigned students
      },
      select: {
        id: true,
        studentName: true,
        username: true,
        email: true,
        age: true,
        role: true,
        academy: true,
        sport: true,
      },
    });

    // Always return students array, even if empty
    return NextResponse.json({ students: students || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching students by academy:", error);
    return NextResponse.json(
      { message: "Internal server error", students: [] },
      { status: 500 }
    );
  }
} 