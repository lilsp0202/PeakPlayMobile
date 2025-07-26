import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    const prisma = new PrismaClient();
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    
    return NextResponse.json({ 
      status: 'Database connected successfully',
      userCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      hasDbUrl: !!process.env.DATABASE_URL
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'Database connection failed',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 