#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info'],
});

async function optimizeFeedbackDatabase() {
  console.log('🔧 Optimizing Database for Feedback Performance...\n');

  try {
    // 1. Test feedback query performance
    console.log('📊 Testing Feedback Query Performance:');
    
    const students = await prisma.student.findMany({
      select: { id: true, studentName: true },
      take: 5
    });
    
    if (students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }
    
    for (const student of students) {
      const start = Date.now();
      
      const feedback = await prisma.feedback.findMany({
        where: { 
          studentId: student.id
        },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          priority: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          createdAt: true,
          coach: {
            select: {
              name: true,
              academy: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });
      
      const duration = Date.now() - start;
      console.log(`   Student ${student.studentName}: ${feedback.length} feedback items in ${duration}ms`);
      
      if (duration > 500) {
        console.log(`   ⚠️  Slow query detected for ${student.studentName}`);
      }
    }

    // 2. Test actions query performance  
    console.log('\n⚡ Testing Actions Query Performance:');
    
    for (const student of students) {
      const start = Date.now();
      
      const actions = await prisma.action.findMany({
        where: { 
          studentId: student.id
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          dueDate: true,
          isCompleted: true,
          completedAt: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          proofMediaUrl: true,
          proofMediaType: true,
          proofFileName: true,
          proofUploadedAt: true,
          demoMediaUrl: true,
          demoMediaType: true,
          demoFileName: true,
          demoUploadedAt: true,
          createdAt: true,
          coachId: true,
          teamId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });
      
      const duration = Date.now() - start;
      console.log(`   Student ${student.studentName}: ${actions.length} action items in ${duration}ms`);
      
      if (duration > 500) {
        console.log(`   ⚠️  Slow query detected for ${student.studentName}`);
      }
    }

    // 3. Database health check
    console.log('\n🏥 Database Health Check:');
    const [feedbackCount, actionsCount, studentsCount] = await Promise.all([
      prisma.feedback.count(),
      prisma.action.count(), 
      prisma.student.count()
    ]);
    
    console.log(`   Total Feedback: ${feedbackCount}`);
    console.log(`   Total Actions: ${actionsCount}`);
    console.log(`   Total Students: ${studentsCount}`);
    
    // 4. Test a complete feedback+actions query like the frontend does
    console.log('\n🚀 Testing Combined Query (Frontend Simulation):');
    const testStudent = students[0];
    
    const combinedStart = Date.now();
    const [studentFeedback, studentActions] = await Promise.all([
      prisma.feedback.findMany({
        where: { studentId: testStudent.id },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          priority: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          createdAt: true,
          coach: { select: { name: true, academy: true } },
          team: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.action.findMany({
        where: { studentId: testStudent.id },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          dueDate: true,
          isCompleted: true,
          completedAt: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          proofMediaUrl: true,
          proofMediaType: true,
          proofFileName: true,
          proofUploadedAt: true,
          demoMediaUrl: true,
          demoMediaType: true,
          demoFileName: true,
          demoUploadedAt: true,
          createdAt: true,
          coachId: true,
          teamId: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    ]);
    
    const combinedDuration = Date.now() - combinedStart;
    console.log(`   Combined query: ${studentFeedback.length} feedback + ${studentActions.length} actions in ${combinedDuration}ms`);
    
    if (combinedDuration < 200) {
      console.log('   ✅ Excellent performance');
    } else if (combinedDuration < 500) {
      console.log('   ✅ Good performance');
    } else {
      console.log('   ⚠️  Performance could be improved');
    }

    console.log('\n✅ Database optimization check completed');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeFeedbackDatabase(); 