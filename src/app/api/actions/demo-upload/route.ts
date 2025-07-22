import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { FileStorageService } from "../../../../lib/fileStorage";
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

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: "File size must be less than 50MB" },
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

    // Upload to Supabase Storage with optimization
    let uploadResult;
    try {
      if (file.type.startsWith('image/')) {
        uploadResult = await FileStorageService.uploadImage(file, 'actions', {
          maxWidth: 1920,
          quality: 85,
          generateThumbnail: true
        });
      } else {
        uploadResult = await FileStorageService.uploadVideo(file, 'actions', 50 * 1024 * 1024);
      }
    } catch (uploadError) {
      console.error("Demo media upload error:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload demo media to storage" },
        { status: 500 }
      );
    }
    
    const demoMediaData = {
      demoMediaUrl: uploadResult.url,
      demoMediaType: file.type.startsWith('image/') ? 'image' : 'video',
      demoFileName: uploadResult.fileName,
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