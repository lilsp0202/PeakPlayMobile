import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request: NextRequest) {
  try {
    // Check if fallback mode is enabled
    const fallbackMode = process.env.SUPABASE_FALLBACK_MODE === 'true';
    
    // Test 1: Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      fallbackMode: fallbackMode
    };
    
    // If fallback mode, return early with simulated success
    if (fallbackMode) {
      return NextResponse.json({
        status: 'success',
        environment: envCheck,
        buckets: {
          available: [{ name: 'media', public: true }],
          mediaExists: true,
          mediaCreated: false,
          note: 'Using fallback mode - uploads will use base64 encoding'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    const supabase = getSupabaseClient();
    
    // Test 2: List storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    // Test 3: Check if 'media' bucket exists
    const mediaBucket = buckets?.find(bucket => bucket.name === 'media');
    
    // Test 4: If media bucket doesn't exist, try to create it
    let bucketCreated = false;
    if (!mediaBucket && !bucketsError) {
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('media', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*', 'video/*']
      });
      
      if (!createError) {
        bucketCreated = true;
      }
    }
    
    return NextResponse.json({
      status: 'success',
      environment: envCheck,
      buckets: {
        available: buckets?.map(b => ({ name: b.name, public: b.public })) || [],
        error: bucketsError?.message,
        mediaExists: !!mediaBucket,
        mediaCreated: bucketCreated
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Supabase storage test error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 