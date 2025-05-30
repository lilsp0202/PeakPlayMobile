import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

// Age group mappings
const getAgeGroup = (age: number): string => {
  if (age <= 10) return "10 and below";
  if (age >= 11 && age <= 13) return "11-13";
  if (age >= 14 && age <= 18) return "14-18";
  return "18+";
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const ageParam = searchParams.get('age');
    
    if (!ageParam) {
      return NextResponse.json(
        { message: "Age parameter is required" },
        { status: 400 }
      );
    }
    
    const age = parseInt(ageParam);
    const ageGroup = getAgeGroup(age);
    
    // Define age ranges for filtering
    let ageFilter: { gte?: number; lte?: number } = {};
    
    switch (ageGroup) {
      case "10 and below":
        ageFilter = { lte: 10 };
        break;
      case "11-13":
        ageFilter = { gte: 11, lte: 13 };
        break;
      case "14-18":
        ageFilter = { gte: 14, lte: 18 };
        break;
      case "18+":
        ageFilter = { gte: 18 };
        break;
    }
    
    // Get all skills for the age group
    const skillsInAgeGroup = await prisma.skills.findMany({
      where: {
        age: ageFilter,
      },
      select: {
        // Physical skills
        pushupScore: true,
        pullupScore: true,
        sprintTime: true,
        run5kTime: true,
        // Mental skills
        moodScore: true,
        sleepScore: true,
        // Nutrition skills
        totalCalories: true,
        protein: true,
        carbohydrates: true,
        fats: true,
      },
    });
    
    if (skillsInAgeGroup.length === 0) {
      return NextResponse.json({
        ageGroup,
        averages: {
          // Physical
          pushupScore: 0,
          pullupScore: 0,
          sprintTime: 0,
          run5kTime: 0,
          // Mental
          moodScore: 0,
          sleepScore: 0,
          // Nutrition
          totalCalories: 0,
          protein: 0,
          carbohydrates: 0,
          fats: 0,
        },
        sampleSize: 0,
      });
    }
    
    // Calculate averages
    interface TotalsAccumulator {
      pushupScore: number;
      pullupScore: number;
      sprintTime: number;
      run5kTime: number;
      pushupCount: number;
      pullupCount: number;
      sprintCount: number;
      run5kCount: number;
      moodScore: number;
      sleepScore: number;
      moodCount: number;
      sleepCount: number;
      totalCalories: number;
      protein: number;
      carbohydrates: number;
      fats: number;
      caloriesCount: number;
      proteinCount: number;
      carbohydratesCount: number;
      fatsCount: number;
    }

    const totals = skillsInAgeGroup.reduce<TotalsAccumulator>(
      (acc, skills) => ({
        // Physical skills
        pushupScore: acc.pushupScore + (skills.pushupScore || 0),
        pullupScore: acc.pullupScore + (skills.pullupScore || 0),
        sprintTime: acc.sprintTime + (skills.sprintTime || 0),
        run5kTime: acc.run5kTime + (skills.run5kTime || 0),
        pushupCount: acc.pushupCount + (skills.pushupScore ? 1 : 0),
        pullupCount: acc.pullupCount + (skills.pullupScore ? 1 : 0),
        sprintCount: acc.sprintCount + (skills.sprintTime ? 1 : 0),
        run5kCount: acc.run5kCount + (skills.run5kTime ? 1 : 0),
        
        // Mental skills
        moodScore: acc.moodScore + (skills.moodScore || 0),
        sleepScore: acc.sleepScore + (skills.sleepScore || 0),
        moodCount: acc.moodCount + (skills.moodScore ? 1 : 0),
        sleepCount: acc.sleepCount + (skills.sleepScore ? 1 : 0),
        
        // Nutrition skills
        totalCalories: acc.totalCalories + (skills.totalCalories || 0),
        protein: acc.protein + (skills.protein || 0),
        carbohydrates: acc.carbohydrates + (skills.carbohydrates || 0),
        fats: acc.fats + (skills.fats || 0),
        caloriesCount: acc.caloriesCount + (skills.totalCalories ? 1 : 0),
        proteinCount: acc.proteinCount + (skills.protein ? 1 : 0),
        carbohydratesCount: acc.carbohydratesCount + (skills.carbohydrates ? 1 : 0),
        fatsCount: acc.fatsCount + (skills.fats ? 1 : 0),
      }),
      {
        // Physical
        pushupScore: 0,
        pullupScore: 0,
        sprintTime: 0,
        run5kTime: 0,
        pushupCount: 0,
        pullupCount: 0,
        sprintCount: 0,
        run5kCount: 0,
        
        // Mental
        moodScore: 0,
        sleepScore: 0,
        moodCount: 0,
        sleepCount: 0,
        
        // Nutrition
        totalCalories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        caloriesCount: 0,
        proteinCount: 0,
        carbohydratesCount: 0,
        fatsCount: 0,
      }
    );
    
    const averages = {
      // Physical skills
      pushupScore: totals.pushupCount > 0 ? Math.round(totals.pushupScore / totals.pushupCount) : 0,
      pullupScore: totals.pullupCount > 0 ? Math.round(totals.pullupScore / totals.pullupCount) : 0,
      sprintTime: totals.sprintCount > 0 ? Number((totals.sprintTime / totals.sprintCount).toFixed(2)) : 0,
      run5kTime: totals.run5kCount > 0 ? Number((totals.run5kTime / totals.run5kCount).toFixed(2)) : 0,
      
      // Mental skills
      moodScore: totals.moodCount > 0 ? Number((totals.moodScore / totals.moodCount).toFixed(1)) : 0,
      sleepScore: totals.sleepCount > 0 ? Number((totals.sleepScore / totals.sleepCount).toFixed(1)) : 0,
      
      // Nutrition skills
      totalCalories: totals.caloriesCount > 0 ? Math.round(totals.totalCalories / totals.caloriesCount) : 0,
      protein: totals.proteinCount > 0 ? Number((totals.protein / totals.proteinCount).toFixed(1)) : 0,
      carbohydrates: totals.carbohydratesCount > 0 ? Number((totals.carbohydrates / totals.carbohydratesCount).toFixed(1)) : 0,
      fats: totals.fatsCount > 0 ? Number((totals.fats / totals.fatsCount).toFixed(1)) : 0,
    };
    
    return NextResponse.json({
      ageGroup,
      averages,
      sampleSize: skillsInAgeGroup.length,
    });
  } catch (error) {
    console.error("Error fetching skill analytics:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 