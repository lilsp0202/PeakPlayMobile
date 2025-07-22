import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { FileStorageService } from "../../../../lib/fileStorage";
import type { Session } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id || session.user.role !== "ATHLETE") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const actionId = formData.get('actionId') as string;

    if (!file || !actionId) {
      return NextResponse.json(
        { message: "File and action ID are required" },
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

    // Get student info
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    // Verify action belongs to student
    const action = await prisma.action.findFirst({
      where: {
        id: actionId,
        studentId: student.id,
      },
    });

    if (!action) {
      return NextResponse.json(
        { message: "Action not found" },
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
      console.error("File upload error:", uploadError);
      return NextResponse.json(
        { message: "Failed to upload file to storage" },
        { status: 500 }
      );
    }
    
    // Update action with proof media
    const updatedAction = await prisma.action.update({
      where: { id: actionId },
      data: {
        proofMediaUrl: uploadResult.url,
        proofMediaType: file.type.startsWith('image/') ? 'image' : 'video',
        proofFileName: uploadResult.fileName,
        proofUploadedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Proof uploaded successfully",
      action: {
        id: updatedAction.id,
        proofMediaType: updatedAction.proofMediaType,
        proofFileName: updatedAction.proofFileName,
        proofUploadedAt: updatedAction.proofUploadedAt,
      }
    });

  } catch (error) {
    console.error("Error uploading proof:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 