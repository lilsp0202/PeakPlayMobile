import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import type { Session } from "next-auth";

// PERFORMANCE: Test endpoint to validate optimizations
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🧪 Performance Test - Starting validation');
    
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Authentication required for performance test" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'actions';
    
    const tests: Array<{
      name: string;
      url: string;
      expectedTime: number;
      description: string;
    }> = [];

    if (testType === 'actions' || testType === 'all') {
      tests.push(
        {
          name: 'Actions API - Page 1',
          url: '/api/actions?page=1&limit=20',
          expectedTime: 3000, // 3 seconds max
          description: 'First page of actions with optimized query'
        },
        {
          name: 'Actions API - With Filters',
          url: '/api/actions?page=1&limit=10&category=GENERAL&status=pending',
          expectedTime: 2500, // 2.5 seconds max
          description: 'Filtered actions query performance'
        }
      );
    }

    if (testType === 'media' || testType === 'all') {
      tests.push(
        {
          name: 'Storage Info Check',
          url: '/api/actions/demo-upload-optimized',
          expectedTime: 1000, // 1 second max
          description: 'File storage service readiness check'
        }
      );
    }

    const results = [];
    
    for (const test of tests) {
      const testStartTime = Date.now();
      
      try {
        console.log(`🧪 Running test: ${test.name}`);
        
        const testResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${test.url}`, {
          method: 'GET',
          headers: {
            'Cookie': request.headers.get('cookie') || '',
            'Content-Type': 'application/json',
          },
        });

        const testTime = Date.now() - testStartTime;
        const passed = testTime <= test.expectedTime;
        
        results.push({
          name: test.name,
          description: test.description,
          responseTime: testTime,
          expectedTime: test.expectedTime,
          status: testResponse.status,
          passed,
          performance: passed ? 'EXCELLENT' : testTime <= test.expectedTime * 1.5 ? 'ACCEPTABLE' : 'POOR'
        });

        console.log(`${passed ? '✅' : '❌'} ${test.name}: ${testTime}ms (expected: ${test.expectedTime}ms)`);
        
      } catch (error) {
        results.push({
          name: test.name,
          description: test.description,
          responseTime: Date.now() - testStartTime,
          expectedTime: test.expectedTime,
          status: 'ERROR',
          passed: false,
          performance: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const totalTime = Date.now() - startTime;
    const passedTests = results.filter(r => r.passed).length;
    const overallPassed = passedTests === results.length;

    const summary = {
      overallResult: overallPassed ? 'PASSED' : 'FAILED',
      passedTests,
      totalTests: results.length,
      totalTestTime: totalTime,
      averageResponseTime: Math.round(results.reduce((acc, r) => acc + r.responseTime, 0) / results.length),
      recommendations: []
    };

    // Add performance recommendations
    const slowTests = results.filter(r => !r.passed);
    if (slowTests.length > 0) {
      summary.recommendations.push(
        `${slowTests.length} tests exceeded expected response time`,
        'Consider optimizing database queries or adding more caching',
        'Check server resources and database connection pool'
      );
    }

    if (summary.averageResponseTime > 2000) {
      summary.recommendations.push(
        'Average response time is high - consider server optimization',
        'Review database query performance and indexing'
      );
    }

    console.log(`🧪 Performance Test completed in ${totalTime}ms - ${summary.overallResult}`);

    return NextResponse.json({
      message: "Performance test completed",
      summary,
      results,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabase: !!process.env.DATABASE_URL,
        hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
      }
    }, { status: 200 });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Performance test failed:', error);
    
    return NextResponse.json(
      { 
        message: "Performance test failed",
        error: error instanceof Error ? error.message : 'Unknown error',
        totalTime
      },
      { status: 500 }
    );
  }
} 