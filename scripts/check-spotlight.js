const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const spotlights = await prisma.spotlight.findMany();
  
  console.log('\n=== SPOTLIGHT DATA ===');
  spotlights.forEach((s) => {
    console.log('ID:', s.id);
    console.log('Title:', s.title);
    console.log('Quote:', JSON.stringify(s.quote));
    console.log('QuoteHighlight:', JSON.stringify(s.quoteHighlight));
    console.log('MediaUrl:', s.mediaUrl);
    console.log('RelatedArticles:', s.relatedArticles);
    console.log('---');
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
