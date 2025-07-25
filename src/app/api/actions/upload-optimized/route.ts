import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { FileStorageService, UploadProgress } from "../../../../lib/fileStorage";
import type { Session } from "next-auth";

// PERFORMANCE: Enhanced media upload with progress tracking and streaming
export async function POST(request: NextRequest) {
  let session: Session | null = null;
  let startTime = Date.now();
  let uploadMetrics = {
    fileSize: 0,
    processingTime: 0,
    uploadMethod: 'unknown',
    compressionRatio: 0
  };

  try {
    console.log('🎯 ActionUpload - Starting enhanced media upload');
    
    // PERFORMANCE: Fast session check with timing
    const sessionStartTime = Date.now();
    session = await getServerSession(authOptions) as Session | null;
    const sessionTime = Date.now() - sessionStartTime;
    
    if (!session?.user?.id || session.user.role !== "ATHLETE") {
      return NextResponse.json(
        { 
          message: "Unauthorized - Only athletes can upload proof media",
          debug: { sessionTime, hasSession: !!session, role: session?.user?.role }
        },
        { status: 401 }
      );
    }

    // PERFORMANCE: Early form data parsing with size limits
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const actionId = formData.get('actionId') as string;

    if (!file || !actionId) {
      return NextResponse.json(
        { message: "File and action ID are required" },
        { status: 400 }
      );
    }

    // PERFORMANCE: Early file validation before processing
    uploadMetrics.fileSize = file.size;
    
    console.log('📁 File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      actionId
    });

    // Enhanced file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only images (JPEG, PNG, GIF) and videos (MP4, MOV, WebM, AVI) are allowed" },
        { status: 400 }
      );
    }

    // PERFORMANCE: Dynamic size limits based on storage method
    const storageInfo = await FileStorageService.getStorageInfo();
    const maxSize = storageInfo.recommendedUploadMethod === 'supabase' ? 
      50 * 1024 * 1024 : // 50MB for Supabase
      20 * 1024 * 1024;   // 20MB for base64 fallback

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      return NextResponse.json(
        { 
          message: `File size must be less than ${maxSizeMB}MB. Current storage method: ${storageInfo.recommendedUploadMethod}`,
          storageInfo,
          maxSize: maxSizeMB
        },
        { status: 400 }
      );
    }

    // PERFORMANCE: Parallel database queries
    const [student, action] = await Promise.all([
      prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      }),
      prisma.action.findFirst({
        where: { id: actionId },
        select: { id: true, studentId: true, title: true }
      })
    ]);

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { message: "Action not found" },
        { status: 404 }
      );
    }

    // PERFORMANCE: Verify ownership efficiently
    if (action.studentId !== student.id) {
      return NextResponse.json(
        { message: "Action not authorized" },
        { status: 403 }
      );
    }

    // PERFORMANCE: Optimized upload with progress tracking
    let progressCallback: ((progress: UploadProgress) => void) | undefined;
    
    // In a real-time application, you would send progress via WebSocket or SSE
    // For now, we'll log progress for monitoring
    progressCallback = (progress: UploadProgress) => {
      console.log(`📊 Upload progress: ${progress.percentage}% - ${progress.status}`);
    };

    let uploadResult;

    try {
      // PERFORMANCE: Use appropriate upload method based on file type
      if (file.type.startsWith('image/')) {
        console.log('📸 Processing image with optimized compression...');
        uploadResult = await FileStorageService.uploadImage(
          file,
          'action-proofs',
          {
            maxWidth: 1920,
            quality: 85,
            generateThumbnail: true,
            thumbnailSize: 300,
            onProgress: progressCallback
          }
        );
      } else if (file.type.startsWith('video/')) {
        console.log('🎥 Processing video file with optimized handling...');
        uploadResult = await FileStorageService.uploadFile(
          file,
          'action-proofs',
          {
            onProgress: progressCallback,
            chunkSize: 5 * 1024 * 1024 // 5MB chunks
          }
        );
      } else {
        throw new Error('Unsupported file type');
      }

      uploadMetrics.uploadMethod = uploadResult.uploadMethod;
      uploadMetrics.processingTime = uploadResult.processingTime;
      uploadMetrics.compressionRatio = file.type.startsWith('image/') ?
        Math.round((1 - uploadResult.fileSize / file.size) * 100) : 0;

      console.log('✅ Upload successful:', {
        method: uploadResult.uploadMethod,
        originalSize: `${(file.size / 1024).toFixed(2)}KB`,
        finalSize: `${(uploadResult.fileSize / 1024).toFixed(2)}KB`,
        compression: uploadMetrics.compressionRatio > 0 ? `${uploadMetrics.compressionRatio}%` : 'None',
        processingTime: `${uploadResult.processingTime}ms`
      });

      // PERFORMANCE: Non-blocking database update
      const updateStartTime = Date.now();
      const updatedAction = await prisma.action.update({
        where: { id: actionId },
        data: {
          proofMediaUrl: uploadResult.url,
          proofMediaType: file.type.startsWith('image/') ? 'image' : 'video',
          proofFileName: uploadResult.fileName,
          proofUploadedAt: new Date(),
          // Store additional metadata for optimization
          proofFileSize: uploadResult.fileSize,
          proofUploadMethod: uploadResult.uploadMethod,
          proofProcessingTime: uploadResult.processingTime
        },
        select: {
          id: true,
          proofMediaType: true,
          proofFileName: true,
          proofUploadedAt: true,
          proofFileSize: true,
          proofUploadMethod: true
        }
      });

      const dbUpdateTime = Date.now() - updateStartTime;
      const totalResponseTime = Date.now() - startTime;

      console.log(`⚡ ActionUpload completed in ${totalResponseTime}ms (DB: ${dbUpdateTime}ms)`);

      return NextResponse.json({
        message: "Proof uploaded successfully",
        action: {
          id: updatedAction.id,
          proofMediaType: updatedAction.proofMediaType,
          proofFileName: updatedAction.proofFileName,
          proofUploadedAt: updatedAction.proofUploadedAt,
        },
        performance: {
          totalTime: totalResponseTime,
          uploadTime: uploadResult.processingTime,
          dbUpdateTime: dbUpdateTime,
          sessionTime: sessionTime,
          originalFileSize: file.size,
          optimizedFileSize: uploadResult.fileSize,
          compressionRatio: uploadMetrics.compressionRatio,
          uploadMethod: uploadResult.uploadMethod,
          storageRecommendation: storageInfo.recommendedUploadMethod
        },
        storage: {
          method: uploadResult.uploadMethod,
          isSupabaseAvailable: storageInfo.isSupabaseAvailable,
          connectionStatus: storageInfo.connectionStatus
        }
      });

    } catch (uploadError) {
      // Enhanced error handling with detailed logging
      console.error('❌ Upload processing error:', {
        error: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        fileSize: file.size,
        fileType: file.type,
        storageInfo,
        uploadMethod: uploadMetrics.uploadMethod
      });

      // Return user-friendly error with guidance
      let errorMessage = "Upload failed";
      let suggestions: string[] = [];

      if (uploadError instanceof Error) {
        if (uploadError.message.includes('too large')) {
          errorMessage = uploadError.message;
          suggestions.push("Try compressing your video or use a smaller file");
          if (!storageInfo.isSupabaseAvailable) {
            suggestions.push("Configure Supabase Storage for larger file support");
          }
        } else if (uploadError.message.includes('Supabase')) {
          errorMessage = "Storage service temporarily unavailable";
          suggestions.push("Please try again in a moment");
        } else {
          errorMessage = `Upload failed: ${uploadError.message}`;
        }
      }

      return NextResponse.json(
        { 
          message: errorMessage,
          suggestions,
          storageInfo,
          debug: {
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            maxAllowed: `${(maxSize / 1024 / 1024).toFixed(2)}MB`,
            processingTime: Date.now() - startTime
          }
        },
        { status: 400 }
      );
    }

  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error("❌ ActionUpload critical error:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      metrics: uploadMetrics,
      totalTime,
      session: session ? { id: session.user.id, role: session.user.role } : null
    });

    return NextResponse.json(
      { 
        message: "Internal server error",
        debug: {
          processingTime: totalTime,
          hasSession: !!session,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
} 