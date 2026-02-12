const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.post.count();
    console.log('=== ARTICLE COUNT ===');
    console.log('Total Posts in Database:', count);
    
    // Get posts by status
    const published = await prisma.post.count({ where: { status: 'PUBLISHED' } });
    const draft = await prisma.post.count({ where: { status: 'DRAFT' } });
    
    console.log('\n=== BY STATUS ===');
    console.log('Published:', published);
    console.log('Draft:', draft);
    
    // Get by category
    const byCategory = await prisma.post.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    
    console.log('\n=== BY CATEGORY ===');
    byCategory.forEach(cat => {
      console.log(`${cat.category}: ${cat._count.id}`);
    });
    
    // List ALL posts
    const allPosts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: { title: true, status: true, category: true, createdAt: true }
    });
    
    console.log('\n=== ALL POSTS ===');
    allPosts.forEach((post, i) => {
      const date = new Date(post.createdAt).toLocaleDateString();
      console.log(`${i + 1}. [${post.status}] ${post.title} (${post.category}) - ${date}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
