#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function analyzeDatabase() {
  console.log('🔍 Analyzing Database Performance Issues...\n');

  try {
    // 1. Check Action table size and data distribution
    console.log('📊 ACTION TABLE ANALYSIS:');
    const actionCount = await prisma.action.count();
    console.log(`   Total Actions: ${actionCount}`);

    const actionsByStudent = await prisma.action.groupBy({
      by: ['studentId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    console.log('\n   Top 5 Students by Action Count:');
    for (const item of actionsByStudent) {
      console.log(`   Student ${item.studentId}: ${item._count.id} actions`);
    }

    // 2. Check for problematic data patterns
    console.log('\n🔍 CHECKING FOR PERFORMANCE ISSUES:');
    
    // Check for missing indexes usage
    const sampleAction = await prisma.action.findFirst({
      where: {
        studentId: actionsByStudent[0]?.studentId
      },
      include: {
        coach: {
          select: { name: true, academy: true }
        },
        team: {
          select: { id: true, name: true }
        }
      }
    });

    if (sampleAction) {
      console.log(`   Sample Action includes: coach=${!!sampleAction.coach}, team=${!!sampleAction.team}`);
    }

    // 3. Test query performance for specific student
    if (actionsByStudent[0]) {
      const studentId = actionsByStudent[0].studentId;
      console.log(`\n⏱️  TESTING QUERY PERFORMANCE for student: ${studentId}`);
      
      const start = Date.now();
      const actions = await prisma.action.findMany({
        where: {
          studentId: studentId
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
        take: 15,
      });
      const duration = Date.now() - start;
      
      console.log(`   Query completed in: ${duration}ms`);
      console.log(`   Records returned: ${actions.length}`);
      
      if (duration > 1000) {
        console.log('   ⚠️  SLOW QUERY DETECTED!');
      } else {
        console.log('   ✅ Query performance OK');
      }
    }

    // 4. Check related tables
    console.log('\n📊 RELATED TABLES:');
    const studentCount = await prisma.student.count();
    const coachCount = await prisma.coach.count();
    const teamCount = await prisma.team.count();
    const feedbackCount = await prisma.feedback.count();
    
    console.log(`   Students: ${studentCount}`);
    console.log(`   Coaches: ${coachCount}`);
    console.log(`   Teams: ${teamCount}`);
    console.log(`   Feedback: ${feedbackCount}`);

    // 5. Check for data issues
    console.log('\n🔍 CHECKING FOR DATA ISSUES:');
    
    const actionsWithoutCoach = await prisma.action.count({
      where: {
        coach: null
      }
    });
    
    const actionsWithoutStudent = await prisma.action.count({
      where: {
        student: null
      }
    });

    console.log(`   Actions with missing coach: ${actionsWithoutCoach}`);
    console.log(`   Actions with missing student: ${actionsWithoutStudent}`);

    if (actionsWithoutCoach > 0 || actionsWithoutStudent > 0) {
      console.log('   ⚠️  ORPHANED RECORDS DETECTED - This could cause slow queries!');
    }

    // 6. Test simple query without includes
    console.log('\n⚡ TESTING SIMPLIFIED QUERY:');
    const simpleStart = Date.now();
    const simpleActions = await prisma.action.findMany({
      where: {
        studentId: actionsByStudent[0]?.studentId
      },
      select: {
        id: true,
        title: true,
        category: true,
        isCompleted: true,
        createdAt: true
      },
      take: 15
    });
    const simpleDuration = Date.now() - simpleStart;
    console.log(`   Simple query (no joins): ${simpleDuration}ms`);
    console.log(`   Records: ${simpleActions.length}`);

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDatabase(); 