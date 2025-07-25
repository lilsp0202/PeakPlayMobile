import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

// REGRESSION TEST: Verify media URLs are being returned correctly
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Media Regression Test - Starting validation');
    
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Authentication required for media regression test" },
        { status: 401 }
      );
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      userRole: session.user.role,
      userEmail: session.user.email,
      tests: {}
    };

    // Test 1: Check database for actions with media
    console.log('🔍 Checking database for actions with media...');
    const actionsWithMedia = await prisma.action.findMany({
      where: {
        OR: [
          { proofMediaUrl: { not: null } },
          { demoMediaUrl: { not: null } }
        ]
      },
      select: {
        id: true,
        title: true,
        proofMediaUrl: true,
        proofMediaType: true,
        proofFileName: true,
        demoMediaUrl: true,
        demoMediaType: true,
        demoFileName: true,
        studentId: true,
        coachId: true
      },
      take: 5
    });

    results.tests.database = {
      success: true,
      actionsWithMedia: actionsWithMedia.length,
      sampleActions: actionsWithMedia.map(action => ({
        id: action.id,
        title: action.title,
        hasProofMedia: !!action.proofMediaUrl,
        hasProofType: !!action.proofMediaType,
        hasProofFileName: !!action.proofFileName,
        hasDemoMedia: !!action.demoMediaUrl,
        hasDemoType: !!action.demoMediaType,
        hasDemoFileName: !!action.demoFileName,
        proofUrlLength: action.proofMediaUrl?.length || 0,
        demoUrlLength: action.demoMediaUrl?.length || 0
      }))
    };

    // Test 2: Test Track API response
    if (session.user.role === 'COACH') {
      console.log('📊 Testing Track API for media URLs...');
      try {
        const trackResponse = await fetch(`http://localhost:3000/api/track?type=actions&limit=5&page=1`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          }
        });
        
        if (trackResponse.ok) {
          const trackData = await trackResponse.json();
          const actionsFromTrack = trackData.data || [];
          
          results.tests.trackAPI = {
            success: true,
            status: trackResponse.status,
            actionCount: actionsFromTrack.length,
            mediaAnalysis: actionsFromTrack.map((action: any) => ({
              id: action.id,
              title: action.title,
              hasProofMediaUrl: !!action.proofMediaUrl,
              hasProofMediaType: !!action.proofMediaType,
              hasDemoMediaUrl: !!action.demoMediaUrl,
              hasDemoMediaType: !!action.demoMediaType,
              proofUrlPreview: action.proofMediaUrl ? action.proofMediaUrl.substring(0, 50) + '...' : null,
              demoUrlPreview: action.demoMediaUrl ? action.demoMediaUrl.substring(0, 50) + '...' : null
            })),
            mediaUrlsFound: actionsFromTrack.filter((a: any) => a.proofMediaUrl || a.demoMediaUrl).length
          };
        } else {
          results.tests.trackAPI = {
            success: false,
            status: trackResponse.status,
            error: 'Track API request failed'
          };
        }
      } catch (error) {
        results.tests.trackAPI = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Test 3: Test Actions API response
    console.log('🎯 Testing Actions API for media URLs...');
    try {
      const actionsResponse = await fetch(`http://localhost:3000/api/actions?limit=5&page=1`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        }
      });
      
      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        const actionsFromAPI = actionsData.actions || actionsData || [];
        
        results.tests.actionsAPI = {
          success: true,
          status: actionsResponse.status,
          actionCount: actionsFromAPI.length,
          mediaAnalysis: actionsFromAPI.map((action: any) => ({
            id: action.id,
            title: action.title,
            hasProofMediaUrl: !!action.proofMediaUrl,
            hasProofMediaType: !!action.proofMediaType,
            hasDemoMediaUrl: !!action.demoMediaUrl,
            hasDemoMediaType: !!action.demoMediaType,
            proofUrlPreview: action.proofMediaUrl ? action.proofMediaUrl.substring(0, 50) + '...' : null,
            demoUrlPreview: action.demoMediaUrl ? action.demoMediaUrl.substring(0, 50) + '...' : null
          })),
          mediaUrlsFound: actionsFromAPI.filter((a: any) => a.proofMediaUrl || a.demoMediaUrl).length
        };
      } else {
        results.tests.actionsAPI = {
          success: false,
          status: actionsResponse.status,
          error: 'Actions API request failed'
        };
      }
    } catch (error) {
      results.tests.actionsAPI = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 4: Test media viewing for a specific action
    if (actionsWithMedia.length > 0) {
      const testAction = actionsWithMedia[0];
      console.log(`🎥 Testing media API for action: ${testAction.id}`);
      
      try {
        const mediaResponse = await fetch(`http://localhost:3000/api/actions/${testAction.id}/media`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          }
        });
        
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          
          results.tests.mediaAPI = {
            success: true,
            status: mediaResponse.status,
            actionId: testAction.id,
            hasProofMedia: !!mediaData.proofMedia,
            hasDemoMedia: !!mediaData.demoMedia,
            proofMediaDetails: mediaData.proofMedia ? {
              hasUrl: !!mediaData.proofMedia.url,
              type: mediaData.proofMedia.type,
              fileName: mediaData.proofMedia.fileName,
              fileSize: mediaData.proofMedia.fileSize
            } : null,
            demoMediaDetails: mediaData.demoMedia ? {
              hasUrl: !!mediaData.demoMedia.url,
              type: mediaData.demoMedia.type,
              fileName: mediaData.demoMedia.fileName,
              fileSize: mediaData.demoMedia.fileSize
            } : null,
            responseTime: mediaData.performance?.totalTime
          };
        } else {
          results.tests.mediaAPI = {
            success: false,
            status: mediaResponse.status,
            actionId: testAction.id,
            error: 'Media API request failed'
          };
        }
      } catch (error) {
        results.tests.mediaAPI = {
          success: false,
          actionId: testAction.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      results.tests.mediaAPI = {
        success: false,
        error: 'No actions with media found in database for testing'
      };
    }

    // Assessment
    const trackMediaFound = results.tests.trackAPI?.mediaUrlsFound || 0;
    const actionsMediaFound = results.tests.actionsAPI?.mediaUrlsFound || 0;
    const dbMediaCount = results.tests.database?.actionsWithMedia || 0;

    results.assessment = {
      regressionFixed: trackMediaFound > 0 || actionsMediaFound > 0,
      trackAPIWorking: trackMediaFound > 0,
      actionsAPIWorking: actionsMediaFound > 0,
      mediaAPIWorking: results.tests.mediaAPI?.success || false,
      databaseHasMedia: dbMediaCount > 0,
      recommendedAction: trackMediaFound > 0 && actionsMediaFound > 0 
        ? 'REGRESSION FIXED - Media URLs are being returned correctly' 
        : 'REGRESSION STILL EXISTS - Media URLs missing from API responses'
    };

    const totalTime = Date.now() - startTime;
    results.totalTime = totalTime;

    console.log(`🏁 Media regression test completed in ${totalTime}ms`);
    console.log(`📊 Assessment: ${results.assessment.recommendedAction}`);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Media regression test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Media regression test failed', 
        totalTime,
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 