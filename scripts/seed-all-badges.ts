import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting badge seeding...');

  // Create badge categories if they don't exist
  const categories = await createCategories();
  
  // Create all 50 badges
  await createRookieBadges(categories);
  await createAmateurBadges(categories);
  await createProBadges(categories);

  console.log('Badge seeding completed!');
}

async function createCategories() {
  const categoryData = [
    {
      name: 'Physical Fitness',
      description: 'Badges for physical fitness achievements',
      icon: '💪',
      color: '#4CAF50'
    },
    {
      name: 'Technical Skills',
      description: 'Badges for cricket technical skills mastery',
      icon: '🏏',
      color: '#2196F3'
    },
    {
      name: 'Wellness & Nutrition',
      description: 'Badges for wellness and nutrition goals',
      icon: '❤️',
      color: '#FF9800'
    },
    {
      name: 'Match Performance',
      description: 'Badges for match performance achievements',
      icon: '🏆',
      color: '#9C27B0'
    },
    {
      name: 'Consistency',
      description: 'Badges for consistent performance and habits',
      icon: '🎯',
      color: '#F44336'
    }
  ];

  const categories: any = {};
  
  for (const cat of categoryData) {
    const category = await prisma.badgeCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat
    });
    categories[cat.name] = category.id;
  }

  return categories;
}

async function createRookieBadges(categories: any) {
  const rookieBadges = [
    // Physical Fitness
    {
      name: 'First Steps',
      description: 'Complete your first fitness assessment',
      motivationalText: 'Every champion starts with a single step!',
      level: 'ROOKIE',
      categoryId: categories['Physical Fitness'],
      icon: '🏃',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'pushupScore', operator: 'GTE', value: '1', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Push It',
      description: 'Achieve 10 push-ups in a single set',
      motivationalText: 'Building strength one push-up at a time!',
      level: 'ROOKIE',
      categoryId: categories['Physical Fitness'],
      icon: '💯',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'pushupScore', operator: 'GTE', value: '10', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Grip Strength',
      description: 'Achieve 25kg grip strength',
      motivationalText: 'Strong grip, strong game!',
      level: 'ROOKIE',
      categoryId: categories['Physical Fitness'],
      icon: '✊',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'gripStrength', operator: 'GTE', value: '25', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Sprint Starter',
      description: 'Complete 50m sprint under 10 seconds',
      motivationalText: 'Speed is your superpower!',
      level: 'ROOKIE',
      categoryId: categories['Physical Fitness'],
      icon: '⚡',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'sprint50m', operator: 'LTE', value: '10', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Endurance Builder',
      description: 'Complete 5km run under 35 minutes',
      motivationalText: 'Endurance is the key to victory!',
      level: 'ROOKIE',
      categoryId: categories['Physical Fitness'],
      icon: '🏃‍♂️',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'run5kTime', operator: 'LTE', value: '35', weight: 1, isRequired: true }
      ]
    },

    // Technical Skills
    {
      name: 'Stance Master',
      description: 'Achieve 7/10 in batting stance technique',
      motivationalText: 'Perfect stance, perfect start!',
      level: 'ROOKIE',
      categoryId: categories['Technical Skills'],
      icon: '🏏',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'battingStance', operator: 'GTE', value: '7', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Grip Rookie',
      description: 'Achieve 6/10 in batting grip technique',
      motivationalText: 'Master the basics, master the game!',
      level: 'ROOKIE',
      categoryId: categories['Technical Skills'],
      icon: '🤏',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'battingGrip', operator: 'GTE', value: '6', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Catch Beginner',
      description: 'Achieve 5/10 in flat catch technique',
      motivationalText: 'Catches win matches!',
      level: 'ROOKIE',
      categoryId: categories['Technical Skills'],
      icon: '🧤',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'flatCatch', operator: 'GTE', value: '5', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Throw Basics',
      description: 'Achieve 6/10 in throwing technique',
      motivationalText: 'Accuracy comes with practice!',
      level: 'ROOKIE',
      categoryId: categories['Technical Skills'],
      icon: '🎯',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'throw', operator: 'GTE', value: '6', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Balance Foundation',
      description: 'Achieve 7/10 in batting balance',
      motivationalText: 'Balance is the foundation of greatness!',
      level: 'ROOKIE',
      categoryId: categories['Technical Skills'],
      icon: '⚖️',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'battingBalance', operator: 'GTE', value: '7', weight: 1, isRequired: true }
      ]
    },

    // Wellness & Nutrition
    {
      name: 'Hydration Hero',
      description: 'Log 2L+ water intake for 3 consecutive days',
      motivationalText: 'Stay hydrated, stay strong!',
      level: 'ROOKIE',
      categoryId: categories['Wellness & Nutrition'],
      icon: '💧',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'waterIntake', operator: 'GTE', value: '2', weight: 1, isRequired: true, description: '3 days' }
      ]
    },
    {
      name: 'Sleep Tracker',
      description: 'Log sleep score for 5 consecutive days',
      motivationalText: 'Rest well, play well!',
      level: 'ROOKIE',
      categoryId: categories['Wellness & Nutrition'],
      icon: '😴',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'sleepScore', operator: 'GTE', value: '1', weight: 1, isRequired: true, description: '5 days' }
      ]
    },
    {
      name: 'Mood Monitor',
      description: 'Log mood score for 7 consecutive days',
      motivationalText: 'Mental wellness is key to performance!',
      level: 'ROOKIE',
      categoryId: categories['Wellness & Nutrition'],
      icon: '😊',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'moodScore', operator: 'GTE', value: '1', weight: 1, isRequired: true, description: '7 days' }
      ]
    },
    {
      name: 'Protein Power',
      description: 'Meet daily protein target for 3 days',
      motivationalText: 'Fuel your muscles!',
      level: 'ROOKIE',
      categoryId: categories['Wellness & Nutrition'],
      icon: '🥩',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'protein', operator: 'GTE', value: '50', weight: 1, isRequired: true, description: '3 days' }
      ]
    },
    {
      name: 'Calorie Counter',
      description: 'Log total calories for 5 consecutive days',
      motivationalText: 'Track your fuel!',
      level: 'ROOKIE',
      categoryId: categories['Wellness & Nutrition'],
      icon: '📊',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'totalCalories', operator: 'GTE', value: '1000', weight: 1, isRequired: true, description: '5 days' }
      ]
    },

    // Match Performance
    {
      name: 'First Match',
      description: 'Complete your first match entry',
      motivationalText: 'Your journey begins!',
      level: 'ROOKIE',
      categoryId: categories['Match Performance'],
      icon: '🎭',
      rules: [
        { ruleType: 'MATCH_COUNT', fieldName: 'matchesPlayed', operator: 'GTE', value: '1', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Team Player',
      description: 'Participate in 3 matches',
      motivationalText: 'Every match is a learning opportunity!',
      level: 'ROOKIE',
      categoryId: categories['Match Performance'],
      icon: '👥',
      rules: [
        { ruleType: 'MATCH_COUNT', fieldName: 'matchesPlayed', operator: 'GTE', value: '3', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Debut Score',
      description: 'Score your first runs in a match',
      motivationalText: 'First of many!',
      level: 'ROOKIE',
      categoryId: categories['Match Performance'],
      icon: '1️⃣',
      rules: [
        { ruleType: 'MATCH_STAT', fieldName: 'runsScored', operator: 'GTE', value: '1', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Field Presence',
      description: 'Complete 5 fielding performances',
      motivationalText: 'Defense wins games!',
      level: 'ROOKIE',
      categoryId: categories['Match Performance'],
      icon: '🛡️',
      rules: [
        { ruleType: 'MATCH_COUNT', fieldName: 'fieldingPerformances', operator: 'GTE', value: '5', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Match Regular',
      description: 'Participate in 5 matches',
      motivationalText: 'Consistency is key!',
      level: 'ROOKIE',
      categoryId: categories['Match Performance'],
      icon: '📅',
      rules: [
        { ruleType: 'MATCH_COUNT', fieldName: 'matchesPlayed', operator: 'GTE', value: '5', weight: 1, isRequired: true }
      ]
    }
  ];

  await createBadges(rookieBadges);
}

async function createAmateurBadges(categories: any) {
  const amateurBadges = [
    // Physical Fitness
    {
      name: 'Push Power',
      description: 'Achieve 25 push-ups in a single set',
      motivationalText: 'Strength meets endurance!',
      level: 'AMATEUR',
      categoryId: categories['Physical Fitness'],
      icon: '💪',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'pushupScore', operator: 'GTE', value: '25', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Pull Champion',
      description: 'Achieve 5 pull-ups in a single set',
      motivationalText: 'Pull yourself to greatness!',
      level: 'AMATEUR',
      categoryId: categories['Physical Fitness'],
      icon: '🏋️',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'pullupScore', operator: 'GTE', value: '5', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Vertical Leap',
      description: 'Achieve 40cm vertical jump',
      motivationalText: 'Reach for the stars!',
      level: 'AMATEUR',
      categoryId: categories['Physical Fitness'],
      icon: '🦘',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'verticalJump', operator: 'GTE', value: '40', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Speed Demon',
      description: 'Complete 50m sprint under 8 seconds',
      motivationalText: 'Lightning fast!',
      level: 'AMATEUR',
      categoryId: categories['Physical Fitness'],
      icon: '🚀',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'sprint50m', operator: 'LTE', value: '8', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Distance Runner',
      description: 'Complete 5km run under 25 minutes',
      motivationalText: 'Endurance champion!',
      level: 'AMATEUR',
      categoryId: categories['Physical Fitness'],
      icon: '🏃‍♀️',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'run5kTime', operator: 'LTE', value: '25', weight: 1, isRequired: true }
      ]
    },

    // Technical Skills
    {
      name: 'Batting Technique',
      description: 'Achieve 8/10 in 5 different batting skills',
      motivationalText: 'Technical excellence!',
      level: 'AMATEUR',
      categoryId: categories['Technical Skills'],
      icon: '🎯',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'battingStance', operator: 'GTE', value: '8', weight: 0.2, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'battingGrip', operator: 'GTE', value: '8', weight: 0.2, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'battingBalance', operator: 'GTE', value: '8', weight: 0.2, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'backLift', operator: 'GTE', value: '8', weight: 0.2, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'topHandDominance', operator: 'GTE', value: '8', weight: 0.2, isRequired: false }
      ]
    },
    {
      name: 'Bowling Mastery',
      description: 'Achieve 8/10 in 3 bowling techniques',
      motivationalText: 'Master the art of bowling!',
      level: 'AMATEUR',
      categoryId: categories['Technical Skills'],
      icon: '🏏',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'bowlingGrip', operator: 'GTE', value: '8', weight: 0.33, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'runUp', operator: 'GTE', value: '8', weight: 0.33, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'followThrough', operator: 'GTE', value: '8', weight: 0.34, isRequired: false }
      ]
    },
    {
      name: 'Fielding Expert',
      description: 'Achieve 8/10 in 4 fielding skills',
      motivationalText: 'Defense wins championships!',
      level: 'AMATEUR',
      categoryId: categories['Technical Skills'],
      icon: '🛡️',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'flatCatch', operator: 'GTE', value: '8', weight: 0.25, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'highCatch', operator: 'GTE', value: '8', weight: 0.25, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'throw', operator: 'GTE', value: '8', weight: 0.25, isRequired: false },
        { ruleType: 'SKILLS_METRIC', fieldName: 'pickUp', operator: 'GTE', value: '8', weight: 0.25, isRequired: false }
      ]
    },
    {
      name: 'All-Rounder',
      description: 'Achieve 7/10 in batting, bowling, and fielding',
      motivationalText: 'Master of all trades!',
      level: 'AMATEUR',
      categoryId: categories['Technical Skills'],
      icon: '🌟',
      rules: [
        { ruleType: 'SKILLS_METRIC', fieldName: 'battingBalance', operator: 'GTE', value: '7', weight: 0.33, isRequired: true },
        { ruleType: 'SKILLS_METRIC', fieldName: 'bowlingGrip', operator: 'GTE', value: '7', weight: 0.33, isRequired: true },
        { ruleType: 'SKILLS_METRIC', fieldName: 'flatCatch', operator: 'GTE', value: '7', weight: 0.34, isRequired: true }
      ]
    },
    {
      name: 'Technical Consistency',
      description: 'Maintain 7+ average across all skills for 2 weeks',
      motivationalText: 'Consistency breeds excellence!',
      level: 'AMATEUR',
      categoryId: categories['Technical Skills'],
      icon: '📈',
      rules: [
        { ruleType: 'SKILLS_AVERAGE', fieldName: 'technicalAverage', operator: 'GTE', value: '7', weight: 1, isRequired: true, description: '14 days' }
      ]
    },

    // Wellness & Nutrition
    {
      name: 'Hydration Master',
      description: 'Log 3L+ water intake for 7 consecutive days',
      motivationalText: 'Hydration champion!',
      level: 'AMATEUR',
      categoryId: categories['Wellness & Nutrition'],
      icon: '💦',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'waterIntake', operator: 'GTE', value: '3', weight: 1, isRequired: true, description: '7 days' }
      ]
    },
    {
      name: 'Sleep Champion',
      description: 'Maintain 8+ sleep score for 10 consecutive days',
      motivationalText: 'Rest like a champion!',
      level: 'AMATEUR',
      categoryId: categories['Wellness & Nutrition'],
      icon: '🛌',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'sleepScore', operator: 'GTE', value: '8', weight: 1, isRequired: true, description: '10 days' }
      ]
    },
    {
      name: 'Nutrition Balance',
      description: 'Meet all macro targets for 5 consecutive days',
      motivationalText: 'Balanced nutrition, balanced performance!',
      level: 'AMATEUR',
      categoryId: categories['Wellness & Nutrition'],
      icon: '🥗',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'protein', operator: 'GTE', value: '60', weight: 0.33, isRequired: true, description: '5 days' },
        { ruleType: 'WELLNESS_STREAK', fieldName: 'carbohydrates', operator: 'GTE', value: '200', weight: 0.33, isRequired: true, description: '5 days' },
        { ruleType: 'WELLNESS_STREAK', fieldName: 'fats', operator: 'GTE', value: '50', weight: 0.34, isRequired: true, description: '5 days' }
      ]
    },
    {
      name: 'Wellness Warrior',
      description: 'Log all wellness metrics for 14 consecutive days',
      motivationalText: 'Complete wellness tracking!',
      level: 'AMATEUR',
      categoryId: categories['Wellness & Nutrition'],
      icon: '🏆',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'allMetrics', operator: 'GTE', value: '1', weight: 1, isRequired: true, description: '14 days' }
      ]
    },
    {
      name: 'Mood Stability',
      description: 'Maintain 7+ mood score for 10 consecutive days',
      motivationalText: 'Positive mindset, positive results!',
      level: 'AMATEUR',
      categoryId: categories['Wellness & Nutrition'],
      icon: '😄',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'moodScore', operator: 'GTE', value: '7', weight: 1, isRequired: true, description: '10 days' }
      ]
    },

    // Match Performance
    {
      name: 'Consistent Performer',
      description: 'Achieve 6+ rating in 5 consecutive matches',
      motivationalText: 'Consistency is your superpower!',
      level: 'AMATEUR',
      categoryId: categories['Match Performance'],
      icon: '📊',
      rules: [
        { ruleType: 'MATCH_STREAK', fieldName: 'matchRating', operator: 'GTE', value: '6', weight: 1, isRequired: true, description: '5 matches' }
      ]
    },
    {
      name: 'Half Century',
      description: 'Score 50+ runs in a single match',
      motivationalText: 'Fifty up!',
      level: 'AMATEUR',
      categoryId: categories['Match Performance'],
      icon: '5️⃣0️⃣',
      rules: [
        { ruleType: 'MATCH_STAT', fieldName: 'runsScored', operator: 'GTE', value: '50', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Bowling Figures',
      description: 'Take 3+ wickets in a single match',
      motivationalText: 'Strike bowler!',
      level: 'AMATEUR',
      categoryId: categories['Match Performance'],
      icon: '🎳',
      rules: [
        { ruleType: 'MATCH_STAT', fieldName: 'wicketsTaken', operator: 'GTE', value: '3', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Match Winner',
      description: 'Be part of 10 winning matches',
      motivationalText: 'Victory specialist!',
      level: 'AMATEUR',
      categoryId: categories['Match Performance'],
      icon: '🏅',
      rules: [
        { ruleType: 'MATCH_COUNT', fieldName: 'matchesWon', operator: 'GTE', value: '10', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Season Regular',
      description: 'Participate in 15 matches',
      motivationalText: 'Always ready to play!',
      level: 'AMATEUR',
      categoryId: categories['Match Performance'],
      icon: '📆',
      rules: [
        { ruleType: 'MATCH_COUNT', fieldName: 'matchesPlayed', operator: 'GTE', value: '15', weight: 1, isRequired: true }
      ]
    }
  ];

  await createBadges(amateurBadges);
}

async function createProBadges(categories: any) {
  const proBadges = [
    // Elite Performance
    {
      name: 'Century Maker',
      description: 'Score 100+ runs in a single match',
      motivationalText: 'Century club member!',
      level: 'PRO',
      categoryId: categories['Match Performance'],
      icon: '💯',
      rules: [
        { ruleType: 'MATCH_STAT', fieldName: 'runsScored', operator: 'GTE', value: '100', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Five-Wicket Haul',
      description: 'Take 5+ wickets in a single match',
      motivationalText: 'Bowling maestro!',
      level: 'PRO',
      categoryId: categories['Match Performance'],
      icon: '5️⃣',
      rules: [
        { ruleType: 'MATCH_STAT', fieldName: 'wicketsTaken', operator: 'GTE', value: '5', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Perfect 10',
      description: 'Achieve 10/10 in any technical skill',
      motivationalText: 'Perfection achieved!',
      level: 'PRO',
      categoryId: categories['Technical Skills'],
      icon: '🎯',
      rules: [
        { ruleType: 'SKILLS_ANY', fieldName: 'anySkill', operator: 'EQ', value: '10', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Elite Fitness',
      description: 'Achieve top 10% in all fitness metrics',
      motivationalText: 'Physical excellence!',
      level: 'PRO',
      categoryId: categories['Physical Fitness'],
      icon: '🏋️‍♂️',
      rules: [
        { ruleType: 'FITNESS_PERCENTILE', fieldName: 'allFitness', operator: 'GTE', value: '90', weight: 1, isRequired: true }
      ]
    },
    {
      name: 'Match Dominator',
      description: 'Achieve 9+ rating in 3 consecutive matches',
      motivationalText: 'Unstoppable force!',
      level: 'PRO',
      categoryId: categories['Match Performance'],
      icon: '🔥',
      rules: [
        { ruleType: 'MATCH_STREAK', fieldName: 'matchRating', operator: 'GTE', value: '9', weight: 1, isRequired: true, description: '3 matches' }
      ]
    },

    // Master Consistency
    {
      name: 'Technique Master',
      description: 'Maintain 9+ average across all technical skills for 30 days',
      motivationalText: 'Technical perfection sustained!',
      level: 'PRO',
      categoryId: categories['Technical Skills'],
      icon: '🏆',
      rules: [
        { ruleType: 'SKILLS_AVERAGE', fieldName: 'technicalAverage', operator: 'GTE', value: '9', weight: 1, isRequired: true, description: '30 days' }
      ]
    },
    {
      name: 'Wellness Guru',
      description: 'Maintain perfect wellness scores for 30 consecutive days',
      motivationalText: 'Peak wellness achieved!',
      level: 'PRO',
      categoryId: categories['Wellness & Nutrition'],
      icon: '🧘',
      rules: [
        { ruleType: 'WELLNESS_STREAK', fieldName: 'perfectWellness', operator: 'EQ', value: '10', weight: 1, isRequired: true, description: '30 days' }
      ]
    },
    {
      name: 'Peak Performer',
      description: 'Achieve 8+ match rating average over 10 matches',
      motivationalText: 'Consistently exceptional!',
      level: 'PRO',
      categoryId: categories['Match Performance'],
      icon: '⭐',
      rules: [
        { ruleType: 'MATCH_AVERAGE', fieldName: 'matchRating', operator: 'GTE', value: '8', weight: 1, isRequired: true, description: '10 matches' }
      ]
    },
    {
      name: 'Consistency King',
      description: 'Score 25+ runs in 10 consecutive matches',
      motivationalText: 'Reliability personified!',
      level: 'PRO',
      categoryId: categories['Consistency'],
      icon: '👑',
      rules: [
        { ruleType: 'MATCH_STREAK', fieldName: 'runsScored', operator: 'GTE', value: '25', weight: 1, isRequired: true, description: '10 matches' }
      ]
    },
    {
      name: 'PeakPlay Legend',
      description: 'Achieve top 5% PeakScore for your age group',
      motivationalText: 'Elite among the elite!',
      level: 'PRO',
      categoryId: categories['Consistency'],
      icon: '🌟',
      rules: [
        { ruleType: 'PEAKSCORE_PERCENTILE', fieldName: 'peakScore', operator: 'GTE', value: '95', weight: 1, isRequired: true }
      ]
    }
  ];

  await createBadges(proBadges);
}

async function createBadges(badges: any[]) {
  for (const badge of badges) {
    const { rules, ...badgeData } = badge;
    
    // Check if badge already exists
    const existingBadge = await prisma.badge.findFirst({
      where: {
        name: badgeData.name,
        level: badgeData.level,
        sport: 'CRICKET'
      }
    });

    if (existingBadge) {
      console.log(`Badge "${badgeData.name}" already exists, skipping...`);
      continue;
    }

    // Create badge
    const createdBadge = await prisma.badge.create({
      data: {
        ...badgeData,
        sport: 'CRICKET',
        isActive: true
      }
    });

    // Create rules
    for (const rule of rules) {
      await prisma.badgeRule.create({
        data: {
          ...rule,
          badgeId: createdBadge.id
        }
      });
    }

    console.log(`Created badge: ${badgeData.name} (${badgeData.level})`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding badges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 