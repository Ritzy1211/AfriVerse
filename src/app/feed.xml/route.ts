import { getAllArticles } from '@/data/articles';

const BASE_URL = 'https://afriverse.africa';

export async function GET() {
  const articles = await getAllArticles();
  
  const rssItems = articles.map((article) => {
    // Ensure publishedAt is a proper Date object
    const pubDate = article.publishedAt instanceof Date 
      ? article.publishedAt 
      : new Date(article.publishedAt);
    
    return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${BASE_URL}/${article.category.slug}/${article.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/${article.category.slug}/${article.slug}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <author>${article.author.name}</author>
      <category>${article.category.name}</category>
      ${article.featuredImage ? `<enclosure url="${article.featuredImage}" type="image/jpeg"/>` : ''}
    </item>`;
  }).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>AfriVerse - Where Stories Connect</title>
    <link>${BASE_URL}</link>
    <description>Your trusted source for news, culture, tech, business, and everything that matters across Africa. Premium content without the noise.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/assets/logos/Afriverse-logo.png</url>
      <title>AfriVerse</title>
      <link>${BASE_URL}</link>
    </image>
    <copyright>© ${new Date().getFullYear()} AfriVerse. All rights reserved.</copyright>
    <managingEditor>tips@afriverse.africa (AfriVerse)</managingEditor>
    <webMaster>tips@afriverse.africa (AfriVerse)</webMaster>
    <ttl>60</ttl>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
