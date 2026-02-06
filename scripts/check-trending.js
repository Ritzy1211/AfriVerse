const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const topics = await prisma.trendingTopic.findMany({
    orderBy: { order: 'asc' }
  });
  
  console.log(`Current trending topics: ${topics.length}\n`);
  topics.forEach(t => {
    console.log(`- ${t.title.substring(0, 60)}...`);
    console.log(`  URL: ${t.url}`);
    console.log(`  Active: ${t.isActive}, Order: ${t.order}`);
    console.log('');
  });
}

main().finally(() => prisma.$disconnect());
