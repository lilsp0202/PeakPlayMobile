import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { FileStorageService } from "../../../../../lib/fileStorage";
import type { Session } from "next-auth";

// SUPABASE PRO: Enhanced media URL cache with TTL
interface CachedMediaUrl {
  url: string;
  expires: number;
  cdnUrl?: string;
  thumbnailUrl?: string;
}

const mediaUrlCache = new Map<string, CachedMediaUrl>();

// SUPABASE PRO: Enhanced media URL fetching with caching and streaming support
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  let sessionTime = 0;
  let dbQueryTime = 0;
  let authCheckTime = 0;
  let urlProcessingTime = 0;

  try {
    // SUPABASE PRO: Fast session check with timing
    const sessionStartTime = Date.now();
    const session = await getServerSession(authOptions) as Session | null;
    sessionTime = Date.now() - sessionStartTime;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          message: "Authentication required",
          debug: { sessionTime }
        }, 
        { status: 401 }
      );
    }

    const { id: actionId } = await params;
    
    // SUPABASE PRO: Check cache headers for optimization
    const cacheKey = request.headers.get('X-Cache-Key') || `${actionId}-${session.user.id}`;
    const cachedEntry = mediaUrlCache.get(cacheKey);
    
    if (cachedEntry && Date.now() < cachedEntry.expires) {
      console.log(`🚀 SUPABASE PRO: Cache hit for action ${actionId}`);
      
      return NextResponse.json({
        id: actionId,
        demoMedia: cachedEntry.url.includes('demo') ? {
          url: cachedEntry.url,
          cdnUrl: cachedEntry.cdnUrl,
          thumbnailUrl: cachedEntry.thumbnailUrl,
          cached: true
        } : null,
        proofMedia: cachedEntry.url.includes('proof') ? {
          url: cachedEntry.url,
          cdnUrl: cachedEntry.cdnUrl,
          thumbnailUrl: cachedEntry.thumbnailUrl,
          cached: true
        } : null,
        performance: {
          totalTime: Date.now() - startTime,
          cacheHit: true
        }
      });
    }
    
    // SUPABASE PRO: Optimized database query with selective fields
    const dbStartTime = Date.now();
    const action = await prisma.action.findUnique({
      where: { id: actionId },
      select: {
        id: true,
        demoMediaUrl: true,
        demoMediaType: true,
        demoFileName: true,
        demoFileSize: true,
        demoUploadMethod: true,
        demoProcessingTime: true,
        proofMediaUrl: true,
        proofMediaType: true,
        proofFileName: true,
        proofFileSize: true,
        proofUploadMethod: true,
        proofProcessingTime: true,
        studentId: true,
        coachId: true,
        createdAt: true,
        title: true
      }
    });
    dbQueryTime = Date.now() - dbStartTime;

    if (!action) {
      return NextResponse.json(
        { 
          message: "Action not found",
          debug: { sessionTime, dbQueryTime }
        }, 
        { status: 404 }
      );
    }

    // SUPABASE PRO: Efficient role-based access control
    const authStartTime = Date.now();
    let hasAccess = false;
    let userRole = session.user.role;
    let userContext: any = null;

    if (userRole === "ATHLETE") {
      // For athletes, verify they own this action
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true, studentName: true }
      });
      
      if (student && action.studentId === student.id) {
        hasAccess = true;
        userContext = { studentId: student.id, name: student.studentName };
      }
    } else if (userRole === "COACH") {
      // For coaches, verify they have access to the student's action
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { 
          id: true, 
          name: true,
          students: {
            where: { id: action.studentId },
            select: { id: true, studentName: true }
          }
        }
      });
      
      if (coach) {
        const isActionCreator = action.coachId === coach.id;
        const isStudentCoach = coach.students.length > 0;
        
        if (isActionCreator || isStudentCoach) {
          hasAccess = true;
          userContext = { 
            coachId: coach.id, 
            name: coach.name,
            accessType: isActionCreator ? 'creator' : 'student_coach'
          };
        }
      }
    } else if (userRole === "ADMIN") {
      hasAccess = true;
      userContext = { isAdmin: true };
    }

    authCheckTime = Date.now() - authStartTime;

    if (!hasAccess) {
      return NextResponse.json(
        { 
          message: "Access denied",
          debug: { 
            sessionTime, 
            dbQueryTime, 
            authCheckTime, 
            userRole,
            hasUserContext: !!userContext
          }
        }, 
        { status: 403 }
      );
    }

    // SUPABASE PRO: Enhanced media URL processing with CDN optimization
    const urlProcessingStartTime = Date.now();
    
    const processMediaUrl = async (
      url: string | null, 
      uploadMethod: string | null,
      mediaType: 'demo' | 'proof'
    ) => {
      if (!url) return null;

      // SUPABASE PRO: For Supabase storage, generate signed URLs with caching
      if (uploadMethod === 'supabase' && url.includes('supabase')) {
        try {
          // Extract file path from URL for signed URL generation
          const urlParts = url.split('/storage/v1/object/public/');
          if (urlParts.length === 2) {
            const bucketAndPath = urlParts[1];
            const pathSegments = bucketAndPath.split('/');
            const bucketName = pathSegments[0];
            const filePath = pathSegments.slice(1).join('/');
            
            // SUPABASE PRO: Generate signed URL with Pro tier TTL
            const storageInfo = await FileStorageService.getStorageInfo();
            const ttl = storageInfo.proTierEnabled ? 3600 : 1800; // 1 hour vs 30 min
            
            const signedUrl = await FileStorageService.getSignedUrl(
              filePath, 
              bucketName, 
              ttl
            );

            // SUPABASE PRO: Generate CDN URL if Pro tier enabled
            const cdnUrl = storageInfo.cdnEnabled ? 
              signedUrl.replace('/storage/v1/', '/storage/v1/cdn/') : 
              undefined;

            // SUPABASE PRO: Cache the processed URL
            if (storageInfo.proTierEnabled) {
              mediaUrlCache.set(`${cacheKey}-${mediaType}`, {
                url: signedUrl,
                expires: Date.now() + (ttl * 1000 * 0.9), // Expire 10% early
                cdnUrl,
                thumbnailUrl: undefined // TODO: Add thumbnail support
              });

              // Clean up expired cache entries
              if (mediaUrlCache.size > 500) {
                const now = Date.now();
                for (const [key, value] of mediaUrlCache.entries()) {
                  if (now >= value.expires) {
                    mediaUrlCache.delete(key);
                  }
                }
              }
            }

            return {
              url: signedUrl,
              cdnUrl,
              cached: false
            };
          }
        } catch (signedUrlError) {
          console.warn('SUPABASE PRO: Failed to generate signed URL, using public URL:', signedUrlError);
        }
      }

      // SUPABASE PRO: For CDN-enabled URLs, optimize delivery
      if (uploadMethod === 'supabase' && url.includes('supabase')) {
        const storageInfo = await FileStorageService.getStorageInfo();
        if (storageInfo.cdnEnabled) {
          const cdnUrl = url.replace('/storage/v1/object/public/', '/storage/v1/cdn/');
          return {
            url,
            cdnUrl,
            cached: false
          };
        }
      }

      return {
        url,
        cached: false
      };
    };

    // SUPABASE PRO: Process URLs in parallel for better performance
    const [processedDemoResult, processedProofResult] = await Promise.all([
      action.demoMediaUrl ? processMediaUrl(action.demoMediaUrl, action.demoUploadMethod, 'demo') : Promise.resolve(null),
      action.proofMediaUrl ? processMediaUrl(action.proofMediaUrl, action.proofUploadMethod, 'proof') : Promise.resolve(null)
    ]);

    urlProcessingTime = Date.now() - urlProcessingStartTime;
    const totalResponseTime = Date.now() - startTime;

    // SUPABASE PRO: Build optimized response with Pro tier features
    const response = NextResponse.json({
      id: action.id,
      title: action.title,
      demoMedia: action.demoMediaUrl ? {
        url: processedDemoResult?.url,
        type: action.demoMediaType,
        fileName: action.demoFileName,
        fileSize: action.demoFileSize,
        uploadMethod: action.demoUploadMethod,
        processingTime: action.demoProcessingTime,
        cdnUrl: processedDemoResult?.cdnUrl,
        cached: processedDemoResult?.cached || false
      } : null,
      proofMedia: action.proofMediaUrl ? {
        url: processedProofResult?.url,
        type: action.proofMediaType,
        fileName: action.proofFileName,
        fileSize: action.proofFileSize,
        uploadMethod: action.proofUploadMethod,
        processingTime: action.proofProcessingTime,
        cdnUrl: processedProofResult?.cdnUrl,
        cached: processedProofResult?.cached || false
      } : null,
      userContext,
      performance: {
        totalTime: totalResponseTime,
        sessionTime,
        dbQueryTime,
        authCheckTime,
        urlProcessingTime,
        cacheHit: false
      },
      cache: {
        timestamp: new Date().toISOString(),
        ttl: 300, // 5 minutes browser cache
        proTierOptimized: true
      }
    });

    // SUPABASE PRO: Set enhanced caching headers for Pro tier
    const storageInfo = await FileStorageService.getStorageInfo();
    const maxAge = storageInfo.proTierEnabled ? 600 : 300; // 10 min vs 5 min
    const sMaxAge = storageInfo.proTierEnabled ? 1200 : 600; // 20 min vs 10 min CDN

    response.headers.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${sMaxAge}`);
    response.headers.set('ETag', `"action-${actionId}-${action.createdAt.getTime()}"`);
    response.headers.set('Vary', 'Authorization');

    // SUPABASE PRO: Add performance and tier headers for monitoring
    response.headers.set('X-Response-Time', `${totalResponseTime}ms`);
    response.headers.set('X-DB-Time', `${dbQueryTime}ms`);
    response.headers.set('X-Auth-Time', `${authCheckTime}ms`);
    response.headers.set('X-URL-Processing-Time', `${urlProcessingTime}ms`);
    response.headers.set('X-Supabase-Pro', storageInfo.proTierEnabled ? 'true' : 'false');
    response.headers.set('X-CDN-Enabled', storageInfo.cdnEnabled ? 'true' : 'false');

    console.log(`✅ SUPABASE PRO: Media retrieval completed in ${totalResponseTime}ms (DB: ${dbQueryTime}ms, Auth: ${authCheckTime}ms, URL: ${urlProcessingTime}ms)`);

    return response;

  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error('❌ SUPABASE PRO: Error in media API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      totalTime,
      sessionTime,
      dbQueryTime,
      authCheckTime,
      urlProcessingTime
    });

    // SUPABASE PRO: Enhanced error response with performance data
    return NextResponse.json(
      { 
        message: "Failed to retrieve media",
        error: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          'Internal server error',
        performance: {
          totalTime,
          sessionTime,
          dbQueryTime,
          authCheckTime,
          urlProcessingTime
        },
        debug: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
}

// SUPABASE PRO: Add OPTIONS handler for CORS optimization
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Cache-Key',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}

// SUPABASE PRO: Cache cleanup utility (internal function, not exported as route)
function clearExpiredMediaUrlCache(): number {
  const now = Date.now();
  let cleared = 0;
  
  for (const [key, value] of mediaUrlCache.entries()) {
    if (now >= value.expires) {
      mediaUrlCache.delete(key);
      cleared++;
    }
  }
  
  console.log(`🧹 SUPABASE PRO: Cleared ${cleared} expired media cache entries`);
  return cleared;
} 