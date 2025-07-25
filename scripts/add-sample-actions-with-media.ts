import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleActionsWithMedia() {
  console.log('🎬 Creating sample actions with media uploads...');

  try {
    // Get first coach and student for testing
    const coach = await prisma.coach.findFirst({
      include: { students: true }
    });
    
    const student = await prisma.student.findFirst();

    if (!coach || !student) {
      console.log('❌ No coach or student found. Please run the main seed first.');
      return;
    }

    console.log(`📋 Creating actions for Coach: ${coach.name}, Student: ${student.studentName}`);

    // Sample actions with different media scenarios
    const actionsToCreate = [
      {
        title: "Shooting Technique Demo",
        description: "Practice your shooting form with this demonstration video. Focus on follow-through and arc.",
        category: "TECHNIQUE",
        priority: "HIGH",
        coachId: coach.id,
        studentId: student.id,
        // Demo media from coach
        demoMediaUrl: "https://example.com/demo-shooting-technique.mp4",
        demoMediaType: "video/mp4",
        demoFileName: "shooting_technique_demo.mp4",
        demoFileSize: 2048000, // 2MB
        demoUploadMethod: "supabase",
        demoUploadedAt: new Date(),
        // Proof media from student  
        proofMediaUrl: "https://example.com/student-shooting-proof.mp4",
        proofMediaType: "video/mp4", 
        proofFileName: "my_shooting_practice.mp4",
        proofFileSize: 1536000, // 1.5MB
        proofUploadMethod: "supabase",
        proofUploadedAt: new Date(),
        isCompleted: true,
        completedAt: new Date()
      },
      {
        title: "Dribbling Drill Practice",
        description: "Master the cone weaving drill shown in the demo video.",
        category: "SKILL",
        priority: "MEDIUM", 
        coachId: coach.id,
        studentId: student.id,
        // Only demo media from coach (student hasn't uploaded proof yet)
        demoMediaUrl: "https://example.com/demo-dribbling-drill.mp4",
        demoMediaType: "video/mp4",
        demoFileName: "dribbling_drill_demo.mp4", 
        demoFileSize: 3072000, // 3MB
        demoUploadMethod: "supabase",
        demoUploadedAt: new Date()
      },
      {
        title: "Fitness Challenge Completion",
        description: "Upload proof of completing the 20 burpees + 50 sit-ups challenge.",
        category: "FITNESS",
        priority: "LOW",
        coachId: coach.id,
        studentId: student.id,
        // Only proof media from student (no demo needed)
        proofMediaUrl: "https://example.com/student-fitness-proof.jpg",
        proofMediaType: "image/jpeg",
        proofFileName: "burpee_challenge_complete.jpg",
        proofFileSize: 512000, // 512KB
        proofUploadMethod: "supabase", 
        proofUploadedAt: new Date(),
        isCompleted: true,
        completedAt: new Date(),
        isAcknowledged: true,
        acknowledgedAt: new Date()
      },
      {
        title: "Free Throw Form Check",
        description: "Compare your form to the demo and upload a video of your practice.",
        category: "TECHNIQUE", 
        priority: "HIGH",
        coachId: coach.id,
        studentId: student.id,
        // Both demo and proof media
        demoMediaUrl: "https://example.com/demo-free-throw.mp4",
        demoMediaType: "video/mp4",
        demoFileName: "perfect_free_throw_form.mp4",
        demoFileSize: 1024000, // 1MB
        demoUploadMethod: "supabase",
        demoUploadedAt: new Date(),
        proofMediaUrl: "https://example.com/student-free-throw.mp4", 
        proofMediaType: "video/mp4",
        proofFileName: "my_free_throw_practice.mp4",
        proofFileSize: 2560000, // 2.5MB
        proofUploadMethod: "supabase",
        proofUploadedAt: new Date()
      },
      {
        title: "Speed Test Results",
        description: "Submit your sprint time results with photo evidence.",
        category: "FITNESS",
        priority: "MEDIUM",
        coachId: coach.id, 
        studentId: student.id,
        // Only proof media (image)
        proofMediaUrl: "https://example.com/student-sprint-time.jpg",
        proofMediaType: "image/jpeg", 
        proofFileName: "sprint_time_results.jpg",
        proofFileSize: 256000, // 256KB
        proofUploadMethod: "supabase",
        proofUploadedAt: new Date(),
        isCompleted: true,
        completedAt: new Date()
      }
    ];

    for (const actionData of actionsToCreate) {
      const action = await prisma.action.create({
        data: actionData
      });
      
      console.log(`✅ Created action: "${action.title}" with ${action.demoMediaUrl ? 'demo' : 'no demo'} + ${action.proofMediaUrl ? 'proof' : 'no proof'} media`);
    }

    console.log('\n🎉 Sample actions with media created successfully!');
    console.log('\n📍 Where to find the buttons:');
    console.log('1. Go to Coach Dashboard → Students → Track → Actions tab');
    console.log('2. Look for actions with media - you should see:');
    console.log('   🎥 "View Demo" button (blue) - for coach demonstration videos');
    console.log('   👁️ "View Proof" button (green) - for student uploaded proof');
    console.log('3. File sizes are shown next to buttons (e.g., "2MB", "1.5MB")');
    console.log('\n💡 Actions without media will show "Upload Proof" button instead');

  } catch (error) {
    console.error('❌ Error creating sample actions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleActionsWithMedia(); 