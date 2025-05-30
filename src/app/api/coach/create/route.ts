import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, academy } = await request.json();

    // Validate input
    if (!name || !academy) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user information for the coach profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if coach profile already exists
    const existingCoach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (existingCoach) {
      return NextResponse.json(
        { message: "Coach profile already exists" },
        { status: 400 }
      );
    }

    // Create coach profile with user data
    const coach = await prisma.coach.create({
      data: {
        userId: session.user.id,
        name,
        username: user.username,
        email: user.email,
        academy,
      },
    });

    return NextResponse.json(
      { message: "Coach profile created successfully", coach },
      { status: 201 }
    );
  } catch (error) {
    console.error("Coach creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 