const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete Davido World Tour topic
    const deleted = await prisma.afriPulseTopic.deleteMany({
      where: { topic: 'Davido World Tour' }
    });
    console.log(`Deleted ${deleted.count} "Davido World Tour" topic(s)`);

    // Add/Update Tems Billboard Record topic
    const temsTopic = await prisma.afriPulseTopic.upsert({
      where: { topic: 'Tems Billboard Record' },
      update: {
        category: 'Entertainment',
        sentimentScore: 95,
        trend: 'RISING',
        mentions: 15800,
        engagement: 520000,
        summary: 'Tems becomes first African female artist to chart 7 songs on Billboard Hot 100',
        relatedArticles: ['tems-first-african-female-artist-seven-billboard-hot-100-songs-2026'],
        isActive: true,
      },
      create: {
        topic: 'Tems Billboard Record',
        category: 'Entertainment',
        sentimentScore: 95,
        trend: 'RISING',
        mentions: 15800,
        engagement: 520000,
        summary: 'Tems becomes first African female artist to chart 7 songs on Billboard Hot 100',
        relatedArticles: ['tems-first-african-female-artist-seven-billboard-hot-100-songs-2026'],
        isActive: true,
      }
    });
    console.log(`Created/Updated topic: ${temsTopic.topic}`);

    // List all current topics
    const allTopics = await prisma.afriPulseTopic.findMany({
      where: { isActive: true },
      orderBy: { mentions: 'desc' },
      select: { topic: true, category: true, mentions: true, sentimentScore: true }
    });
    
    console.log('\n=== CURRENT ACTIVE TOPICS ===');
    allTopics.forEach((t, i) => {
      console.log(`${i + 1}. ${t.topic} (${t.category}) - ${t.mentions} mentions - Score: ${t.sentimentScore}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
