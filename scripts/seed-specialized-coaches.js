const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding specialized coaches...');

  const specializedCoaches = [
    {
      name: 'Rahul Dravid',
      email: 'rahul.dravid@cricket.com',
      bio: 'Former Indian cricket captain specializing in batting technique and mental resilience. Known as "The Wall" for his defensive batting style.',
      specialties: JSON.stringify(['Batting Technique', 'Mental Toughness', 'Test Cricket', 'Defensive Batting']),
      sport: 'CRICKET',
      location: 'Bangalore, India',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400',
      experience: 25,
      rating: 4.9,
      reviewCount: 87,
      pricePerHour: 150,
      videoCallRate: 120,
      inPersonRate: 200,
      asyncFeedbackRate: 50,
      certifications: JSON.stringify(['Level 4 Coaching Certificate', 'NCA Certified', 'Sports Psychology Diploma']),
      socialLinks: JSON.stringify({
        twitter: '@rahuldravid',
        instagram: '@rahuldravid1'
      }),
      timezone: 'Asia/Kolkata',
      availability: JSON.stringify({
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '10:00', end: '14:00' }
      })
    },
    {
      name: 'Shane Warne',
      email: 'shane.warne@cricket.com',
      bio: 'Legendary Australian leg-spinner with expertise in spin bowling, field tactics, and cricket psychology.',
      specialties: JSON.stringify(['Spin Bowling', 'Leg Spin', 'Cricket Tactics', 'Match Psychology']),
      sport: 'CRICKET',
      location: 'Melbourne, Australia',
      avatar: 'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=400',
      experience: 30,
      rating: 4.8,
      reviewCount: 142,
      pricePerHour: 180,
      videoCallRate: 150,
      inPersonRate: 250,
      asyncFeedbackRate: 60,
      certifications: JSON.stringify(['Cricket Australia Level 4', 'Advanced Spin Bowling Specialist']),
      socialLinks: JSON.stringify({
        twitter: '@shanewarne23',
        youtube: 'Shane Warne Cricket'
      }),
      timezone: 'Australia/Melbourne',
      availability: JSON.stringify({
        monday: { start: '08:00', end: '16:00' },
        tuesday: { start: '08:00', end: '16:00' },
        wednesday: { start: '08:00', end: '16:00' },
        thursday: { start: '08:00', end: '16:00' },
        friday: { start: '08:00', end: '16:00' }
      })
    },
    {
      name: 'AB de Villiers',
      email: 'ab.devilliers@cricket.com',
      bio: 'Former South African captain known for innovative batting and 360-degree shot-making. Specialist in modern T20 cricket.',
      specialties: JSON.stringify(['360-Degree Batting', 'T20 Cricket', 'Innovative Shots', 'Wicket Keeping']),
      sport: 'CRICKET',
      location: 'Cape Town, South Africa',
      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      experience: 20,
      rating: 4.9,
      reviewCount: 95,
      pricePerHour: 160,
      videoCallRate: 130,
      inPersonRate: 220,
      asyncFeedbackRate: 55,
      certifications: JSON.stringify(['CSA Level 3 Coach', 'T20 Specialist Certification']),
      socialLinks: JSON.stringify({
        twitter: '@ABdeVilliers17',
        instagram: '@abdevilliers17'
      }),
      timezone: 'Africa/Johannesburg',
      availability: JSON.stringify({
        monday: { start: '07:00', end: '15:00' },
        tuesday: { start: '07:00', end: '15:00' },
        wednesday: { start: '07:00', end: '15:00' },
        thursday: { start: '07:00', end: '15:00' },
        friday: { start: '07:00', end: '15:00' },
        saturday: { start: '09:00', end: '13:00' }
      })
    },
    {
      name: 'Dale Steyn',
      email: 'dale.steyn@cricket.com',
      bio: 'Former South African fast bowler with expertise in pace bowling, swing, and seam movement. Master of express pace.',
      specialties: JSON.stringify(['Fast Bowling', 'Swing Bowling', 'Seam Movement', 'Pace Development']),
      sport: 'CRICKET',
      location: 'Durban, South Africa',
      avatar: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      experience: 22,
      rating: 4.7,
      reviewCount: 73,
      pricePerHour: 140,
      videoCallRate: 110,
      inPersonRate: 180,
      asyncFeedbackRate: 45,
      certifications: JSON.stringify(['CSA Fast Bowling Specialist', 'Biomechanics Certification']),
      socialLinks: JSON.stringify({
        twitter: '@DaleSteyn62',
        instagram: '@dalesteyn62'
      }),
      timezone: 'Africa/Johannesburg',
      availability: JSON.stringify({
        tuesday: { start: '06:00', end: '14:00' },
        wednesday: { start: '06:00', end: '14:00' },
        thursday: { start: '06:00', end: '14:00' },
        friday: { start: '06:00', end: '14:00' },
        saturday: { start: '08:00', end: '12:00' }
      })
    },
    {
      name: 'Mithali Raj',
      email: 'mithali.raj@cricket.com',
      bio: 'Former Indian women\'s cricket captain and leading run-scorer. Expert in women\'s cricket development and batting consistency.',
      specialties: JSON.stringify(['Women\'s Cricket', 'Batting Consistency', 'Leadership', 'ODI Cricket']),
      sport: 'CRICKET',
      location: 'Hyderabad, India',
      avatar: 'https://images.unsplash.com/photo-1594736797933-d0300d2b18fa?w=400',
      experience: 18,
      rating: 4.8,
      reviewCount: 64,
      pricePerHour: 120,
      videoCallRate: 100,
      inPersonRate: 160,
      asyncFeedbackRate: 40,
      certifications: JSON.stringify(['BCCI Women\'s Cricket Specialist', 'Leadership in Sports Certificate']),
      socialLinks: JSON.stringify({
        twitter: '@M_Raj03',
        instagram: '@mithaliraj'
      }),
      timezone: 'Asia/Kolkata',
      availability: JSON.stringify({
        monday: { start: '10:00', end: '18:00' },
        tuesday: { start: '10:00', end: '18:00' },
        wednesday: { start: '10:00', end: '18:00' },
        thursday: { start: '10:00', end: '18:00' },
        friday: { start: '10:00', end: '18:00' }
      })
    },
    {
      name: 'Jonty Rhodes',
      email: 'jonty.rhodes@cricket.com',
      bio: 'Former South African fielder and batting coach. Revolutionary fielding techniques and fitness specialist.',
      specialties: JSON.stringify(['Fielding Excellence', 'Fitness Training', 'Agility', 'Ground Fielding']),
      sport: 'CRICKET',
      location: 'Mumbai, India',
      avatar: 'https://images.unsplash.com/photo-1552374196-1ab2c1c593e8?w=400',
      experience: 28,
      rating: 4.9,
      reviewCount: 156,
      pricePerHour: 130,
      videoCallRate: 105,
      inPersonRate: 170,
      asyncFeedbackRate: 42,
      certifications: JSON.stringify(['Fielding Specialist Certificate', 'Sports Science Degree', 'Fitness Trainer Certification']),
      socialLinks: JSON.stringify({
        twitter: '@JontyRhodes8',
        instagram: '@jontyrhodes8'
      }),
      timezone: 'Asia/Kolkata',
      availability: JSON.stringify({
        monday: { start: '06:00', end: '14:00' },
        tuesday: { start: '06:00', end: '14:00' },
        wednesday: { start: '06:00', end: '14:00' },
        thursday: { start: '06:00', end: '14:00' },
        friday: { start: '06:00', end: '14:00' },
        saturday: { start: '07:00', end: '11:00' }
      })
    }
  ];

  for (const coach of specializedCoaches) {
    await prisma.specializedCoach.upsert({
      where: { email: coach.email },
      update: {},
      create: coach
    });
  }

  console.log(`Successfully seeded ${specializedCoaches.length} specialized coaches!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 