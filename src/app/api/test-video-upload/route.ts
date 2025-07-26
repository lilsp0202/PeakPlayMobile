import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { FileStorageService } from "../../../lib/fileStorage";

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Video Upload - Starting test...');
    
    // Test 1: Session Check
    const session = await getServerSession(authOptions);
    console.log('🔍 Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      sessionTime: Date.now()
    });

    if (!session?.user?.id) {
      return NextResponse.json({
        test: "session_check",
        status: "failed",
        message: "No session found",
        debug: {
          hasSession: false,
          sessionData: session
        }
      }, { status: 401 });
    }

    if (session.user.role !== "COACH") {
      return NextResponse.json({
        test: "role_check",
        status: "failed",
        message: "User is not a coach",
        debug: {
          userRole: session.user.role,
          expectedRole: "COACH"
        }
      }, { status: 403 });
    }

    // Test 2: Coach Profile Check
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true, name: true }
    });

    console.log('👨‍💼 Coach check:', {
      hasCoach: !!coach,
      coachId: coach?.id,
      coachName: coach?.name
    });

    if (!coach) {
      return NextResponse.json({
        test: "coach_profile",
        status: "failed",
        message: "Coach profile not found",
        debug: {
          userId: session.user.id,
          hasCoach: false
        }
      }, { status: 404 });
    }

    // Test 3: Supabase Connection Check
    const storageInfo = await FileStorageService.getStorageInfo();
    console.log('💾 Storage check:', storageInfo);

    // Test 4: File Upload Simulation
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        test: "file_upload",
        status: "failed",
        message: "No file provided",
        debug: {
          formDataKeys: Array.from(formData.keys()),
          hasFile: false
        }
      }, { status: 400 });
    }

    console.log('📁 File check:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      isVideo: file.type.startsWith('video/'),
      isImage: file.type.startsWith('image/')
    });

    // Test 5: Upload Method Selection
    let uploadMethod = 'unknown';
    if (file.type.startsWith('image/')) {
      uploadMethod = 'uploadImage';
    } else if (file.type.startsWith('video/')) {
      uploadMethod = 'uploadFile';
    }

    console.log('🚀 Upload method:', uploadMethod);

    // Test 6: Actual Upload Test
    let uploadResult;
    try {
      if (file.type.startsWith('image/')) {
        uploadResult = await FileStorageService.uploadImage(file, 'media', {
          maxWidth: 1920,
          quality: 85,
          generateThumbnail: true
        });
      } else if (file.type.startsWith('video/')) {
        uploadResult = await FileStorageService.uploadFile(file, 'media', {
          onProgress: (progress) => {
            console.log(`📊 Upload progress: ${progress.percentage}% - ${progress.status}`);
          }
        });
      } else {
        throw new Error('Unsupported file type');
      }

      console.log('✅ Upload successful:', {
        method: uploadResult.uploadMethod,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        processingTime: uploadResult.processingTime
      });

      return NextResponse.json({
        test: "video_upload",
        status: "success",
        message: "Video upload test completed successfully",
        data: {
          session: {
            hasSession: true,
            userId: session.user.id,
            userRole: session.user.role
          },
          coach: {
            id: coach.id,
            name: coach.name
          },
          storage: storageInfo,
          upload: {
            method: uploadResult.uploadMethod,
            fileName: uploadResult.fileName,
            fileSize: uploadResult.fileSize,
            processingTime: uploadResult.processingTime,
            url: uploadResult.url
          }
        }
      });

    } catch (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      
      return NextResponse.json({
        test: "video_upload",
        status: "failed",
        message: "Upload test failed",
        error: uploadError instanceof Error ? uploadError.message : "Unknown error",
        debug: {
          session: {
            hasSession: true,
            userId: session.user.id,
            userRole: session.user.role
          },
          coach: {
            id: coach.id,
            name: coach.name
          },
          storage: storageInfo,
          file: {
            name: file.name,
            type: file.type,
            size: file.size
          },
          uploadMethod
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    
    return NextResponse.json({
      test: "general",
      status: "error",
      message: "Test failed with unexpected error",
      error: error instanceof Error ? error.message : "Unknown error",
      debug: {
        errorType: error?.constructor?.name,
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
} 