import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { storageOptimizer } from '@/lib/storageOptimizer';
import * as Sentry from '@sentry/nextjs';

interface StorageOptimizeRequest {
  action: 'stats' | 'cleanup' | 'optimize' | 'report';
  options?: {
    daysOld?: number;
    dryRun?: boolean;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Admin check - only coaches/admins can perform storage operations
    if (session.user.role !== 'coach' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required for storage operations' },
        { status: 403 }
      );
    }

    const body: StorageOptimizeRequest = await request.json();
    const { action, options = {} } = body;

    console.log(`🔧 Storage optimization request: ${action} by ${session.user.email}`);

    let result: any;

    switch (action) {
      case 'stats':
        result = await storageOptimizer.getStorageStats();
        break;

      case 'cleanup':
        const daysOld = options.daysOld || 30;
        if (options.dryRun) {
          // For dry run, just return candidates without actually cleaning
          const stats = await storageOptimizer.getStorageStats();
          result = {
            dryRun: true,
            candidatesFound: stats.cleanupCandidates,
            estimatedFilesToDelete: stats.cleanupCandidates * 1.5, // Estimate proof + demo
            estimatedSpaceToFree: (stats.totalProofSize + stats.totalDemoSize) * 0.3
          };
        } else {
          result = await storageOptimizer.cleanupAcknowledgedMedia(daysOld);
        }
        break;

      case 'optimize':
        await storageOptimizer.optimizeDatabase();
        result = { message: 'Database optimization completed successfully' };
        break;

      case 'report':
        result = await storageOptimizer.generateStorageReport();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: stats, cleanup, optimize, or report' },
          { status: 400 }
        );
    }

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      action,
      result,
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Type': 'storage-optimization'
      }
    });

  } catch (error) {
    console.error('Storage optimization error:', error);
    Sentry.captureException(error);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Storage optimization failed',
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Type': 'storage-optimization-error'
      }
    });
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Quick storage stats for GET requests
    const stats = await storageOptimizer.getStorageStats();
    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      stats,
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Type': 'storage-stats'
      }
    });

  } catch (error) {
    console.error('Storage stats error:', error);
    Sentry.captureException(error);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get storage stats',
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Type': 'storage-stats-error'
      }
    });
  }
} 