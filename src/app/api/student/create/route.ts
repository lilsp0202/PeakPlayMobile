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

    const { name, age, height, weight, academy, role } = await request.json();

    // Validate input
    if (!name || !age || !height || !weight || !academy || !role) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user information for the student profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check if student profile already exists
    const existingStudent = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (existingStudent) {
      return NextResponse.json(
        { message: "Student profile already exists" },
        { status: 400 }
      );
    }

    // Create student profile with user data
    const student = await prisma.student.create({
      data: {
        userId: session.user.id,
        studentName: name,
        username: user.username,
        email: user.email,
        age,
        height,
        weight,
        academy,
        role,
      },
    });

    return NextResponse.json(
      { message: "Student profile created successfully", student },
      { status: 201 }
    );
  } catch (error) {
    console.error("Student creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 