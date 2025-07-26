import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate realistic Mental and Nutrition scores based on age
const generateMentalSkills = (age: number) => {
  if (age <= 10) {
    return {
      moodScore: Math.floor(Math.random() * 3) + 7, // 7-10 (kids generally happier)
      sleepScore: Math.floor(Math.random() * 2) + 8, // 8-10 (good sleep patterns)
    };
  } else if (age >= 11 && age <= 13) {
    return {
      moodScore: Math.floor(Math.random() * 4) + 6, // 6-10 (adolescent mood swings)
      sleepScore: Math.floor(Math.random() * 3) + 7, // 7-10
    };
  } else if (age >= 14 && age <= 18) {
    return {
      moodScore: Math.floor(Math.random() * 5) + 5, // 5-10 (teen stress)
      sleepScore: Math.floor(Math.random() * 4) + 6, // 6-10 (irregular sleep)
    };
  } else {
    return {
      moodScore: Math.floor(Math.random() * 4) + 6, // 6-10 (adult stress)
      sleepScore: Math.floor(Math.random() * 3) + 7, // 7-10
    };
  }
};

const generateNutritionSkills = (age: number) => {
  if (age <= 10) {
    return {
      totalCalories: Math.floor(Math.random() * 300) + 1600, // 1600-1900
      protein: Math.floor(Math.random() * 20) + 40, // 40-60g
      carbohydrates: Math.floor(Math.random() * 50) + 180, // 180-230g
      fats: Math.floor(Math.random() * 15) + 45, // 45-60g
    };
  } else if (age >= 11 && age <= 13) {
    return {
      totalCalories: Math.floor(Math.random() * 400) + 1800, // 1800-2200
      protein: Math.floor(Math.random() * 25) + 50, // 50-75g
      carbohydrates: Math.floor(Math.random() * 60) + 200, // 200-260g
      fats: Math.floor(Math.random() * 20) + 50, // 50-70g
    };
  } else if (age >= 14 && age <= 18) {
    return {
      totalCalories: Math.floor(Math.random() * 600) + 2200, // 2200-2800
      protein: Math.floor(Math.random() * 40) + 70, // 70-110g
      carbohydrates: Math.floor(Math.random() * 80) + 250, // 250-330g
      fats: Math.floor(Math.random() * 25) + 60, // 60-85g
    };
  } else {
    return {
      totalCalories: Math.floor(Math.random() * 500) + 2000, // 2000-2500
      protein: Math.floor(Math.random() * 35) + 80, // 80-115g
      carbohydrates: Math.floor(Math.random() * 70) + 220, // 220-290g
      fats: Math.floor(Math.random() * 20) + 65, // 65-85g
    };
  }
};

async function main() {
  console.log('🧠🥗 Starting Mental & Nutrition skills seeding...');

  try {
    // Get all existing students
    const students = await prisma.student.findMany({
      include: {
        skills: true
      }
    });

    console.log(`Found ${students.length} students to update.`);

    for (const student of students) {
      console.log(`Adding Mental & Nutrition skills for: ${student.studentName}...`);

      // Generate skills based on age
      const mentalSkills = generateMentalSkills(student.age);
      const nutritionSkills = generateNutritionSkills(student.age);
      
      if (student.skills) {
        // Update existing skills record
        await prisma.skills.update({
          where: { id: student.skills.id },
          data: {
            ...mentalSkills,
            ...nutritionSkills,
            lastUpdated: new Date(),
          },
        });
      } else {
        // Create new skills record
        await prisma.skills.create({
          data: {
            userId: student.userId,
            studentId: student.id,
            studentName: student.studentName,
            studentEmail: student.email,
            age: student.age,
            ...mentalSkills,
            ...nutritionSkills,
            category: 'PHYSICAL', // Default category
          },
        });
      }

      console.log(`✅ Added skills for ${student.studentName}:`, {
        mental: mentalSkills,
        nutrition: nutritionSkills
      });
    }

    console.log('\n🎉 Mental & Nutrition skills seeding completed successfully!');
    
    // Display some sample analytics
    const skillsStats = await prisma.skills.findMany({
      select: {
        age: true,
        moodScore: true,
        sleepScore: true,
        totalCalories: true,
        protein: true,
      },
      take: 5
    });

    console.log('\n📊 Sample Data:');
    skillsStats.forEach(skill => {
      console.log(`  Age ${skill.age}: Mood ${skill.moodScore}/10, Sleep ${skill.sleepScore}/10, Calories ${skill.totalCalories}kcal, Protein ${skill.protein}g`);
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();

export default main; 