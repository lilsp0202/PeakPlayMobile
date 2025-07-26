import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import type { Session } from "next-auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      console.error("Coach creation - No session found");
      return NextResponse.json(
        { message: "Unauthorized - Please sign in first" },
        { status: 401 }
      );
    }

    const { name, academy } = await request.json();

    // Validate input
    if (!name || !academy) {
      console.error("Coach creation - Missing required fields:", { name: !!name, academy: !!academy });
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
      console.error("Coach creation - User not found:", session.user.id);
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
      console.log("Coach creation - Profile already exists, redirecting to dashboard");
      return NextResponse.json(
        { message: "Profile already exists", coach: existingCoach },
        { status: 200 }
      );
    }

    // Ensure username exists - generate one if missing
    let username = user.username;
    if (!username) {
      username = user.email.split('@')[0];
      console.log("Coach creation - Generated username from email:", username);
      
      // Update user with generated username
      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      });
    }

    console.log("Coach creation - Creating coach profile for:", user.email);

    // Create coach profile with user data
    const coach = await prisma.coach.create({
      data: {
        userId: session.user.id,
        name,
        username: username,
        email: user.email,
        academy,
      },
    });

    console.log("Coach creation - Coach profile created:", coach.id);

    return NextResponse.json(
      { message: "Coach profile created successfully", coach },
      { status: 201 }
    );
  } catch (error) {
    console.error("Coach creation error:", error);
    
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