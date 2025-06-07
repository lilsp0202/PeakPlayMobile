const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample badges...');

  // Create badge categories
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
    }
  ];

  for (const category of categories) {
    await prisma.badgeCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('Badge categories created');

  // Get category IDs
  const physicalCategory = await prisma.badgeCategory.findUnique({ where: { name: 'PHYSICAL' } });
  const technicalCategory = await prisma.badgeCategory.findUnique({ where: { name: 'TECHNICAL' } });
  const mentalCategory = await prisma.badgeCategory.findUnique({ where: { name: 'MENTAL' } });

  // Create sample badges
  const badges = [
    {
      name: 'Push-up Champion',
      description: 'Complete 20 push-ups in one session',
      motivationalText: 'Strength comes from consistency!',
      level: 'BRONZE',
      categoryId: physicalCategory.id,
      icon: 'trophy',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'pushupScore',
          operator: 'gte',
          value: '20',
          weight: 1.0,
          isRequired: true,
          description: 'Complete at least 20 push-ups'
        }
      ]
    },
    {
      name: 'Batting Excellence',
      description: 'Achieve excellent batting grip technique',
      motivationalText: 'Perfect your basics to excel!',
      level: 'SILVER',
      categoryId: technicalCategory.id,
      icon: 'target',
      sport: 'CRICKET',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'battingGrip',
          operator: 'gte',
          value: '8',
          weight: 1.0,
          isRequired: true,
          description: 'Achieve batting grip score of 8 or higher'
        }
      ]
    },
    {
      name: 'Endurance Runner',
      description: 'Complete 5K run under 25 minutes',
      motivationalText: 'Every step forward is progress!',
      level: 'GOLD',
      categoryId: physicalCategory.id,
      icon: 'award',
      sport: 'ALL',
      rules: [
        {
          ruleType: 'PERFORMANCE',
          fieldName: 'run5kTime',
          operator: 'lte',
          value: '25',
          weight: 1.0,
          isRequired: true,
          description: 'Complete 5K run in 25 minutes or less'
        }
      ]
    }
  ];

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
      console.log(`Created badge: ${createdBadge.name}`);
    }

    // Create rules for the badge
    for (const rule of rules) {
      const existingRule = await prisma.badgeRule.findFirst({
        where: {
          badgeId: createdBadge.id,
          fieldName: rule.fieldName
        }
      });

      if (!existingRule) {
        await prisma.badgeRule.create({
          data: {
            ...rule,
            badgeId: createdBadge.id
          }
        });
        console.log(`Created rule for ${createdBadge.name}: ${rule.fieldName}`);
      }
    }
  }

  console.log('Sample badges and rules created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 