import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import type { Session } from "next-auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      console.error("Student creation - No session found");
      return NextResponse.json(
        { message: "Unauthorized - Please sign in first" },
        { status: 401 }
      );
    }

    const { name, age, height, weight, academy, role } = await request.json();



    // Validate input - properly handle numeric fields that could be 0
    if (!name || age === undefined || age === null || height === undefined || height === null || weight === undefined || weight === null || !academy || !role) {
      console.error("Student creation - Missing required fields:", { 
        name: !!name, 
        age: age !== undefined && age !== null, 
        height: height !== undefined && height !== null, 
        weight: weight !== undefined && weight !== null, 
        academy: !!academy, 
        role: !!role 
      });
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
      console.error("Student creation - User not found:", session.user.id);
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
      console.log("Student creation - Profile already exists, updating with onboarding data");
      
      // Update existing student profile with onboarding data
      const updatedStudent = await prisma.student.update({
        where: { userId: session.user.id },
        data: {
          studentName: name,
          age: parseInt(age.toString()),
          height: parseFloat(height.toString()),
          weight: parseFloat(weight.toString()),
          academy,
          role,
        },
      });

      console.log("Student creation - Updated existing profile:", {
        id: updatedStudent.id,
        age: updatedStudent.age,
        height: updatedStudent.height,
        weight: updatedStudent.weight,
        academy: updatedStudent.academy,
        role: updatedStudent.role
      });

      return NextResponse.json(
        { message: "Profile updated successfully", student: updatedStudent },
        { status: 200 }
      );
    }

    // Ensure username exists - generate one if missing
    let username = user.username;
    if (!username) {
      username = user.email.split('@')[0];
      console.log("Student creation - Generated username from email:", username);
      
      // Update user with generated username
      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      });
    }

    console.log("Student creation - Creating student profile for:", user.email);

    // Create student profile with user data
    const studentData = {
      userId: session.user.id,
      studentName: name,
      username: username,
      email: user.email,
      age: parseInt(age.toString()),
      height: parseFloat(height.toString()),
      weight: parseFloat(weight.toString()),
      academy,
      sport: "CRICKET", // Add default sport
      role,
    };

    const student = await prisma.student.create({
      data: studentData,
    });

    console.log("Student creation - Student profile created:", student.id);

    // Also create a skills profile for the student
    await prisma.skills.create({
      data: {
        userId: session.user.id,
        studentId: student.id,
        studentName: name,
        studentEmail: user.email,
        age: parseInt(age.toString()),
        category: "PHYSICAL"
      }
    });

    console.log("Student creation - Skills profile created");

    return NextResponse.json(
      { message: "Student profile created successfully", student },
      { status: 201 }
    );
  } catch (error) {
    console.error("Student creation error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { message: "A profile with this information already exists" },
          { status: 400 }
        );
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { message: "Invalid user data - please try signing in again" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { message: "Internal server error - please try again" },
      { status: 500 }
    );
  }
} 