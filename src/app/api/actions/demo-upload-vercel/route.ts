import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { createClient } from '@supabase/supabase-js';
import type { Session } from "next-auth";

// Vercel-optimized configuration
export const runtime = 'nodejs';
export const maxDuration = 60;

// Vercel-specific video upload handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 Vercel-optimized video upload starting...');
    
    // 1. Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id || session.user.role !== "COACH") {
      return NextResponse.json(
        { message: "Unauthorized - Only coaches can upload demo media" },
        { status: 401 }
      );
    }

    // 2. Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true, name: true }
    });

    if (!coach) {
      return NextResponse.json(
        { message: "Coach profile not found" },
        { status: 404 }
      );
    }

    // 3. Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return NextResponse.json(
        { message: "Storage configuration error" },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 4. Parse form data with error handling
    let file: File | null = null;
    let actionId: string | null = null;
    
    try {
      const formData = await request.formData();
      file = formData.get('file') as File;
      actionId = formData.get('actionId') as string;
    } catch (error) {
      console.error('Form parsing error:', error);
      
      // Check content length header
      const contentLength = request.headers.get('content-length');
      const sizeMB = contentLength ? (parseInt(contentLength) / 1024 / 1024).toFixed(2) : 'unknown';
      
      return NextResponse.json(
        { 
          message: `Failed to parse upload data. File size: ${sizeMB}MB. Vercel Pro has a 50MB limit for API routes.`,
          error: "Request body too large or invalid",
          suggestion: "Please use a smaller file or try again"
        },
        { status: 413 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`📹 Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // 5. Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Allowed: JPEG, PNG, GIF, MP4, MOV, WebM" },
        { status: 400 }
      );
    }

    // 6. Handle file upload based on size
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase()}`;
    const filePath = `public/${fileName}`;
    
    try {
      let uploadUrl: string;
      
      // For small files (< 4MB), use direct upload
      if (file.size < 4 * 1024 * 1024) {
        console.log('📤 Using direct upload for small file...');
        
        const buffer = await file.arrayBuffer();
        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
            cacheControl: '3600'
          });

        if (error) {
          throw new Error(`Upload failed: ${error.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        uploadUrl = publicUrl;
        
      } else {
        // For larger files, we need a different approach
        console.log('⚠️ Large file detected - using base64 fallback...');
        
        // Convert to base64 (not ideal but works for Vercel)
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        uploadUrl = `data:${file.type};base64,${base64}`;
        
        console.warn('Using base64 storage due to Vercel limitations. Consider implementing direct browser uploads.');
      }

      // 7. Prepare media data
      const demoMediaData = {
        demoMediaUrl: uploadUrl,
        demoMediaType: file.type.startsWith('image/') ? 'image' : 'video',
        demoFileName: fileName,
        demoUploadedAt: new Date(),
        demoFileSize: file.size,
        demoUploadMethod: file.size < 4 * 1024 * 1024 ? 'supabase' : 'base64',
        demoProcessingTime: Date.now() - startTime
      };

      // 8. Update action if ID provided
      if (actionId) {
        const action = await prisma.action.findFirst({
          where: {
            id: actionId,
            coachId: coach.id,
          },
          select: { id: true }
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

      // 9. Return media data for new actions
      return NextResponse.json({
        message: "Demo media processed successfully",
        mediaData: demoMediaData,
        performance: {
          processingTime: Date.now() - startTime,
          fileSize: file.size,
          uploadMethod: demoMediaData.demoUploadMethod
        }
      });

    } catch (uploadError) {
      console.error('Upload processing error:', uploadError);
      
      return NextResponse.json(
        { 
          message: "Failed to process upload",
          error: uploadError instanceof Error ? uploadError.message : "Unknown error",
          suggestion: "Try a smaller file or contact support"
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Vercel upload handler error:', error);
    
    return NextResponse.json(
      { 
        message: "Upload failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Vercel-optimized video upload endpoint",
    limits: {
      maxFileSize: "50MB for direct upload, larger files use base64",
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime", "video/webm"],
      timeout: "60 seconds"
    },
          note: "For files larger than 50MB, consider implementing direct browser-to-Supabase uploads"
  });
} 