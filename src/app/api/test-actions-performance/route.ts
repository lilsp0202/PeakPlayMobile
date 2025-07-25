import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import type { Session } from "next-auth";

// PERFORMANCE TEST: Verify Actions tab loads under 3 seconds with media functionality
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🏁 PERFORMANCE TEST: Actions tab load time validation');
    
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Authentication required for performance test" },
        { status: 401 }
      );
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      userRole: session.user.role,
      tests: {},
      target: "< 3000ms for full Actions tab load with media metadata"
    };

    // Test 1: Track API Performance (primary Actions tab endpoint)
    console.log('📊 Testing Track API performance...');
    const trackStartTime = Date.now();
    
    try {
      const trackResponse = await fetch(`http://localhost:3000/api/track?type=actions&limit=10&page=1&dateRange=week`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        }
      });
      
      const trackEndTime = Date.now();
      const trackDuration = trackEndTime - trackStartTime;
      
      if (trackResponse.ok) {
        const trackData = await trackResponse.json();
        const actions = trackData.data || [];
        
        results.tests.trackAPI = {
          success: true,
          duration: trackDuration,
          status: trackResponse.status,
          actionCount: actions.length,
          hasMediaMetadata: actions.some((a: any) => a.proofMediaType || a.demoMediaType),
          mediaAnalysis: {
            actionsWithDemoMetadata: actions.filter((a: any) => a.demoMediaType).length,
            actionsWithProofMetadata: actions.filter((a: any) => a.proofMediaType).length,
            averageFileSize: actions.reduce((sum: number, a: any) => {
              const sizes = [a.proofFileSize, a.demoFileSize].filter(Boolean);
              return sum + (sizes.length ? sizes.reduce((s, v) => s + v, 0) : 0);
            }, 0) / Math.max(actions.length, 1)
          },
          performance: trackDuration < 2000 ? 'EXCELLENT' : trackDuration < 3000 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        };
      } else {
        results.tests.trackAPI = {
          success: false,
          duration: trackDuration,
          status: trackResponse.status,
          error: 'Track API request failed'
        };
      }
    } catch (error) {
      results.tests.trackAPI = {
        success: false,
        duration: Date.now() - trackStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 2: Actions API Performance (fallback endpoint)
    console.log('🎯 Testing Actions API performance...');
    const actionsStartTime = Date.now();
    
    try {
      const actionsResponse = await fetch(`http://localhost:3000/api/actions?limit=10&page=1`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        }
      });
      
      const actionsEndTime = Date.now();
      const actionsDuration = actionsEndTime - actionsStartTime;
      
      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        const actions = actionsData.actions || actionsData || [];
        
        results.tests.actionsAPI = {
          success: true,
          duration: actionsDuration,
          status: actionsResponse.status,
          actionCount: actions.length,
          hasMediaMetadata: actions.some((a: any) => a.proofMediaType || a.demoMediaType),
          mediaFlags: {
            actionsWithProofFlags: actions.filter((a: any) => a.hasProofMedia).length,
            actionsWithDemoFlags: actions.filter((a: any) => a.hasDemoMedia).length
          },
          performance: actionsDuration < 1000 ? 'EXCELLENT' : actionsDuration < 2000 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        };
      } else {
        results.tests.actionsAPI = {
          success: false,
          duration: actionsDuration,
          status: actionsResponse.status,
          error: 'Actions API request failed'
        };
      }
    } catch (error) {
      results.tests.actionsAPI = {
        success: false,
        duration: Date.now() - actionsStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 3: Media API Performance (lazy loading test)
    console.log('🎥 Testing Media API lazy loading...');
    const mediaStartTime = Date.now();
    
    try {
      // Get a sample action ID for testing
      const trackData = results.tests.trackAPI?.success ? 
        await fetch(`http://localhost:3000/api/track?type=actions&limit=1&page=1`, {
          headers: { 'Cookie': request.headers.get('cookie') || '' }
        }).then(r => r.json()) : null;
      
      if (trackData?.data?.length > 0) {
        const testActionId = trackData.data[0].id;
        
        const mediaResponse = await fetch(`http://localhost:3000/api/actions/${testActionId}/media`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          }
        });
        
        const mediaEndTime = Date.now();
        const mediaDuration = mediaEndTime - mediaStartTime;
        
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          
          results.tests.mediaAPI = {
            success: true,
            duration: mediaDuration,
            status: mediaResponse.status,
            actionId: testActionId,
            hasProofMedia: !!mediaData.proofMedia,
            hasDemoMedia: !!mediaData.demoMedia,
            responseTime: mediaData.performance?.totalTime,
            performance: mediaDuration < 500 ? 'EXCELLENT' : mediaDuration < 1000 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
          };
        } else {
          results.tests.mediaAPI = {
            success: false,
            duration: mediaDuration,
            status: mediaResponse.status,
            actionId: testActionId,
            error: 'Media API request failed'
          };
        }
      } else {
        results.tests.mediaAPI = {
          success: false,
          duration: Date.now() - mediaStartTime,
          error: 'No actions available for media testing'
        };
      }
    } catch (error) {
      results.tests.mediaAPI = {
        success: false,
        duration: Date.now() - mediaStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Calculate overall performance assessment
    const totalTime = Date.now() - startTime;
    const trackTime = results.tests.trackAPI?.duration || 0;
    const actionsTime = results.tests.actionsAPI?.duration || 0;
    const mediaTime = results.tests.mediaAPI?.duration || 0;

    results.summary = {
      totalTestDuration: totalTime,
      primaryEndpointTime: trackTime,
      fallbackEndpointTime: actionsTime,
      mediaLazyLoadTime: mediaTime,
      estimatedUserExperience: Math.max(trackTime, actionsTime), // User sees the faster of the two
      targetAchieved: Math.max(trackTime, actionsTime) < 3000,
      mediaLazyLoadOptimal: mediaTime < 1000,
      overallAssessment: Math.max(trackTime, actionsTime) < 2000 
        ? 'EXCELLENT - Well under 3s target' 
        : Math.max(trackTime, actionsTime) < 3000 
        ? 'GOOD - Meets 3s target'
        : 'NEEDS_IMPROVEMENT - Exceeds 3s target'
    };

    console.log(`🏁 Performance test completed in ${totalTime}ms`);
    console.log(`📊 Primary endpoint: ${trackTime}ms, Target achieved: ${results.summary.targetAchieved}`);

    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Actions performance test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Actions performance test failed', 
        totalTime,
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 