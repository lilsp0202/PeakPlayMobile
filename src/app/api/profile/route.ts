import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const user = await prisma.user.findUnique({
      where: {
        id: studentId || session.user.id,
      },
      include: {
        student: true,
        coach: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get profile data based on user role
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: session.user.role,
      phone: user.student?.phone || user.coach?.phone || '',
      sport: user.student?.sport || 'CRICKET',
      academy: user.student?.academy || user.coach?.academy || 'Not specified',
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error in profile route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, sport, academy } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Update user name
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
      },
    });

    // Update role-specific profile data
    if (session.user.role === 'ATHLETE') {
      // Update student profile
      await prisma.student.updateMany({
        where: { userId: session.user.id },
        data: {
          studentName: name.trim(),
          phone: phone || null,
          sport: sport || 'CRICKET',
          academy: academy || 'Not specified',
        },
      });
    } else if (session.user.role === 'COACH') {
      // Update coach profile
      await prisma.coach.updateMany({
        where: { userId: session.user.id },
        data: {
          name: name.trim(),
          phone: phone || null,
          academy: academy || 'Not specified',
        },
      });
    }

    // Return updated profile data
    const updatedProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: session.user.role,
      phone: phone || '',
      sport: sport || 'CRICKET',
      academy: academy || 'Not specified',
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 