const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🏆 Seeding milestone badges with Rookie/Athlete/Champion system...');

  // Create badge categories
  const categories = [
    {
      name: 'FITNESS',
      description: 'Physical fitness achievements',
      icon: 'dumbbell',
      color: '#ef4444'
    },
    {
      name: 'MENTAL',
      description: 'Mental wellness achievements',
      icon: 'brain',
      color: '#8b5cf6'
    },
    {
      name: 'NUTRITION',
      description: 'Nutrition and health achievements',
      icon: 'apple',
      color: '#10b981'
    },
    {
      name: 'BATTING',
      description: 'Batting technique achievements',
      icon: 'bat',
      color: '#f59e0b'
    },
    {
      name: 'BOWLING',
      description: 'Bowling technique achievements',
      icon: 'ball',
      color: '#3b82f6'
    },
    {
      name: 'FIELDING',
      description: 'Fielding technique achievements',
      icon: 'glove',
      color: '#06b6d4'
    }
  ];

  for (const category of categories) {
    await prisma.badgeCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('✅ Badge categories created');

  // Get category IDs
  const fitnessCategory = await prisma.badgeCategory.findUnique({ where: { name: 'FITNESS' } });
  const mentalCategory = await prisma.badgeCategory.findUnique({ where: { name: 'MENTAL' } });
  const nutritionCategory = await prisma.badgeCategory.findUnique({ where: { name: 'NUTRITION' } });
  const battingCategory = await prisma.badgeCategory.findUnique({ where: { name: 'BATTING' } });
  const bowlingCategory = await prisma.badgeCategory.findUnique({ where: { name: 'BOWLING' } });
  const fieldingCategory = await prisma.badgeCategory.findUnique({ where: { name: 'FIELDING' } });

  // Define all milestone badges
  const badges = [
    // FITNESS MILESTONES
    // Push-ups
    {
      name: 'Push-up Rookie',
      description: '10 push-ups in 1 minute',
      motivationalText: 'Great start! Keep building that upper body strength!',
      level: 'ROOKIE',
      categoryId: fitnessCategory.id,
      icon: 'muscle',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pushupScore',
          operator: 'GTE',
          value: '10',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 10 push-ups in 1 minute'
        }
      ]
    },
    {
      name: 'Push-up Athlete',
      description: '30 push-ups in 1 minute',
      motivationalText: 'Impressive strength! You\'re building serious power!',
      level: 'ATHLETE',
      categoryId: fitnessCategory.id,
      icon: 'muscle',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pushupScore',
          operator: 'GTE',
          value: '30',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 30 push-ups in 1 minute'
        }
      ]
    },
    {
      name: 'Push-up Champion',
      description: '50 push-ups in 1 minute',
      motivationalText: 'Elite level strength! You\'re a push-up champion!',
      level: 'CHAMPION',
      categoryId: fitnessCategory.id,
      icon: 'muscle',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pushupScore',
          operator: 'GTE',
          value: '50',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 50 push-ups in 1 minute'
        }
      ]
    },

    // Pull-ups
    {
      name: 'Pull-up Rookie',
      description: '3 pull-ups in 1 set',
      motivationalText: 'Excellent! You\'re mastering the pull-up!',
      level: 'ROOKIE',
      categoryId: fitnessCategory.id,
      icon: 'muscle',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pullupScore',
          operator: 'GTE',
          value: '3',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 3 pull-ups in 1 set'
        }
      ]
    },
    {
      name: 'Pull-up Athlete',
      description: '8 pull-ups in 1 set',
      motivationalText: 'Strong performance! Your back strength is impressive!',
      level: 'ATHLETE',
      categoryId: fitnessCategory.id,
      icon: 'muscle',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pullupScore',
          operator: 'GTE',
          value: '8',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 8 pull-ups in 1 set'
        }
      ]
    },
    {
      name: 'Pull-up Champion',
      description: '15 pull-ups in 1 set',
      motivationalText: 'Outstanding! You have champion-level upper body strength!',
      level: 'CHAMPION',
      categoryId: fitnessCategory.id,
      icon: 'muscle',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pullupScore',
          operator: 'GTE',
          value: '15',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 15 pull-ups in 1 set'
        }
      ]
    },

    // 100m Sprint
    {
      name: 'Sprint Rookie',
      description: '100m under 20 seconds',
      motivationalText: 'Good speed! Keep working on your acceleration!',
      level: 'ROOKIE',
      categoryId: fitnessCategory.id,
      icon: 'timer',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'sprintTime',
          operator: 'LT',
          value: '20',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 100m sprint under 20 seconds'
        }
      ]
    },
    {
      name: 'Sprint Athlete',
      description: '100m under 15 seconds',
      motivationalText: 'Fast! You\'re developing serious speed!',
      level: 'ATHLETE',
      categoryId: fitnessCategory.id,
      icon: 'timer',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'sprintTime',
          operator: 'LT',
          value: '15',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 100m sprint under 15 seconds'
        }
      ]
    },
    {
      name: 'Sprint Champion',
      description: '100m under 12 seconds',
      motivationalText: 'Lightning fast! You have elite sprinting speed!',
      level: 'CHAMPION',
      categoryId: fitnessCategory.id,
      icon: 'timer',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'sprintTime',
          operator: 'LT',
          value: '12',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 100m sprint under 12 seconds'
        }
      ]
    },

    // 5K Run
    {
      name: '5K Rookie',
      description: '5K under 40 minutes',
      motivationalText: 'Great endurance! You\'re building stamina!',
      level: 'ROOKIE',
      categoryId: fitnessCategory.id,
      icon: 'timer',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'run5kTime',
          operator: 'LT',
          value: '40',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 5K run under 40 minutes'
        }
      ]
    },
    {
      name: '5K Athlete',
      description: '5K under 30 minutes',
      motivationalText: 'Excellent endurance! Your cardiovascular fitness is strong!',
      level: 'ATHLETE',
      categoryId: fitnessCategory.id,
      icon: 'timer',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'run5kTime',
          operator: 'LT',
          value: '30',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 5K run under 30 minutes'
        }
      ]
    },
    {
      name: '5K Champion',
      description: '5K under 22 minutes',
      motivationalText: 'Elite endurance! You have champion-level cardiovascular fitness!',
      level: 'CHAMPION',
      categoryId: fitnessCategory.id,
      icon: 'timer',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'run5kTime',
          operator: 'LT',
          value: '22',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 5K run under 22 minutes'
        }
      ]
    },

    // MENTAL SKILLS MILESTONES
    // Mood Score
    {
      name: 'Mood Rookie',
      description: 'Average 5/10 mood score over 1 week',
      motivationalText: 'Good start on mental wellness! Keep tracking your mood!',
      level: 'ROOKIE',
      categoryId: mentalCategory.id,
      icon: 'smile',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'WELLNESS',
          fieldName: 'moodScore',
          operator: 'GTE',
          value: '5',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain average mood score of 5/10 over 1 week'
        }
      ]
    },
    {
      name: 'Mood Athlete',
      description: 'Average 7/10 mood score over 2 weeks',
      motivationalText: 'Great mental state! You\'re maintaining positive energy!',
      level: 'ATHLETE',
      categoryId: mentalCategory.id,
      icon: 'smile',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'WELLNESS',
          fieldName: 'moodScore',
          operator: 'GTE',
          value: '7',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain average mood score of 7/10 over 2 weeks'
        }
      ]
    },
    {
      name: 'Mood Champion',
      description: 'Average 9/10 mood score over 1 month',
      motivationalText: 'Outstanding mental wellness! You have champion-level positivity!',
      level: 'CHAMPION',
      categoryId: mentalCategory.id,
      icon: 'smile',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'WELLNESS',
          fieldName: 'moodScore',
          operator: 'GTE',
          value: '9',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain average mood score of 9/10 over 1 month'
        }
      ]
    },

    // Sleep Quality
    {
      name: 'Sleep Rookie',
      description: 'Average 5/10 sleep quality for a week',
      motivationalText: 'Good sleep habits! Rest is crucial for performance!',
      level: 'ROOKIE',
      categoryId: mentalCategory.id,
      icon: 'moon',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'WELLNESS',
          fieldName: 'sleepScore',
          operator: 'GTE',
          value: '5',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain average sleep quality of 5/10 for a week'
        }
      ]
    },
    {
      name: 'Sleep Athlete',
      description: 'Average 7/10 sleep quality for two weeks',
      motivationalText: 'Excellent sleep quality! Your recovery is on point!',
      level: 'ATHLETE',
      categoryId: mentalCategory.id,
      icon: 'moon',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'WELLNESS',
          fieldName: 'sleepScore',
          operator: 'GTE',
          value: '7',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain average sleep quality of 7/10 for two weeks'
        }
      ]
    },
    {
      name: 'Sleep Champion',
      description: 'Average 9/10 sleep quality for a month',
      motivationalText: 'Perfect sleep habits! You have champion-level recovery!',
      level: 'CHAMPION',
      categoryId: mentalCategory.id,
      icon: 'moon',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'WELLNESS',
          fieldName: 'sleepScore',
          operator: 'GTE',
          value: '9',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain average sleep quality of 9/10 for a month'
        }
      ]
    },

    // NUTRITION MILESTONES
    {
      name: 'Nutrition Rookie',
      description: 'Log daily intake for 7 days',
      motivationalText: 'Great start on nutrition tracking! Knowledge is power!',
      level: 'ROOKIE',
      categoryId: nutritionCategory.id,
      icon: 'apple',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'totalCalories',
          operator: 'GT',
          value: '0',
          weight: 1.0,
          isRequired: true,
          description: 'Log daily caloric intake for 7 consecutive days'
        }
      ]
    },
    {
      name: 'Nutrition Athlete',
      description: 'Hit target macros 5+ days in a week',
      motivationalText: 'Excellent nutrition discipline! You\'re fueling performance!',
      level: 'ATHLETE',
      categoryId: nutritionCategory.id,
      icon: 'apple',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'protein',
          operator: 'GTE',
          value: '50',
          weight: 0.33,
          isRequired: true,
          description: 'Meet protein targets consistently'
        },
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'carbohydrates',
          operator: 'GTE',
          value: '200',
          weight: 0.33,
          isRequired: true,
          description: 'Meet carbohydrate targets consistently'
        },
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'fats',
          operator: 'GTE',
          value: '60',
          weight: 0.34,
          isRequired: true,
          description: 'Meet fat targets consistently'
        }
      ]
    },
    {
      name: 'Nutrition Champion',
      description: 'Hit target macros + hydration goal for 30 days',
      motivationalText: 'Perfect nutrition mastery! You have champion-level discipline!',
      level: 'CHAMPION',
      categoryId: nutritionCategory.id,
      icon: 'apple',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'protein',
          operator: 'GTE',
          value: '80',
          weight: 0.25,
          isRequired: true,
          description: 'Meet optimal protein targets for 30 days'
        },
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'carbohydrates',
          operator: 'GTE',
          value: '250',
          weight: 0.25,
          isRequired: true,
          description: 'Meet optimal carbohydrate targets for 30 days'
        },
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'fats',
          operator: 'GTE',
          value: '70',
          weight: 0.25,
          isRequired: true,
          description: 'Meet optimal fat targets for 30 days'
        },
        {
          ruleType: 'CONSISTENCY',
          fieldName: 'totalCalories',
          operator: 'BETWEEN',
          value: '2200,2800',
          weight: 0.25,
          isRequired: true,
          description: 'Maintain optimal caloric intake for 30 days'
        }
      ]
    },

    // BATTING MILESTONES
    {
      name: 'Batting Rookie',
      description: 'Score 5+/10 on grip, stance, balance',
      motivationalText: 'Good batting foundation! Keep working on the basics!',
      level: 'ROOKIE',
      categoryId: battingCategory.id,
      icon: 'bat',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingGrip',
          operator: 'GTE',
          value: '5',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve batting grip score of 5+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingStance',
          operator: 'GTE',
          value: '5',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve batting stance score of 5+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingBalance',
          operator: 'GTE',
          value: '5',
          weight: 0.34,
          isRequired: true,
          description: 'Achieve batting balance score of 5+/10'
        }
      ]
    },
    {
      name: 'Batting Athlete',
      description: 'Score 7+/10 on grip, stance, balance, top hand dominance',
      motivationalText: 'Strong batting technique! You\'re developing real skill!',
      level: 'ATHLETE',
      categoryId: battingCategory.id,
      icon: 'bat',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingGrip',
          operator: 'GTE',
          value: '7',
          weight: 0.25,
          isRequired: true,
          description: 'Achieve batting grip score of 7+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingStance',
          operator: 'GTE',
          value: '7',
          weight: 0.25,
          isRequired: true,
          description: 'Achieve batting stance score of 7+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingBalance',
          operator: 'GTE',
          value: '7',
          weight: 0.25,
          isRequired: true,
          description: 'Achieve batting balance score of 7+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'topHandDominance',
          operator: 'GTE',
          value: '7',
          weight: 0.25,
          isRequired: true,
          description: 'Achieve top hand dominance score of 7+/10'
        }
      ]
    },
    {
      name: 'Batting Champion',
      description: 'Score 9+/10 on all batting metrics',
      motivationalText: 'Master batsman! You have champion-level technique!',
      level: 'CHAMPION',
      categoryId: battingCategory.id,
      icon: 'bat',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingGrip',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve batting grip score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingStance',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve batting stance score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingBalance',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve batting balance score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'cockingOfWrist',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve wrist cocking score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'backLift',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve back lift score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'topHandDominance',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve top hand dominance score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'highElbow',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve high elbow score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'runningBetweenWickets',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve running between wickets score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'calling',
          operator: 'GTE',
          value: '9',
          weight: 0.12,
          isRequired: true,
          description: 'Achieve calling score of 9+/10'
        }
      ]
    },

    // BOWLING MILESTONES
    {
      name: 'Bowling Rookie',
      description: 'Score 5+/10 on grip, run-up, basic foot landing',
      motivationalText: 'Good bowling foundation! Keep working on your action!',
      level: 'ROOKIE',
      categoryId: bowlingCategory.id,
      icon: 'ball',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'bowlingGrip',
          operator: 'GTE',
          value: '5',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve bowling grip score of 5+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'runUp',
          operator: 'GTE',
          value: '5',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve run-up score of 5+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'backFootLanding',
          operator: 'GTE',
          value: '5',
          weight: 0.34,
          isRequired: true,
          description: 'Achieve back foot landing score of 5+/10'
        }
      ]
    },
    {
      name: 'Bowling Athlete',
      description: 'Score 7+/10 on hip drive, arm coordination, follow-through',
      motivationalText: 'Strong bowling action! You\'re developing real pace and accuracy!',
      level: 'ATHLETE',
      categoryId: bowlingCategory.id,
      icon: 'ball',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'hipDrive',
          operator: 'GTE',
          value: '7',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve hip drive score of 7+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'nonBowlingArm',
          operator: 'GTE',
          value: '7',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve arm coordination score of 7+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'followThrough',
          operator: 'GTE',
          value: '7',
          weight: 0.34,
          isRequired: true,
          description: 'Achieve follow-through score of 7+/10'
        }
      ]
    },
    {
      name: 'Bowling Champion',
      description: 'Score 9+/10 across all bowling metrics',
      motivationalText: 'Elite bowler! You have champion-level bowling technique!',
      level: 'CHAMPION',
      categoryId: bowlingCategory.id,
      icon: 'ball',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'bowlingGrip',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve bowling grip score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'runUp',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve run-up score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'backFootLanding',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve back foot landing score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'frontFootLanding',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve front foot landing score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'hipDrive',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve hip drive score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'backFootDrag',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve back foot drag score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'nonBowlingArm',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve non-bowling arm score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'release',
          operator: 'GTE',
          value: '9',
          weight: 0.11,
          isRequired: true,
          description: 'Achieve release score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'followThrough',
          operator: 'GTE',
          value: '9',
          weight: 0.12,
          isRequired: true,
          description: 'Achieve follow-through score of 9+/10'
        }
      ]
    },

    // FIELDING MILESTONES
    {
      name: 'Fielding Rookie',
      description: 'Score 5+/10 on positioning, pick up, aim',
      motivationalText: 'Good fielding basics! Keep working on your fundamentals!',
      level: 'ROOKIE',
      categoryId: fieldingCategory.id,
      icon: 'glove',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'positioningOfBall',
          operator: 'GTE',
          value: '5',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve positioning score of 5+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pickUp',
          operator: 'GTE',
          value: '5',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve pick up score of 5+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'aim',
          operator: 'GTE',
          value: '5',
          weight: 0.34,
          isRequired: true,
          description: 'Achieve aim score of 5+/10'
        }
      ]
    },
    {
      name: 'Fielding Athlete',
      description: 'Score 7+/10 on throwing, receiving, soft hands',
      motivationalText: 'Excellent fielding! You\'re becoming a reliable fielder!',
      level: 'ATHLETE',
      categoryId: fieldingCategory.id,
      icon: 'glove',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'throw',
          operator: 'GTE',
          value: '7',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve throwing score of 7+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'receiving',
          operator: 'GTE',
          value: '7',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve receiving score of 7+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'softHands',
          operator: 'GTE',
          value: '7',
          weight: 0.34,
          isRequired: true,
          description: 'Achieve soft hands score of 7+/10'
        }
      ]
    },
    {
      name: 'Fielding Champion',
      description: 'Score 9+/10 across all fielding metrics',
      motivationalText: 'Elite fielder! You have champion-level fielding skills!',
      level: 'CHAMPION',
      categoryId: fieldingCategory.id,
      icon: 'glove',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'positioningOfBall',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve positioning score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pickUp',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve pick up score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'aim',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve aim score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'throw',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve throwing score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'softHands',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve soft hands score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'receiving',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve receiving score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'highCatch',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve high catch score of 9+/10'
        },
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'flatCatch',
          operator: 'GTE',
          value: '9',
          weight: 0.125,
          isRequired: true,
          description: 'Achieve flat catch score of 9+/10'
        }
      ]
    }
  ];

  console.log(`🏆 Creating ${badges.length} milestone badges...`);

  for (const badgeData of badges) {
    const { rules, ...badge } = badgeData;
    
    // Check if badge already exists
    const existingBadge = await prisma.badge.findFirst({
      where: {
        name: badge.name,
        level: badge.level,
        sport: badge.sport
      }
    });

    let createdBadge;
    if (existingBadge) {
      console.log(`Badge already exists: ${badge.name}`);
      createdBadge = existingBadge;
    } else {
      createdBadge = await prisma.badge.create({
        data: badge
      });
      console.log(`✅ Created badge: ${createdBadge.name}`);
    }

    // Create rules for the badge
    for (const rule of rules) {
      const existingRule = await prisma.badgeRule.findFirst({
        where: {
          badgeId: createdBadge.id,
          fieldName: rule.fieldName,
          operator: rule.operator,
          value: rule.value
        }
      });

      if (!existingRule) {
        await prisma.badgeRule.create({
          data: {
            ...rule,
            badgeId: createdBadge.id
          }
        });
        console.log(`  ✅ Created rule for ${createdBadge.name}: ${rule.fieldName} ${rule.operator} ${rule.value}`);
      }
    }
  }

  console.log('🎉 Milestone badges and rules created successfully!');
  console.log('🏆 Badge system now uses Rookie/Athlete/Champion ranking!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding milestone badges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 