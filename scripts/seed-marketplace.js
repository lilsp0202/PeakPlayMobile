const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleCoaches = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@peakplay.com",
    bio: "Former international cricket player with 15 years of experience. Specialized in batting techniques and mental conditioning. Helped over 200+ athletes improve their game.",
    specialties: JSON.stringify(["Batting", "Mental Conditioning", "Technique Analysis", "Match Strategy"]),
    sport: "CRICKET",
    location: "Mumbai, India",
    experience: 15,
    rating: 4.9,
    reviewCount: 87,
    pricePerHour: 150,
    videoCallRate: 120,
    inPersonRate: 200,
    asyncFeedbackRate: 80,
    certifications: JSON.stringify(["ICC Level 3 Coaching", "Sports Psychology Diploma", "Biomechanics Certification"]),
    socialLinks: JSON.stringify({
      linkedin: "https://linkedin.com/in/rahulsharma",
      twitter: "https://twitter.com/rahulsharma_coach"
    }),
    timezone: "Asia/Kolkata",
    availability: JSON.stringify({
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: { start: "10:00", end: "16:00" },
      sunday: { start: "10:00", end: "14:00" }
    })
  },
  {
    name: "Priya Patel",
    email: "priya.patel@peakplay.com",
    bio: "Former women's cricket captain with expertise in bowling techniques and fielding. Known for developing young talent and building confidence in athletes.",
    specialties: JSON.stringify(["Bowling", "Fielding", "Youth Development", "Confidence Building"]),
    sport: "CRICKET",
    location: "Delhi, India",
    experience: 12,
    rating: 4.8,
    reviewCount: 64,
    pricePerHour: 130,
    videoCallRate: 100,
    inPersonRate: 180,
    asyncFeedbackRate: 70,
    certifications: JSON.stringify(["BCCI Level 2 Coaching", "Youth Development Specialist", "Fitness Training"]),
    socialLinks: JSON.stringify({
      linkedin: "https://linkedin.com/in/priyapatel",
      instagram: "https://instagram.com/priya_cricket_coach"
    }),
    timezone: "Asia/Kolkata",
    availability: JSON.stringify({
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
      saturday: { start: "09:00", end: "15:00" }
    })
  },
  {
    name: "Michael Johnson",
    email: "michael.johnson@peakplay.com",
    bio: "International cricket coach with experience in T20 and ODI formats. Specializes in power hitting, death bowling, and modern cricket strategies.",
    specialties: JSON.stringify(["Power Hitting", "T20 Strategy", "Death Bowling", "Modern Cricket"]),
    sport: "CRICKET",
    location: "Sydney, Australia",
    experience: 18,
    rating: 4.9,
    reviewCount: 112,
    pricePerHour: 200,
    videoCallRate: 180,
    inPersonRate: 250,
    asyncFeedbackRate: 100,
    certifications: JSON.stringify(["Cricket Australia Level 3", "High Performance Coaching", "Video Analysis Expert"]),
    socialLinks: JSON.stringify({
      linkedin: "https://linkedin.com/in/michaeljohnson",
      youtube: "https://youtube.com/c/michaeljohnsoncoach"
    }),
    timezone: "Australia/Sydney",
    availability: JSON.stringify({
      monday: { start: "06:00", end: "15:00" },
      tuesday: { start: "06:00", end: "15:00" },
      wednesday: { start: "06:00", end: "15:00" },
      thursday: { start: "06:00", end: "15:00" },
      friday: { start: "06:00", end: "15:00" },
      saturday: { start: "08:00", end: "14:00" }
    })
  },
  {
    name: "Aisha Khan",
    email: "aisha.khan@peakplay.com",
    bio: "Former wicket-keeper batsman with expertise in keeping techniques and lower-order batting. Passionate about developing complete cricketers.",
    specialties: JSON.stringify(["Wicket Keeping", "Lower Order Batting", "Fitness Training", "Mental Toughness"]),
    sport: "CRICKET",
    location: "Karachi, Pakistan",
    experience: 10,
    rating: 4.7,
    reviewCount: 45,
    pricePerHour: 110,
    videoCallRate: 90,
    inPersonRate: 150,
    asyncFeedbackRate: 60,
    certifications: JSON.stringify(["PCB Coaching License", "Wicket Keeping Specialist", "Fitness Instructor"]),
    socialLinks: JSON.stringify({
      linkedin: "https://linkedin.com/in/aishakhan",
      facebook: "https://facebook.com/aisha.cricket.coach"
    }),
    timezone: "Asia/Karachi",
    availability: JSON.stringify({
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "14:00", end: "18:00" },
      saturday: { start: "10:00", end: "16:00" },
      sunday: { start: "10:00", end: "16:00" }
    })
  },
  {
    name: "James Anderson",
    email: "james.anderson@peakplay.com",
    bio: "Swing bowling specialist with county cricket experience. Expert in seam bowling, swing techniques, and bowling in different conditions.",
    specialties: JSON.stringify(["Swing Bowling", "Seam Bowling", "Bowling Conditions", "Technical Analysis"]),
    sport: "CRICKET",
    location: "Manchester, UK",
    experience: 14,
    rating: 4.8,
    reviewCount: 78,
    pricePerHour: 160,
    videoCallRate: 140,
    inPersonRate: 220,
    asyncFeedbackRate: 85,
    certifications: JSON.stringify(["ECB Level 3 Coaching", "Bowling Biomechanics", "County Cricket Experience"]),
    socialLinks: JSON.stringify({
      linkedin: "https://linkedin.com/in/jamesanderson",
      twitter: "https://twitter.com/james_bowling_coach"
    }),
    timezone: "Europe/London",
    availability: JSON.stringify({
      monday: { start: "08:00", end: "17:00" },
      tuesday: { start: "08:00", end: "17:00" },
      wednesday: { start: "08:00", end: "17:00" },
      thursday: { start: "08:00", end: "17:00" },
      friday: { start: "08:00", end: "17:00" },
      saturday: { start: "09:00", end: "15:00" }
    })
  }
];

async function seedMarketplace() {
  try {
    console.log('🌱 Starting marketplace seeding...');

    // Clear existing specialized coaches
    await prisma.specializedCoach.deleteMany({});
    console.log('🗑️ Cleared existing specialized coaches');

    // Create new coaches
    for (const coach of sampleCoaches) {
      const created = await prisma.specializedCoach.create({
        data: coach
      });
      console.log(`✅ Created coach: ${created.name}`);
    }

    console.log('🎉 Marketplace seeding completed successfully!');
    console.log(`📊 Created ${sampleCoaches.length} specialized coaches`);

  } catch (error) {
    console.error('❌ Error seeding marketplace:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedMarketplace(); 