import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: {
        students: {
          select: {
            id: true,
            studentName: true,
            username: true,
            email: true,
            age: true,
            height: true,
            weight: true,
            role: true,
          },
        },
      },
    });

    if (!coach) {
      return NextResponse.json(
        { message: "Coach profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(coach, { status: 200 });
  } catch (error) {
    console.error("Error fetching coach profile:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 