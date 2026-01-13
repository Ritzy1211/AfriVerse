import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MongoDB database...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'john.paulson@afriverse.africa' },
  });

  if (!existingAdmin) {
    // Create the first super admin
    const hashedPassword = await bcrypt.hash('AfriVerse2025!', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'john.paulson@afriverse.africa',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        bio: 'AfriVerse platform administrator',
      },
    });

    console.log('✓ Created super admin:', admin.email);
    console.log('');
    console.log('='.repeat(50));
    console.log('🔐 Admin Login Credentials:');
    console.log('   Email: john.paulson@afriverse.africa');
    console.log('   Password: AfriVerse2025!');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('='.repeat(50));
  } else {
    console.log('✓ Admin user already exists');
  }

  // Seed AfriPulse Index data
  console.log('\n📊 Seeding AfriPulse Index data...');
  await seedAfriPulseIndex();

  // Seed AfriPulse Topics
  console.log('\n📈 Seeding AfriPulse Topics...');
  await seedAfriPulseTopics();

  // Seed Sample Storyteller
  console.log('\n✍️ Seeding sample storyteller...');
  await seedSampleStoryteller();

  console.log('\n✅ Seeding complete!');
}

async function seedAfriPulseIndex() {
  const countries = [
    {
      country: 'NG',
      countryName: 'Nigeria',
      flagEmoji: '🇳🇬',
      economyScore: 58,
      politicsScore: 42,
      socialScore: 65,
      techScore: 78,
      economyTrend: 'RISING' as const,
      politicsTrend: 'STABLE' as const,
      socialTrend: 'RISING' as const,
      techTrend: 'RISING' as const,
      overallScore: 61,
      overallTrend: 'RISING' as const,
      topStory: 'Tech Startups Raise $500M in Q4 2024',
      topStoryUrl: '/technology/nigerian-tech-startups-500m-2024',
      keyIndicators: ['Naira stabilizing', 'Tech sector booming', 'Youth employment initiatives'],
      dataPoints: 127,
    },
    {
      country: 'KE',
      countryName: 'Kenya',
      flagEmoji: '🇰🇪',
      economyScore: 62,
      politicsScore: 55,
      socialScore: 68,
      techScore: 82,
      economyTrend: 'RISING' as const,
      politicsTrend: 'RISING' as const,
      socialTrend: 'STABLE' as const,
      techTrend: 'RISING' as const,
      overallScore: 67,
      overallTrend: 'RISING' as const,
      topStory: 'M-Pesa Expansion Drives Financial Inclusion',
      keyIndicators: ['M-Pesa growth', 'Silicon Savannah thriving', 'Regional hub status'],
      dataPoints: 98,
    },
    {
      country: 'ZA',
      countryName: 'South Africa',
      flagEmoji: '🇿🇦',
      economyScore: 45,
      politicsScore: 38,
      socialScore: 52,
      techScore: 65,
      economyTrend: 'STABLE' as const,
      politicsTrend: 'FALLING' as const,
      socialTrend: 'STABLE' as const,
      techTrend: 'RISING' as const,
      overallScore: 50,
      overallTrend: 'STABLE' as const,
      topStory: 'Load Shedding Solutions Making Progress',
      keyIndicators: ['Power crisis improving', 'Mining exports stable', 'Political uncertainty'],
      dataPoints: 156,
    },
    {
      country: 'GH',
      countryName: 'Ghana',
      flagEmoji: '🇬🇭',
      economyScore: 52,
      politicsScore: 60,
      socialScore: 63,
      techScore: 71,
      economyTrend: 'RISING' as const,
      politicsTrend: 'STABLE' as const,
      socialTrend: 'RISING' as const,
      techTrend: 'RISING' as const,
      overallScore: 62,
      overallTrend: 'RISING' as const,
      topStory: 'Ghana Business Forum 2026 Announced',
      topStoryUrl: '/business/ghanas-busines-forum-2026',
      keyIndicators: ['IMF deal progress', 'Cocoa exports strong', 'Digital economy growth'],
      dataPoints: 84,
    },
    {
      country: 'EG',
      countryName: 'Egypt',
      flagEmoji: '🇪🇬',
      economyScore: 48,
      politicsScore: 45,
      socialScore: 55,
      techScore: 68,
      economyTrend: 'STABLE' as const,
      politicsTrend: 'STABLE' as const,
      socialTrend: 'RISING' as const,
      techTrend: 'RISING' as const,
      overallScore: 54,
      overallTrend: 'STABLE' as const,
      topStory: 'Egypt Business Minds 2026 Summit',
      topStoryUrl: '/business/egypts-business-minds-2026',
      keyIndicators: ['Suez Canal revenue', 'Tourism recovery', 'Infrastructure projects'],
      dataPoints: 112,
    },
    {
      country: 'RW',
      countryName: 'Rwanda',
      flagEmoji: '🇷🇼',
      economyScore: 72,
      politicsScore: 70,
      socialScore: 75,
      techScore: 80,
      economyTrend: 'RISING' as const,
      politicsTrend: 'STABLE' as const,
      socialTrend: 'RISING' as const,
      techTrend: 'RISING' as const,
      overallScore: 74,
      overallTrend: 'RISING' as const,
      topStory: 'Kigali Tech Hub Attracts Global Investors',
      keyIndicators: ['Cleanest city award', 'Tech hub status', 'Tourism boom'],
      dataPoints: 67,
    },
  ];

  for (const country of countries) {
    await prisma.afriPulseIndex.upsert({
      where: { country: country.country },
      update: country,
      create: country,
    });
  }
  console.log(`  ✓ Seeded ${countries.length} country indices`);
}

async function seedAfriPulseTopics() {
  const topics = [
    {
      topic: 'AFCON 2025',
      category: 'Sports',
      sentimentScore: 85,
      trend: 'RISING' as const,
      mentions: 4520,
      engagement: 125000,
      summary: 'High excitement as Nigeria Super Eagles advance to finals with tactical play',
      relatedArticles: ['super-eagles-afcon-2025-finidi-tactics'],
      isActive: true,
    },
    {
      topic: 'African Tech Funding',
      category: 'Technology',
      sentimentScore: 78,
      trend: 'RISING' as const,
      mentions: 2340,
      engagement: 45000,
      summary: 'Record funding rounds despite global slowdown, fintech leads sectors',
      relatedArticles: ['nigerian-tech-startups-500m-2024'],
      isActive: true,
    },
    {
      topic: 'Naira Exchange Rate',
      category: 'Economy',
      sentimentScore: 45,
      trend: 'STABLE' as const,
      mentions: 8900,
      engagement: 230000,
      summary: 'Currency showing signs of stabilization after reforms',
      relatedArticles: [],
      isActive: true,
    },
    {
      topic: 'Lagos Fashion Week',
      category: 'Culture',
      sentimentScore: 88,
      trend: 'RISING' as const,
      mentions: 3200,
      engagement: 89000,
      summary: 'African designers gain global recognition, sustainable fashion highlighted',
      relatedArticles: ['lagos-fashion-week-2024-recap'],
      isActive: true,
    },
    {
      topic: 'Tax Reform Debates',
      category: 'Politics',
      sentimentScore: 52,
      trend: 'VOLATILE' as const,
      mentions: 5600,
      engagement: 156000,
      summary: 'Mixed reactions to proposed tax reforms, regional tensions noted',
      relatedArticles: ['nigeria-2024-tax-reforms-opinion'],
      isActive: true,
    },
    {
      topic: 'AI in Africa',
      category: 'Technology',
      sentimentScore: 72,
      trend: 'RISING' as const,
      mentions: 1890,
      engagement: 34000,
      summary: 'Growing adoption of AI tools, concerns about job displacement balanced by opportunities',
      relatedArticles: [],
      isActive: true,
    },
    {
      topic: 'Davido World Tour',
      category: 'Entertainment',
      sentimentScore: 92,
      trend: 'RISING' as const,
      mentions: 12400,
      engagement: 456000,
      summary: 'Afrobeats superstar announces massive world tour, tickets selling fast',
      relatedArticles: ['davido-world-tour-2025'],
      isActive: true,
    },
    {
      topic: 'Climate Action Africa',
      category: 'Environment',
      sentimentScore: 58,
      trend: 'STABLE' as const,
      mentions: 980,
      engagement: 18000,
      summary: 'Growing awareness but calls for more urgent action from governments',
      relatedArticles: [],
      isActive: true,
    },
  ];

  for (const topic of topics) {
    await prisma.afriPulseTopic.upsert({
      where: { topic: topic.topic },
      update: topic,
      create: topic,
    });
  }
  console.log(`  ✓ Seeded ${topics.length} trending topics`);
}

async function seedSampleStoryteller() {
  // First, create a sample writer user
  const existingWriter = await prisma.user.findUnique({
    where: { email: 'amara.writer@afriverse.africa' },
  });

  let writerUser;
  
  if (!existingWriter) {
    const hashedPassword = await bcrypt.hash('Writer2025!', 12);
    writerUser = await prisma.user.create({
      data: {
        email: 'amara.writer@afriverse.africa',
        name: 'Amara Okonkwo',
        password: hashedPassword,
        role: 'SENIOR_WRITER',
        bio: 'Award-winning journalist covering technology and innovation across Africa. Former BBC Africa correspondent.',
        image: '/assets/images/authors/amara.jpg',
        twitter: 'https://twitter.com/amarawrites',
        linkedin: 'https://linkedin.com/in/amaraokonkwo',
      },
    });
    console.log('  ✓ Created sample writer user:', writerUser.email);
  } else {
    writerUser = existingWriter;
    console.log('  ✓ Sample writer already exists');
  }

  // Check if storyteller profile exists
  const existingStoryteller = await prisma.verifiedStoryteller.findUnique({
    where: { userId: writerUser.id },
  });

  if (!existingStoryteller) {
    await prisma.verifiedStoryteller.create({
      data: {
        userId: writerUser.id,
        status: 'FEATURED',
        verifiedAt: new Date(),
        verifiedBy: 'john.paulson@afriverse.africa',
        displayName: 'Amara Okonkwo',
        bio: 'Award-winning journalist covering technology and innovation across Africa. Former BBC Africa correspondent with 10+ years experience.',
        expertise: ['Technology & Innovation', 'Business & Economy', 'Social Issues'],
        languages: ['English', 'Igbo', 'French'],
        country: 'Nigeria',
        region: 'South East',
        city: 'Lagos',
        isLocalReporter: true,
        isDiaspora: false,
        credentials: ['MA Journalism - Columbia University', 'Press Card Nigeria', 'Reuters Fellow'],
        portfolioLinks: ['https://medium.com/@amarawrites', 'https://bbc.com/africa'],
        socialProof: {
          twitter: { verified: true, followers: 45000 },
          linkedin: { verified: true },
        },
        trustScore: 92,
        articlesCount: 127,
        verifiedImpacts: 8,
        communityRating: 4.8,
        totalRatings: 234,
        badgeLevel: 'PLATINUM',
        contactEmail: 'amara.writer@afriverse.africa',
      },
    });
    console.log('  ✓ Created verified storyteller profile');
  } else {
    console.log('  ✓ Storyteller profile already exists');
  }

  // Create another sample writer
  const existingWriter2 = await prisma.user.findUnique({
    where: { email: 'kwame.reporter@afriverse.africa' },
  });

  let writerUser2;
  
  if (!existingWriter2) {
    const hashedPassword = await bcrypt.hash('Writer2025!', 12);
    writerUser2 = await prisma.user.create({
      data: {
        email: 'kwame.reporter@afriverse.africa',
        name: 'Kwame Asante',
        password: hashedPassword,
        role: 'AUTHOR',
        bio: 'Sports journalist and analyst specializing in African football. Based in Accra.',
        image: '/assets/images/authors/kwame.jpg',
        twitter: 'https://twitter.com/kwamesports',
      },
    });
    console.log('  ✓ Created second sample writer:', writerUser2.email);
  } else {
    writerUser2 = existingWriter2;
    console.log('  ✓ Second sample writer already exists');
  }

  // Check if second storyteller profile exists
  const existingStoryteller2 = await prisma.verifiedStoryteller.findUnique({
    where: { userId: writerUser2.id },
  });

  if (!existingStoryteller2) {
    await prisma.verifiedStoryteller.create({
      data: {
        userId: writerUser2.id,
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: 'john.paulson@afriverse.africa',
        displayName: 'Kwame Asante',
        bio: 'Sports journalist and analyst specializing in African football. Covered 3 AFCON tournaments.',
        expertise: ['Sports', 'Culture & Entertainment'],
        languages: ['English', 'Twi'],
        country: 'Ghana',
        region: 'Greater Accra',
        city: 'Accra',
        isLocalReporter: true,
        isDiaspora: false,
        credentials: ['BSc Mass Communication - University of Ghana', 'FIFA Media Accreditation'],
        portfolioLinks: ['https://sportswriters.gh/kwame'],
        trustScore: 78,
        articlesCount: 45,
        verifiedImpacts: 2,
        communityRating: 4.5,
        totalRatings: 89,
        badgeLevel: 'SILVER',
        contactEmail: 'kwame.reporter@afriverse.africa',
      },
    });
    console.log('  ✓ Created second verified storyteller profile');
  } else {
    console.log('  ✓ Second storyteller profile already exists');
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
