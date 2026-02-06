const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all trending topics...');
  
  // Delete all existing trending topics
  const deleted = await prisma.trendingTopic.deleteMany({});
  console.log(`Deleted ${deleted.count} trending topics`);
  
  // Get available published articles
  const posts = await prisma.post.findMany({
    where: {
      status: {
        in: ['PUBLISHED', 'APPROVED']
      }
    },
    orderBy: [
      { featured: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      featured: true
    }
  });
  
  console.log(`\nFound ${posts.length} published articles:`);
  posts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title}`);
    console.log(`   Category: ${p.category}, Slug: ${p.slug}`);
  });
  
  if (posts.length === 0) {
    console.log('\nNo published articles found to add to trending.');
    return;
  }
  
  // Add articles as trending topics
  console.log('\nAdding articles to trending...');
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const topic = await prisma.trendingTopic.create({
      data: {
        title: post.title,
        url: `/${post.category.toLowerCase()}/${post.slug}`,
        category: post.category.charAt(0) + post.category.slice(1).toLowerCase(),
        upiScore: post.featured ? 95 : 85 - (i * 5),
        trend: 'UP',
        isActive: true,
        order: i + 1
      }
    });
    console.log(`✓ Added: ${topic.title}`);
  }
  
  console.log('\n✅ Done! Trending ticker updated with your articles.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
