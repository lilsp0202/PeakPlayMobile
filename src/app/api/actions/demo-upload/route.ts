import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id || session.user.role !== "COACH") {
      return NextResponse.json(
        { message: "Unauthorized - Only coaches can upload demo media" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const actionId = formData.get('actionId') as string;

    if (!file) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only images (JPEG, PNG, GIF) and videos (MP4, MOV, WebM) are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for base64 storage)
    const maxSize = 10 * 1024 * 1024; // 10MB for base64
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { message: "Coach profile not found" },
        { status: 404 }
      );
    }

    // Convert file to base64 for temporary storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;
    
    const demoMediaData = {
      demoMediaUrl: base64File,
      demoMediaType: file.type.startsWith('image/') ? 'image' : 'video',
      demoFileName: file.name,
      demoUploadedAt: new Date(),
    };

    // If actionId provided, update existing action
    if (actionId) {
      // Verify action belongs to coach
      const action = await prisma.action.findFirst({
        where: {
          id: actionId,
          coachId: coach.id,
        },
      });

      if (!action) {
        return NextResponse.json(
          { message: "Action not found or not authorized" },
          { status: 404 }
        );
      }

      const updatedAction = await prisma.action.update({
        where: { id: actionId },
        data: demoMediaData,
      });

      return NextResponse.json({
        message: "Demo media uploaded successfully",
        action: {
          id: updatedAction.id,
          demoMediaType: updatedAction.demoMediaType,
          demoFileName: updatedAction.demoFileName,
          demoUploadedAt: updatedAction.demoUploadedAt,
        }
      });
    }

    // If no actionId, return the media data for use in action creation
    return NextResponse.json({
      message: "Demo media processed successfully",
      mediaData: demoMediaData
    });

  } catch (error) {
    console.error("Error uploading demo media:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 