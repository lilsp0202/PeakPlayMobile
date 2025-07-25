import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseProManager } from '@/lib/supabaseProConfig';
import * as Sentry from '@sentry/nextjs';

interface SupabaseProRequest {
  action: 'status' | 'initialize' | 'optimize' | 'stats' | 'config';
  config?: {
    cdnEnabled?: boolean;
    maxFileSize?: number;
    cacheControl?: string;
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

    // Admin check - only admins can manage Supabase Pro configuration
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required for Supabase Pro configuration' },
        { status: 403 }
      );
    }

    const body: SupabaseProRequest = await request.json();
    const { action, config } = body;

    console.log(`🔧 Supabase Pro request: ${action} by ${session.user.email}`);

    let result: any;

    switch (action) {
      case 'status':
        result = {
          isProTier: supabaseProManager.isProTierEnabled(),
          features: supabaseProManager.getProTierFeatures(),
          config: supabaseProManager.getConfig()
        };
        break;

      case 'initialize':
        result = await supabaseProManager.initializeProBucket();
        break;

      case 'optimize':
        result = await supabaseProManager.optimizeExistingBucket();
        break;

      case 'stats':
        const bucketStats = await supabaseProManager.getBucketStats();
        result = {
          bucket: bucketStats,
          features: supabaseProManager.getProTierFeatures()
        };
        break;

      case 'config':
        if (config) {
          supabaseProManager.updateConfig(config);
          result = {
            message: 'Configuration updated successfully',
            newConfig: supabaseProManager.getConfig()
          };
        } else {
          result = {
            currentConfig: supabaseProManager.getConfig()
          };
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: status, initialize, optimize, stats, or config' },
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
        'X-Request-Type': 'supabase-pro-config',
        'X-Supabase-Pro': supabaseProManager.isProTierEnabled().toString()
      }
    });

  } catch (error) {
    console.error('Supabase Pro configuration error:', error);
    Sentry.captureException(error);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Supabase Pro configuration failed',
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Type': 'supabase-pro-config-error'
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

    // Get Pro tier status and basic info (available to all authenticated users)
    const isProTier = supabaseProManager.isProTierEnabled();
    const features = supabaseProManager.getProTierFeatures();
    const config = supabaseProManager.getConfig();

    // Hide sensitive config details for non-admin users
    const publicConfig = session.user.role === 'admin' ? config : {
      cdnEnabled: config.cdnEnabled,
      maxFileSize: config.maxFileSize,
      allowedTypes: config.allowedTypes.length
    };

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      isProTier,
      features,
      config: publicConfig,
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Type': 'supabase-pro-status',
        'X-Supabase-Pro': isProTier.toString()
      }
    });

  } catch (error) {
    console.error('Supabase Pro status error:', error);
    Sentry.captureException(error);

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Supabase Pro status',
      processingTime,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'X-Processing-Time': processingTime.toString(),
        'X-Request-Type': 'supabase-pro-status-error'
      }
    });
  }
} 