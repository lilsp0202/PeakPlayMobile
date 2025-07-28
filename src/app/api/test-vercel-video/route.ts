import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import type { Session } from "next-auth";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

// Comprehensive test endpoint for Vercel video upload debugging
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    deployment: process.env.VERCEL_ENV,
  };

  try {
    // Test 1: Session Authentication
    console.log('🔐 Testing authentication...');
    const session = await getServerSession(authOptions) as Session | null;
    diagnostics.auth = {
      hasSession: !!session,
      userId: session?.user?.id,
      role: session?.user?.role,
      sessionTime: Date.now() - startTime
    };

    if (!session?.user?.id || session.user.role !== "COACH") {
      diagnostics.authError = "No valid coach session";
    }

    // Test 2: Environment Variables
    console.log('🔧 Testing environment variables...');
    diagnostics.environment = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nodeEnv: process.env.NODE_ENV,
    };

    // Test 3: Request Headers
    console.log('📋 Checking request headers...');
    diagnostics.headers = {
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length'),
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
    };

    // Test 4: Body Parsing
    console.log('📦 Testing body parsing...');
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        diagnostics.body = {
          parseMethod: 'formData',
          hasFile: !!file,
          fileName: file?.name,
          fileSize: file?.size,
          fileType: file?.type,
          fileSizeMB: file ? (file.size / 1024 / 1024).toFixed(2) : 0
        };

        // Test 5: File Processing
        if (file && file.size > 0) {
          console.log(`📹 File details: ${file.name} (${diagnostics.body.fileSizeMB}MB)`);
          
          // Check if file size exceeds Vercel limits
          const vercelLimit = 50 * 1024 * 1024; // 50MB Vercel Pro
          if (file.size > vercelLimit) {
                          diagnostics.warning = `File size (${diagnostics.body.fileSizeMB}MB) exceeds Vercel Pro's 50MB limit`;
          }

          // Test reading file data
          try {
            const buffer = await file.arrayBuffer();
            diagnostics.fileProcessing = {
              bufferSize: buffer.byteLength,
              canReadFile: true,
              processingTime: Date.now() - startTime
            };
          } catch (fileError) {
            diagnostics.fileProcessing = {
              error: fileError instanceof Error ? fileError.message : 'Unknown file error',
              canReadFile: false
            };
          }
        }
      } else {
        diagnostics.body = {
          parseMethod: 'unknown',
          contentType: contentType,
          error: 'Unexpected content type'
        };
      }
    } catch (bodyError) {
      diagnostics.bodyError = {
        message: bodyError instanceof Error ? bodyError.message : 'Unknown error',
        type: bodyError instanceof Error ? bodyError.constructor.name : 'Unknown'
      };
    }

    // Test 6: Supabase Connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { data, error } = await supabase.storage.listBuckets();
        diagnostics.supabase = {
          connected: !error,
          buckets: data?.length || 0,
          error: error?.message
        };
      } catch (supabaseError) {
        diagnostics.supabase = {
          connected: false,
          error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
        };
      }
    }

    // Test 7: Performance Metrics
    diagnostics.performance = {
      totalTime: Date.now() - startTime,
      memoryUsage: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };

    console.log('✅ Diagnostics complete:', JSON.stringify(diagnostics, null, 2));

    return NextResponse.json({
      success: true,
      diagnostics,
      recommendations: [
        diagnostics.warning ? "Configure Vercel to handle larger files" : null,
        !diagnostics.auth.hasSession ? "Ensure proper authentication" : null,
        !diagnostics.supabase?.connected ? "Check Supabase configuration" : null,
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      diagnostics,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Video upload test endpoint",
    usage: "POST a video file to test upload capabilities on Vercel",
            maxSize: "100MB configured, but Vercel Pro limit is 50MB"
  });
} 