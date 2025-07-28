import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { FileStorageService, UploadProgress } from "../../../../lib/fileStorage";
import { createClient } from '@supabase/supabase-js';
import type { Session } from "next-auth";

// Configure for Vercel deployment
export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum allowed duration for the function

// PERFORMANCE: Enhanced demo media upload with progress tracking and streaming
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
    console.log('🎯 DemoUpload - Starting optimized media upload');
    
    // SESSION FIX: Enhanced session validation with timeout handling
    const sessionStartTime = Date.now();
    try {
      session = await getServerSession(authOptions) as Session | null;
    } catch (sessionError) {
      console.error('❌ Session retrieval failed:', sessionError);
      return NextResponse.json(
        { 
          message: "Session validation failed. Please log in again.",
          error: "SESSION_RETRIEVAL_ERROR"
        },
        { status: 401 }
      );
    }
    
    const sessionTime = Date.now() - sessionStartTime;
    console.log(`🔐 Session validation completed in ${sessionTime}ms`);
    
    if (!session?.user?.id || session.user.role !== "COACH") {
      return NextResponse.json(
        { 
          message: "Unauthorized - Only coaches can upload demo media",
          debug: { sessionTime, hasSession: !!session, role: session?.user?.role }
        },
        { status: 401 }
      );
    }

    // Additional session health check for large uploads
    if (!session.user.email) {
      console.warn('⚠️ Session missing critical fields, potential corruption');
      return NextResponse.json(
        { 
          message: "Session incomplete. Please log in again.",
          error: "SESSION_INCOMPLETE"
        },
        { status: 401 }
      );
    }

    // PERFORMANCE: Early form data parsing with size limits
    // VERCEL FIX: Enhanced body parsing with size limit detection
    let formData: FormData;
    let file: File | null = null;
    let actionId: string | null = null;
    
    try {
      // Check Content-Length header before parsing to detect oversized requests
      const contentLength = request.headers.get('content-length');
      const isVercel = process.env.VERCEL === '1';
      const vercelSizeLimit = 50 * 1024 * 1024; // 50MB Vercel Pro limit
      
      if (isVercel && contentLength && parseInt(contentLength) > vercelSizeLimit) {
        console.log(`⚠️ VERCEL SIZE LIMIT: Request size ${Math.round(parseInt(contentLength) / 1024 / 1024)}MB exceeds 50MB limit`);
        return NextResponse.json(
          { 
            message: "File too large for Vercel serverless functions (max 50MB). Please use a smaller file.",
            error: "VERCEL_SIZE_LIMIT_EXCEEDED",
            maxSize: "50MB",
            actualSize: `${Math.round(parseInt(contentLength) / 1024 / 1024)}MB`,
            suggestion: "Compress your video or use a shorter clip"
          },
          { status: 413 }
        );
      }

      // FORMDATA FIX: Enhanced parsing with timeout and retry logic
      const parseTimeout = 30000; // 30 second timeout for parsing
      const parsePromise = Promise.race([
        request.formData(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FormData parsing timeout')), parseTimeout)
        )
      ]);
      
      formData = await parsePromise as FormData;
      file = formData.get('file') as File;
      actionId = formData.get('actionId') as string;
      
      // Validate parsed data integrity
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file data received');
      }
      
      if (file.size === 0) {
        throw new Error('Received empty file');
      }
      
      console.log(`✅ FormData parsed successfully: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
      
             // Additional file size validation after parsing
       if (file && isVercel && file.size > vercelSizeLimit) {
         console.log(`⚠️ VERCEL FILE SIZE: File ${file.name} (${Math.round(file.size / 1024 / 1024)}MB) exceeds Vercel limit`);
         return NextResponse.json(
           { 
             message: "Video file too large for current deployment. Please use a file smaller than 50MB.",
             error: "FILE_SIZE_LIMIT_EXCEEDED",
             maxSize: "50MB",
             fileSize: `${Math.round(file.size / 1024 / 1024)}MB`,
             fileName: file.name
           },
           { status: 413 }
         );
       }
      
    } catch (parseError) {
      console.error('❌ FormData parsing error:', parseError);
      
      // Enhanced error detection for common Vercel issues
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      const isLikelySizeIssue = errorMessage.includes('body') || errorMessage.includes('size') || errorMessage.includes('limit');
      
      return NextResponse.json(
        { 
          message: isLikelySizeIssue 
            ? "File too large for upload. Please use a smaller video file (max 50MB on current deployment)." 
            : "Failed to process upload. Please try again.",
          error: errorMessage,
          isVercel: process.env.VERCEL === '1',
          suggestion: isLikelySizeIssue 
            ? "Compress your video or use a shorter clip" 
            : "Check your internet connection and try again"
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { message: "File is required" },
        { status: 400 }
      );
    }

    // PERFORMANCE: Early file validation before processing
    uploadMetrics.fileSize = file.size;

    console.log('📁 Demo file details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      actionId: actionId || 'new_action'
    });

    // Enhanced file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only images (JPEG, PNG, GIF) and videos (MP4, MOV, WebM, AVI) are allowed" },
        { status: 400 }
      );
    }

    // PERFORMANCE: Dynamic size limits based on storage method and file type
    const storageInfo = await FileStorageService.getStorageInfo();
    
    // USER SPECIFIED: 100MB limit for all media files
    const maxSize = 100 * 1024 * 1024; // 100MB as per user requirement

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1024 / 1024;
      return NextResponse.json(
        { 
          message: `File size must be less than ${maxSizeMB}MB for ${file.type.startsWith('image/') ? 'images' : 'videos'}. Current storage method: ${storageInfo.recommendedUploadMethod}`,
          storageInfo,
          maxSize: maxSizeMB,
          fileType: file.type.startsWith('image/') ? 'image' : 'video'
        },
        { status: 400 }
      );
    }

    // PERFORMANCE: Get coach info efficiently
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

    // PERFORMANCE: Progress tracking callback for better UX
    let progressCallback: ((progress: UploadProgress) => void) | undefined;
    
    progressCallback = (progress: UploadProgress) => {
      console.log(`📊 Demo upload progress: ${progress.percentage}% - ${progress.status}`);
    };

    let uploadResult;
    let demoMediaData: any;

    try {
      // PERFORMANCE: Use optimized upload methods based on file type
      if (file.type.startsWith('image/')) {
        console.log('📸 Processing demo image with optimized compression...');
        
        // PERFORMANCE: Async image processing with streaming
        uploadResult = await FileStorageService.uploadImage(
          file,
          'media',
          {
            maxWidth: 1920,
            quality: 85,  // Higher quality for demo images
            generateThumbnail: true,
            thumbnailSize: 300,
            onProgress: progressCallback,
            // PERFORMANCE: Use WebP for better compression if supported
            outputFormat: 'webp',
            // PERFORMANCE: Progressive JPEG for faster loading
            progressive: true
          }
        );
      } else if (file.type.startsWith('video/')) {
        console.log('🎥 Processing demo video with Vercel-optimized handling...');
        
        // For Vercel, use direct Supabase upload without processing
        try {
          // Initialize Supabase client
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing');
          }
          
          const supabase = createClient(supabaseUrl, supabaseKey);
          const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_').toLowerCase()}`;
          const filePath = `public/${fileName}`;
          
          // Check if we're running on Vercel and file is large
          const isVercel = process.env.VERCEL === '1';
          const isLargeFile = file.size > 4 * 1024 * 1024; // 4MB
          
          if (isVercel && isLargeFile) {
            console.log('⚠️ Large file on Vercel detected, using direct upload...');
          }
          
          // SUPABASE FIX: Enhanced upload with timeout and retry logic
          console.log(`🔄 Converting file to buffer for Supabase upload...`);
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Upload with retry logic for connection issues
          let uploadResult = null;
          let lastError = null;
          const maxRetries = 3;
          const baseTimeout = 60000; // 60 seconds base timeout
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`🚀 Supabase upload attempt ${attempt}/${maxRetries} for ${file.name}`);
              
              // Create upload promise with timeout
              const uploadPromise = supabase!.storage
                .from('media')
                .upload(filePath, buffer, {
                  contentType: file.type,
                  upsert: true,
                  cacheControl: '3600'
                });
              
              // Race against timeout (increase timeout for larger files)
              const timeoutMs = baseTimeout + (file.size / 1024 / 1024) * 10000; // +10s per MB
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Supabase upload timeout after ${timeoutMs/1000}s`)), timeoutMs)
              );
              
              const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]) as any;
              
              if (uploadError) {
                throw new Error(`Supabase upload error: ${uploadError.message}`);
              }
              
              uploadResult = data;
              console.log(`✅ Supabase upload successful on attempt ${attempt}`);
              break;
              
            } catch (attemptError) {
              lastError = attemptError;
              console.log(`❌ Upload attempt ${attempt} failed:`, attemptError instanceof Error ? attemptError.message : attemptError);
              
              // Don't retry on certain errors
              if (attemptError instanceof Error && 
                  (attemptError.message.includes('authentication') || 
                   attemptError.message.includes('authorization') ||
                   attemptError.message.includes('file') && attemptError.message.includes('too large'))) {
                console.log(`🚫 Non-retryable error detected, aborting retries`);
                break;
              }
              
              // Wait before retry (exponential backoff)
              if (attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
              }
            }
          }
          
          if (!uploadResult && lastError) {
            throw new Error(`Supabase video upload failed after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
          }

          const publicUrl = supabase!.storage.from('media').getPublicUrl(filePath).data.publicUrl;
          
          uploadResult = {
            url: publicUrl,
            fileName: fileName,
            fileSize: file.size,
            mimeType: file.type,
            uploadMethod: 'supabase' as const,
            processingTime: Date.now() - startTime
          };
          
        } catch (videoError) {
          console.error('Video upload error:', videoError);
          // Fallback to FileStorageService method
          uploadResult = await FileStorageService.uploadFile(
            file,
            'media',
            {
              onProgress: progressCallback,
              chunkSize: 5 * 1024 * 1024 // 5MB chunks
            }
          );
        }
      } else {
        throw new Error('Unsupported file type for demo upload');
      }

      uploadMetrics.uploadMethod = uploadResult.uploadMethod;
      uploadMetrics.processingTime = uploadResult.processingTime;
      uploadMetrics.compressionRatio = file.type.startsWith('image/') ?
        Math.round((1 - uploadResult.fileSize / file.size) * 100) : 0;

      console.log('✅ Demo upload successful:', {
        method: uploadResult.uploadMethod,
        originalSize: `${(file.size / 1024).toFixed(2)}KB`,
        finalSize: `${(uploadResult.fileSize / 1024).toFixed(2)}KB`,
        compression: uploadMetrics.compressionRatio > 0 ? `${uploadMetrics.compressionRatio}%` : 'None',
        processingTime: `${uploadResult.processingTime}ms`,
        hasThumbnail: !!uploadResult.thumbnailUrl
      });

      demoMediaData = {
        demoMediaUrl: uploadResult.url,
        demoMediaType: file.type.startsWith('image/') ? 'image' : 'video',
        demoFileName: uploadResult.fileName,
        demoUploadedAt: new Date(),
        demoFileSize: uploadResult.fileSize,
        demoUploadMethod: uploadResult.uploadMethod,
        demoProcessingTime: uploadResult.processingTime
      };

      // If actionId provided and it's not 'temp', update existing action
      if (actionId && actionId !== 'temp') {
        // PERFORMANCE: Verify action ownership efficiently
        const action = await prisma.action.findFirst({
          where: {
            id: actionId,
            coachId: coach.id,
          },
          select: { id: true, title: true }
        });

        if (!action) {
          return NextResponse.json(
            { message: "Action not found or not authorized" },
            { status: 404 }
          );
        }

        const updateStartTime = Date.now();
        const updatedAction = await prisma.action.update({
          where: { id: actionId },
          data: demoMediaData,
          select: {
            id: true,
            demoMediaType: true,
            demoFileName: true,
            demoUploadedAt: true,
            demoFileSize: true,
            demoUploadMethod: true,
            demoProcessingTime: true
          }
        });

        const dbUpdateTime = Date.now() - updateStartTime;
        const totalResponseTime = Date.now() - startTime;

        console.log(`⚡ Demo action update completed in ${totalResponseTime}ms (DB: ${dbUpdateTime}ms)`);

        return NextResponse.json({
          message: "Demo media uploaded and action updated successfully",
          action: updatedAction,
          uploadMetrics: {
            ...uploadMetrics,
            totalTime: totalResponseTime,
            dbTime: dbUpdateTime,
            hasThumbnail: !!uploadResult.thumbnailUrl,
            thumbnailUrl: uploadResult.thumbnailUrl
          },
          performance: {
            fileSize: uploadMetrics.fileSize,
            compression: uploadMetrics.compressionRatio,
            uploadMethod: uploadMetrics.uploadMethod,
            processingTime: uploadMetrics.processingTime
          }
        }, { status: 200 });
      }

      // If no actionId or actionId is 'temp', return the media data for use in action creation
      const totalResponseTime = Date.now() - startTime;
      
      console.log(`⚡ Demo media processing completed in ${totalResponseTime}ms`);

      return NextResponse.json({
        message: "Demo media processed successfully",
        mediaData: demoMediaData,
        uploadMetrics: {
          ...uploadMetrics,
          totalTime: totalResponseTime,
          hasThumbnail: !!uploadResult.thumbnailUrl,
          thumbnailUrl: uploadResult.thumbnailUrl
        },
        performance: {
          fileSize: uploadMetrics.fileSize,
          compression: uploadMetrics.compressionRatio,
          uploadMethod: uploadMetrics.uploadMethod,
          processingTime: uploadMetrics.processingTime
        }
      }, { status: 200 });

    } catch (uploadError) {
      console.error('❌ Demo upload processing failed:', uploadError);
      
      // PERFORMANCE: Fallback to basic upload for critical failures
      if (uploadError instanceof Error && uploadError.message.includes('Sharp') && file.type.startsWith('image/')) {
        console.log('🔄 Falling back to basic image upload due to Sharp error...');
        
        try {
          // Simple fallback without Sharp processing
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;
          
          demoMediaData = {
            demoMediaUrl: base64File,
            demoMediaType: 'image',
            demoFileName: file.name,
            demoUploadedAt: new Date(),
            demoFileSize: file.size,
            demoUploadMethod: 'fallback_base64',
            demoProcessingTime: Date.now() - startTime
          };

          console.log('✅ Fallback upload successful');
          
          if (actionId) {
            const updatedAction = await prisma.action.update({
              where: { id: actionId },
              data: demoMediaData,
            });

            return NextResponse.json({
              message: "Demo media uploaded successfully (fallback method)",
              action: updatedAction,
              uploadMetrics: { ...uploadMetrics, uploadMethod: 'fallback_base64' }
            }, { status: 200 });
          }

          return NextResponse.json({
            message: "Demo media processed successfully (fallback method)",
            mediaData: demoMediaData,
            uploadMetrics: { ...uploadMetrics, uploadMethod: 'fallback_base64' }
          }, { status: 200 });

        } catch (fallbackError) {
          console.error('❌ Fallback upload also failed:', fallbackError);
          throw uploadError; // Throw original error
        }
      } else {
        throw uploadError;
      }
    }

  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error('❌ Error in demo upload API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      totalTime,
      uploadMetrics,
      sessionId: session?.user?.id,
      fileSize: uploadMetrics.fileSize
    });

    // PERFORMANCE: Return detailed error info for debugging in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isDevelopment = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      { 
        message: "Demo media upload failed",
        error: isDevelopment ? errorMessage : "Upload processing failed",
        debug: isDevelopment ? {
          totalTime,
          fileSize: uploadMetrics.fileSize,
          uploadMethod: uploadMetrics.uploadMethod,
          stack: error instanceof Error ? error.stack : undefined
        } : undefined,
        suggestions: [
          "Try a smaller file size",
          "Ensure the file is a valid image or video format",
          "Check your internet connection and try again"
        ]
      },
      { status: 500 }
    );
  }
} 