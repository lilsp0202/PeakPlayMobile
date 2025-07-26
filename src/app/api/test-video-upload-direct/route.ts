import { NextRequest, NextResponse } from "next/server";
import { FileStorageService } from "../../../lib/fileStorage";

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test Video Upload - Starting direct test...');
    
    // Test 1: Supabase Connection
    console.log('🔍 Testing Supabase connection...');
    const supabaseTest = await FileStorageService.testSupabaseConnection(5000);
    console.log('✅ Supabase connection:', supabaseTest);

    // Test 2: Storage Info
    console.log('🔍 Getting storage info...');
    const storageInfo = await FileStorageService.getStorageInfo();
    console.log('✅ Storage info:', storageInfo);

    // Test 3: Create a mock video file for testing
    console.log('🔍 Creating mock video file...');
    const mockVideoContent = new Uint8Array(1024 * 1024); // 1MB mock video
    const mockVideoFile = new File([mockVideoContent], 'test-video.mp4', {
      type: 'video/mp4'
    });

    // Test 4: Upload the mock video
    console.log('🔍 Testing video upload...');
    const uploadResult = await FileStorageService.uploadFile(
      mockVideoFile,
      'media',
      {
        onProgress: (progress) => {
          console.log(`📊 Upload progress: ${progress.percentage}% - ${progress.status}`);
        }
      }
    );

    console.log('✅ Upload result:', {
      url: uploadResult.url,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      uploadMethod: uploadResult.uploadMethod,
      processingTime: uploadResult.processingTime
    });

    return NextResponse.json({
      test: "video_upload_direct",
      status: "success",
      results: {
        supabaseConnection: supabaseTest,
        storageInfo: storageInfo,
        uploadResult: {
          url: uploadResult.url,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          uploadMethod: uploadResult.uploadMethod,
          processingTime: uploadResult.processingTime
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      test: "video_upload_direct",
      status: "error",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 