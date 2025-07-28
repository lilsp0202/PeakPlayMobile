const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🏆 Seeding SkillSnap test badges for demo (FIXED VERSION)...');

  // Ensure badge categories exist
  const categories = [
    {
      name: 'PHYSICAL',
      description: 'Physical fitness achievements',
      icon: 'dumbbell',
      color: '#ef4444'
    },
    {
      name: 'TECHNICAL',
      description: 'Technical skill achievements',
      icon: 'target',
      color: '#3b82f6'
    },
    {
      name: 'MENTAL',
      description: 'Mental wellness achievements',
      icon: 'brain',
      color: '#8b5cf6'
    },
    {
      name: 'NUTRITION',
      description: 'Nutrition and wellness achievements',
      icon: 'apple',
      color: '#10b981'
    }
  ];

  for (const category of categories) {
    await prisma.badgeCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('✅ Badge categories ensured');

  // Get category IDs
  const physicalCategory = await prisma.badgeCategory.findUnique({ where: { name: 'PHYSICAL' } });
  const technicalCategory = await prisma.badgeCategory.findUnique({ where: { name: 'TECHNICAL' } });
  const mentalCategory = await prisma.badgeCategory.findUnique({ where: { name: 'MENTAL' } });
  const nutritionCategory = await prisma.badgeCategory.findUnique({ where: { name: 'NUTRITION' } });

  // Create 10 test badges based on SkillSnap metrics with CORRECT rule types
  const testBadges = [
    // Physical Skills - Endurance
    {
      name: 'Elite Endurance',
      description: 'Complete 5K run in under 20 minutes',
      motivationalText: 'Endurance is the key to greatness!',
      level: 'GOLD',
      categoryId: physicalCategory.id,
      icon: 'trophy',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'run5kTime',
          operator: 'LTE',
          value: '20',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 5K run in 20 minutes or less'
        }
      ]
    },
    
    // Physical Skills - Speed
    {
      name: 'Speed Demon',
      description: 'Sprint 100m in under 12 seconds',
      motivationalText: 'Lightning fast performance!',
      level: 'SILVER',
      categoryId: physicalCategory.id,
      icon: 'zap',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'sprintTime',
          operator: 'LTE',
          value: '12',
          weight: 1.0,
          isRequired: true,
          description: 'Sprint 100m in 12 seconds or less'
        }
      ]
    },

    // Physical Skills - Agility
    {
      name: 'Agility Master',
      description: 'Excel in shuttle run performance',
      motivationalText: 'Quick feet, quicker mind!',
      level: 'BRONZE',
      categoryId: physicalCategory.id,
      icon: 'wind',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'shuttleRun',
          operator: 'LTE',
          value: '12',
          weight: 1.0,
          isRequired: true,
          description: 'Complete shuttle run in 12 seconds or less'
        }
      ]
    },

    // Physical Skills - Strength
    {
      name: 'Power Hitter',
      description: 'Achieve 30+ push-ups and 10+ pull-ups',
      motivationalText: 'Strength builds champions!',
      level: 'GOLD',
      categoryId: physicalCategory.id,
      icon: 'muscle',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'pushupScore',
          operator: 'GTE',
          value: '30',
          weight: 0.5,
          isRequired: true,
          description: 'Complete at least 30 push-ups'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'pullupScore',
          operator: 'GTE',
          value: '10',
          weight: 0.5,
          isRequired: true,
          description: 'Complete at least 10 pull-ups'
        }
      ]
    },

    // Mental Skills - Focus
    {
      name: 'Focus Champion',
      description: 'Maintain excellent mood and mental state',
      motivationalText: 'Mental strength leads to success!',
      level: 'SILVER',
      categoryId: mentalCategory.id,
      icon: 'brain',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'moodScore',
          operator: 'GTE',
          value: '8',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain mood score of 8 or higher'
        }
      ]
    },

    // Mental Skills - Recovery
    {
      name: 'Mental Resilience',
      description: 'Achieve consistent quality sleep',
      motivationalText: 'Rest well, perform better!',
      level: 'BRONZE',
      categoryId: mentalCategory.id,
      icon: 'moon',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'sleepScore',
          operator: 'GTE',
          value: '8',
          weight: 1.0,
          isRequired: true,
          description: 'Maintain sleep quality score of 8 or higher'
        }
      ]
    },

    // Technical Skills - Batting
    {
      name: 'Top Technique',
      description: 'Master batting fundamentals',
      motivationalText: 'Perfect technique, perfect results!',
      level: 'GOLD',
      categoryId: technicalCategory.id,
      icon: 'target',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'battingGrip',
          operator: 'GTE',
          value: '8',
          weight: 0.5,
          isRequired: true,
          description: 'Achieve batting grip score of 8 or higher'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'battingStance',
          operator: 'GTE',
          value: '8',
          weight: 0.5,
          isRequired: true,
          description: 'Achieve batting stance score of 8 or higher'
        }
      ]
    },

    // Technical Skills - Bowling
    {
      name: 'Form Perfectionist',
      description: 'Excel in bowling technique',
      motivationalText: 'Perfect form, perfect delivery!',
      level: 'SILVER',
      categoryId: technicalCategory.id,
      icon: 'circle',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'bowlingGrip',
          operator: 'GTE',
          value: '9',
          weight: 0.5,
          isRequired: true,
          description: 'Achieve bowling grip score of 9 or higher'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'release',
          operator: 'GTE',
          value: '8',
          weight: 0.5,
          isRequired: true,
          description: 'Achieve release technique score of 8 or higher'
        }
      ]
    },

    // Technical Skills - All-round
    {
      name: 'Balanced Performer',
      description: 'Excel across multiple technical skills',
      motivationalText: 'Balance is the key to excellence!',
      level: 'GOLD',
      categoryId: technicalCategory.id,
      icon: 'star',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'battingGrip',
          operator: 'GTE',
          value: '7',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve batting grip score of 7 or higher'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'bowlingGrip',
          operator: 'GTE',
          value: '7',
          weight: 0.33,
          isRequired: true,
          description: 'Achieve bowling grip score of 7 or higher'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'throw',
          operator: 'GTE',
          value: '7',
          weight: 0.34,
          isRequired: true,
          description: 'Achieve throwing technique score of 7 or higher'
        }
      ]
    },

    // Overall Performance
    {
      name: 'Consistency King',
      description: 'Demonstrate consistent performance across all areas',
      motivationalText: 'Consistency creates champions!',
      level: 'GOLD',
      categoryId: physicalCategory.id,
      icon: 'crown',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'pushupScore',
          operator: 'GTE',
          value: '25',
          weight: 0.25,
          isRequired: true,
          description: 'Complete at least 25 push-ups'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'sprintTime',
          operator: 'LTE',
          value: '14',
          weight: 0.25,
          isRequired: true,
          description: 'Sprint 100m in 14 seconds or less'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'moodScore',
          operator: 'GTE',
          value: '7',
          weight: 0.25,
          isRequired: true,
          description: 'Maintain mood score of 7 or higher'
        },
        {
          ruleType: 'SKILLS_METRIC',
          fieldName: 'run5kTime',
          operator: 'LTE',
          value: '28',
          weight: 0.25,
          isRequired: true,
          description: 'Complete 5K run in 28 minutes or less'
        }
      ]
    }
  ];

  // First, remove existing test badges to clean up
  console.log('🧹 Cleaning up existing test badges...');
  const testBadgeNames = testBadges.map(badge => badge.name);
  
  const existingBadges = await prisma.badge.findMany({
    where: {
      name: {
        in: testBadgeNames
      }
    },
    include: {
      rules: true
    }
  });

  // Delete existing badge rules first (due to foreign key constraints)
  for (const badge of existingBadges) {
    await prisma.badgeRule.deleteMany({
      where: {
        badgeId: badge.id
      }
    });
    
    await prisma.badge.delete({
      where: {
        id: badge.id
      }
    });
    console.log(`🗑️ Removed existing badge: ${badge.name}`);
  }

  // Create badges and rules with correct rule types
  for (const badgeData of testBadges) {
    const { rules, ...badge } = badgeData;
    
    const createdBadge = await prisma.badge.create({
      data: badge
    });
    console.log(`✅ Created badge: ${createdBadge.name} (${badge.level})`);

    // Create rules for the badge
    for (const rule of rules) {
      await prisma.badgeRule.create({
        data: {
          ...rule,
          badgeId: createdBadge.id
        }
      });
      console.log(`   ➕ Created rule: ${rule.fieldName} ${rule.operator} ${rule.value}`);
    }
  }

  console.log('🎉 10 SkillSnap test badges created successfully with CORRECT rule types!');
  console.log('');
  console.log('📋 Badge Summary:');
  console.log('   Physical: Elite Endurance, Speed Demon, Agility Master, Power Hitter, Consistency King');
  console.log('   Mental: Focus Champion, Mental Resilience');
  console.log('   Technical: Top Technique, Form Perfectionist, Balanced Performer');
  console.log('');
  console.log('🔗 These badges are now available in the Badge Center for demo purposes!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test badges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 