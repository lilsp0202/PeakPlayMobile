import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  const user = session?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  let where: any = {};
  
  if (user.role === 'COACH') {
    // Find the coach record to get the coach ID
    const coach = await prisma.coach.findUnique({
      where: { userId: user.id }
    });
    if (coach) {
      where.coachId = coach.id;
    }
  }
  
  const studentId = req.nextUrl.searchParams.get('studentId');
  if (studentId) {
    where.students = { some: { studentId } };
  }
  
  const todos = await prisma.sessionTodo.findMany({
    where,
    orderBy: { sessionDate: 'desc' },
    include: { items: true, students: true },
  });
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  const user = session?.user;
  if (!user || user.role !== 'COACH') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Find the coach record to get the coach ID
  const coach = await prisma.coach.findUnique({
    where: { userId: user.id }
  });
  
  if (!coach) {
    return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
  }
  
  const { title, sessionDate, items, studentIds } = await req.json();
  const todo = await prisma.sessionTodo.create({
    data: {
      coachId: coach.id,
      title,
      sessionDate: new Date(sessionDate),
      items: { create: items.map((content: string) => ({ content })) },
      students: { create: studentIds.map((studentId: string) => ({ studentId })) },
    },
    include: { items: true, students: true },
  });
  return NextResponse.json(todo);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  const user = session?.user;
  if (!user || user.role !== 'COACH') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Find the coach record to get the coach ID
  const coach = await prisma.coach.findUnique({
    where: { userId: user.id }
  });
  
  if (!coach) {
    return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
  }
  
  const { id, title, sessionDate, items } = await req.json();
  const todo = await prisma.sessionTodo.update({
    where: { id },
    data: {
      title,
      sessionDate: new Date(sessionDate),
      items: {
        deleteMany: {},
        create: items.map((item: any) => ({ content: item.content, isChecked: item.isChecked })),
      },
    },
    include: { items: true, students: true },
  });
  return NextResponse.json(todo);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  const user = session?.user;
  if (!user || user.role !== 'COACH') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Find the coach record to get the coach ID
  const coach = await prisma.coach.findUnique({
    where: { userId: user.id }
  });
  
  if (!coach) {
    return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
  }
  
  const { id } = await req.json();
  await prisma.sessionTodo.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 