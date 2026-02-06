const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Fetch published posts
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, featuredImage: true, category: true },
    take: 10
  });
  
  console.log('\n=== PUBLISHED POSTS ===');
  posts.forEach((p, i) => console.log(`${i + 1}. [${p.slug}] ${p.title} - Image: ${p.featuredImage ? 'YES' : 'NO'}`));
  
  // Fetch spotlights
  let spotlights = await prisma.spotlight.findMany();
  
  console.log('\n=== SPOTLIGHTS ===');
  if (spotlights.length === 0) {
    console.log('No spotlights found.');
  } else {
    spotlights.forEach((s, i) => {
      console.log(`${i + 1}. [${s.id}] ${s.title}`);
      console.log(`   Media URL: ${s.mediaUrl}`);
      console.log(`   Related: ${s.relatedArticles?.length || 0}`);
      console.log(`   Active: ${s.isActive}`);
      console.log(`   Placement: ${s.placement}`);
    });
    
    // Update the spotlight with a valid image from one of the posts
    const spotlight = spotlights[0];
    const postWithImage = posts.find(p => p.featuredImage);
    
    if (postWithImage && postWithImage.featuredImage) {
      console.log('\n=== UPDATING SPOTLIGHT IMAGE ===');
      console.log(`Using image from: ${postWithImage.title}`);
      
      const updated = await prisma.spotlight.update({
        where: { id: spotlight.id },
        data: { 
          mediaUrl: postWithImage.featuredImage,
          relatedArticles: posts.slice(0, 4).map(p => p.slug)
        }
      });
      
      console.log('\n✅ Spotlight updated!');
      console.log(`New mediaUrl: ${updated.mediaUrl}`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
