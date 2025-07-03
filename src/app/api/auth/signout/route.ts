import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Create response with cleared session cookies
    const response = NextResponse.json({ 
      success: true, 
      message: "Signed out successfully",
      redirectUrl: "/auth/signin"
    });

    // Clear NextAuth session cookies for PWA support
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.callback-url');
    response.cookies.delete('next-auth.csrf-token');
    
    // Set additional headers for PWA
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ 
      error: "Sign out failed", 
      redirectUrl: "/auth/signin" 
    }, { status: 500 });
  }
} 