import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { signUpSchema, validateRequest } from "../../../../lib/validations";
import { checkRateLimit } from "../../../../lib/rate-limit";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 requests per minute for registration
    const rateLimitResponse = await checkRateLimit(request, 5);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(body, signUpSchema);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { email, username, password, role, name } = validation.data;

    // Check if user already exists (email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
      if (existingUser.username === username.toLowerCase()) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          password: hashedPassword,
          role,
          name,
        },
      });

      // Create associated Student or Coach record
      if (role === 'ATHLETE') {
        await tx.student.create({
          data: {
            userId: newUser.id,
            studentName: name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            age: 18, // Default age, should be updated in onboarding
            height: 0, // To be updated in onboarding
            weight: 0, // To be updated in onboarding
            academy: 'Not specified', // To be updated in onboarding
            sport: 'CRICKET',
            role: 'All-rounder', // Default role
          },
        });
      } else if (role === 'COACH') {
        await tx.coach.create({
          data: {
            userId: newUser.id,
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            academy: 'Not specified', // To be updated in onboarding
          },
        });
      }

      return newUser;
    });

    // Log successful registration
    console.log(`[REGISTRATION] New ${role} registered: ${email}`);

    return NextResponse.json(
      { 
        message: "User created successfully", 
        userId: user.id,
        role: user.role 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/auth/register',
      },
    });

    // Check for Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: "Email or username already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
} 