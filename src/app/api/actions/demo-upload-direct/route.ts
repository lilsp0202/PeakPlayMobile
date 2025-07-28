import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { createClient } from '@supabase/supabase-js';
import type { Session } from "next-auth";

// Direct upload endpoint to bypass Vercel payload limits
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Direct upload URL generator starting...');
    
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id || session.user.role !== "COACH") {
      return NextResponse.json(
        { message: "Unauthorized - Only coaches can upload demo media" },
        { status: 401 }
      );
    }

    const { fileName, fileType, fileSize, actionId } = await request.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { message: "Missing required fields: fileName, fileType, fileSize" },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { message: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 413 }
      );
    }

    // Initialize Supabase
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

    // Generate unique file path
    const timestamp = Date.now();
    const cleanFileName = fileName.replace(/\s/g, '_').toLowerCase();
    const filePath = `demo-media/${timestamp}-${cleanFileName}`;

    try {
      // Generate signed upload URL (valid for 10 minutes)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .createSignedUploadUrl(filePath, {
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to generate upload URL: ${uploadError.message}`);
      }

      // Generate the public URL for accessing the file later
      const { data: publicData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      console.log('✅ Direct upload URL generated successfully');

      return NextResponse.json({
        uploadUrl: uploadData.signedUrl,
        mediaUrl: publicData.publicUrl,
        filePath,
        message: "Upload URL generated successfully"
      });

    } catch (storageError) {
      console.error('Storage URL generation error:', storageError);
      return NextResponse.json(
        { message: "Failed to generate upload URL" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Direct upload endpoint error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Direct upload URL generator endpoint",
    usage: "POST with fileName, fileType, fileSize to get signed upload URL",
    maxSize: "100MB",
    purpose: "Bypass Vercel payload limits for large files"
  });
} 