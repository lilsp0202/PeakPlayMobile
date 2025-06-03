import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== Transcription API Debug ===');
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('Cookie header exists:', !!request.headers.get('cookie'));
    
    // Get session using the same authOptions as the main auth route
    const session = await getServerSession(authOptions);
    
    console.log('Transcription API - Raw session:', JSON.stringify(session, null, 2));
    console.log('Transcription API - Session exists:', !!session);
    console.log('Transcription API - User exists:', !!session?.user);
    console.log('Transcription API - User ID:', session?.user?.id);
    console.log('Transcription API - User Role:', session?.user?.role);
    console.log('Transcription API - User Email:', session?.user?.email);
    console.log('Transcription API - User Name:', session?.user?.name);
    
    if (!session) {
      console.log('Transcription API - No session found');
      return NextResponse.json(
        { error: "Not authenticated - No session found. Please log in again." },
        { status: 401 }
      );
    }

    if (!session.user) {
      console.log('Transcription API - No user in session');
      return NextResponse.json(
        { error: "Not authenticated - No user in session" },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      console.log('Transcription API - No user ID in session');
      console.log('Transcription API - Full user object:', JSON.stringify(session.user, null, 2));
      return NextResponse.json(
        { error: "Not authenticated - No user ID found in session" },
        { status: 401 }
      );
    }

    // Allow COACH role for voice transcription
    if (session.user.role !== "COACH") {
      console.log('Transcription API - User role not authorized:', session.user.role);
      return NextResponse.json(
        { error: `Unauthorized - Coach role required. Current role: ${session.user.role}` },
        { status: 403 }
      );
    }

    console.log('Transcription API - Authentication successful for coach:', session.user.email);

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      console.log('Transcription API - No audio file provided');
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log('Transcribing audio file:', audioFile.name, 'Size:', audioFile.size, 'Type:', audioFile.type);

    // Convert File to format expected by OpenAI
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    
    // Create a File object with the necessary properties for OpenAI
    const audioFileForOpenAI = new File([audioBlob], audioFile.name, {
      type: audioFile.type,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileForOpenAI,
      model: "whisper-1",
      language: "en",
    });

    console.log('Transcription successful. Text length:', transcription.text.length);
    console.log('Transcription text preview:', transcription.text.substring(0, 100) + '...');

    return NextResponse.json({ 
      transcription: transcription.text 
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: "Failed to transcribe audio. Please try again." },
      { status: 500 }
    );
  }
} 