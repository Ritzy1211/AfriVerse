/**
 * Migration script: Markdown Articles → Sanity CMS
 * 
 * This script migrates existing markdown articles from the content/ folder
 * to Sanity CMS, including authors, categories, and tags.
 * 
 * Usage:
 *   1. Set up your Sanity project and get credentials
 *   2. Add SANITY_API_TOKEN to .env (with write permissions)
 *   3. Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/migrate-to-sanity.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables from both .env and .env.local
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Required for write operations
});

// Content directory
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');

// Color palette for categories
const CATEGORY_COLORS: Record<string, { color: string; icon: string }> = {
  technology: { color: '#00D9FF', icon: '💻' },
  tech: { color: '#00D9FF', icon: '💻' },
  business: { color: '#27AE60', icon: '💼' },
  entertainment: { color: '#F39C12', icon: '🎭' },
  culture: { color: '#F39C12', icon: '🎭' },
  sports: { color: '#E74C3C', icon: '⚽' },
  politics: { color: '#9B59B6', icon: '🏛️' },
  lifestyle: { color: '#E91E63', icon: '✨' },
};

// Author data (matching your existing authors)
const AUTHORS_DATA: Record<string, {
  bio: string;
  role: string;
  socialLinks?: { twitter?: string };
}> = {
  'Amara Okonkwo': {
    bio: 'Entertainment and culture journalist covering African music and arts',
    role: 'Entertainment Editor',
    socialLinks: { twitter: 'https://twitter.com/amaraokonkwo' },
  },
  'Emeka Nwankwo': {
    bio: 'Business and technology analyst specializing in African startups',
    role: 'Business Editor',
    socialLinks: { twitter: 'https://twitter.com/emekanwankwo' },
  },
  'Zainab Bello': {
    bio: 'Fashion and lifestyle writer covering African design and culture',
    role: 'Lifestyle Editor',
    socialLinks: { twitter: 'https://twitter.com/zainabbello' },
  },
  'Chidi Okafor': {
    bio: 'Sports journalist covering African football and athletics',
    role: 'Sports Editor',
    socialLinks: { twitter: 'https://twitter.com/chidiokafor' },
  },
  'Tunde Fashola': {
    bio: 'Technology reviewer and gadget enthusiast',
    role: 'Tech Writer',
    socialLinks: { twitter: 'https://twitter.com/tundefashola' },
  },
  'Dr. Funke Adeyemi': {
    bio: 'Economist and policy analyst',
    role: 'Opinion Contributor',
    socialLinks: { twitter: 'https://twitter.com/drfunkeadeyemi' },
  },
};

// Generate slug from string
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Convert markdown content to Portable Text blocks (simplified)
function markdownToPortableText(markdown: string): any[] {
  const blocks: any[] = [];
  const lines = markdown.split('\n');
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        blocks.push({
          _type: 'block',
          _key: `block-${blocks.length}`,
          style: 'normal',
          markDefs: [],
          children: [
            {
              _type: 'span',
              _key: `span-${blocks.length}`,
              text: text,
              marks: [],
            },
          ],
        });
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      flushParagraph();
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: 'h3',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: `span-${blocks.length}`,
            text: line.replace('### ', ''),
            marks: [],
          },
        ],
      });
    } else if (line.startsWith('## ')) {
      flushParagraph();
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: 'h2',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: `span-${blocks.length}`,
            text: line.replace('## ', ''),
            marks: [],
          },
        ],
      });
    } else if (line.startsWith('> ')) {
      flushParagraph();
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: 'blockquote',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: `span-${blocks.length}`,
            text: line.replace('> ', ''),
            marks: [],
          },
        ],
      });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph();
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: `span-${blocks.length}`,
            text: line.replace(/^[-*]\s/, ''),
            marks: [],
          },
        ],
      });
    } else if (/^\d+\.\s/.test(line)) {
      flushParagraph();
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: 'normal',
        listItem: 'number',
        level: 1,
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: `span-${blocks.length}`,
            text: line.replace(/^\d+\.\s/, ''),
            marks: [],
          },
        ],
      });
    } else if (!line.startsWith('|') && !line.startsWith('---')) {
      // Regular paragraph content (skip tables for now)
      currentParagraph.push(line);
    }
  }

  flushParagraph();
  return blocks;
}

// Create or get author
async function getOrCreateAuthor(name: string): Promise<string> {
  const slug = generateSlug(name);
  
  // Check if author exists
  const existing = await client.fetch(
    `*[_type == "author" && slug.current == $slug][0]._id`,
    { slug }
  );
  
  if (existing) {
    console.log(`  ✓ Author exists: ${name}`);
    return existing;
  }
  
  // Create new author
  const authorData = AUTHORS_DATA[name] || {
    bio: 'AfriVerse contributor',
    role: 'Staff Writer',
  };
  
  const result = await client.create({
    _type: 'author',
    name,
    slug: { _type: 'slug', current: slug },
    bio: authorData.bio,
    role: authorData.role,
    socialLinks: authorData.socialLinks,
    featured: false,
  });
  
  console.log(`  ✓ Created author: ${name}`);
  return result._id;
}

// Create or get category
async function getOrCreateCategory(slug: string): Promise<string> {
  // Check if category exists
  const existing = await client.fetch(
    `*[_type == "category" && slug.current == $slug][0]._id`,
    { slug }
  );
  
  if (existing) {
    console.log(`  ✓ Category exists: ${slug}`);
    return existing;
  }
  
  // Create new category
  const categoryConfig = CATEGORY_COLORS[slug] || { color: '#6B7280', icon: '📄' };
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  const result = await client.create({
    _type: 'category',
    name,
    slug: { _type: 'slug', current: slug },
    description: `${name} news and articles`,
    color: categoryConfig.color,
    icon: categoryConfig.icon,
    order: Object.keys(CATEGORY_COLORS).indexOf(slug) + 1,
  });
  
  console.log(`  ✓ Created category: ${name}`);
  return result._id;
}

// Create or get tag
async function getOrCreateTag(name: string): Promise<string> {
  const slug = generateSlug(name);
  
  // Check if tag exists
  const existing = await client.fetch(
    `*[_type == "tag" && slug.current == $slug][0]._id`,
    { slug }
  );
  
  if (existing) {
    return existing;
  }
  
  // Create new tag
  const result = await client.create({
    _type: 'tag',
    name,
    slug: { _type: 'slug', current: slug },
  });
  
  console.log(`  ✓ Created tag: ${name}`);
  return result._id;
}

// Read all markdown files
function getMarkdownFiles(): { category: string; filename: string; filepath: string }[] {
  const files: { category: string; filename: string; filepath: string }[] = [];
  
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('Content directory not found:', CONTENT_DIR);
    return files;
  }
  
  const categories = fs.readdirSync(CONTENT_DIR);
  
  for (const category of categories) {
    const categoryPath = path.join(CONTENT_DIR, category);
    
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    if (category.startsWith('_')) continue; // Skip templates
    
    const markdownFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));
    
    for (const filename of markdownFiles) {
      if (filename.startsWith('_')) continue; // Skip templates
      files.push({
        category,
        filename,
        filepath: path.join(categoryPath, filename),
      });
    }
  }
  
  return files;
}

// Migrate a single article
async function migrateArticle(
  file: { category: string; filename: string; filepath: string }
): Promise<void> {
  console.log(`\nMigrating: ${file.filename}`);
  
  // Read and parse markdown
  const content = fs.readFileSync(file.filepath, 'utf-8');
  const { data: frontmatter, content: markdownBody } = matter(content);
  
  // Generate slug from filename
  const slug = file.filename.replace('.md', '');
  
  // Check if article already exists
  const existing = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]._id`,
    { slug }
  );
  
  if (existing) {
    console.log(`  ⏭️ Article already exists: ${frontmatter.title}`);
    return;
  }
  
  // Get or create related documents
  const authorId = await getOrCreateAuthor(frontmatter.author || 'AfriVerse Staff');
  const categoryId = await getOrCreateCategory(frontmatter.category || file.category);
  
  // Process tags
  const tagIds: string[] = [];
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    for (const tag of frontmatter.tags) {
      const tagId = await getOrCreateTag(tag);
      tagIds.push(tagId);
    }
  }
  
  // Convert content to Portable Text
  const body = markdownToPortableText(markdownBody);
  
  // Calculate read time
  const wordCount = markdownBody.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200); // ~200 words per minute
  
  // Create article document
  const articleDoc = {
    _type: 'article',
    title: frontmatter.title || 'Untitled',
    slug: { _type: 'slug', current: slug },
    excerpt: frontmatter.excerpt || frontmatter.description || '',
    mainImage: frontmatter.image ? {
      _type: 'image',
      // Note: For images, you'll need to upload them to Sanity separately
      // This creates a placeholder reference
      alt: frontmatter.title,
    } : undefined,
    body,
    author: { _type: 'reference', _ref: authorId },
    category: { _type: 'reference', _ref: categoryId },
    tags: tagIds.map(id => ({ _type: 'reference', _ref: id, _key: `tag-${id}` })),
    publishedAt: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
    readTime,
    featured: frontmatter.featured || false,
    trending: frontmatter.trending || false,
  };
  
  await client.create(articleDoc);
  console.log(`  ✅ Created article: ${frontmatter.title}`);
}

// Create site settings
async function createSiteSettings(): Promise<void> {
  console.log('\nCreating site settings...');
  
  const existing = await client.fetch(`*[_type == "siteSettings"][0]._id`);
  
  if (existing) {
    console.log('  ✓ Site settings already exist');
    return;
  }
  
  await client.create({
    _type: 'siteSettings',
    _id: 'siteSettings', // Singleton
    title: 'AfriVerse',
    description: 'Your premiere source for African news, culture, and stories',
    socialLinks: {
      twitter: 'https://twitter.com/afriverse',
      instagram: 'https://www.instagram.com/afriverse_hq',
    },
    newsletter: {
      heading: 'Stay Updated',
      subheading: 'Get the latest African stories delivered to your inbox',
      enabled: true,
    },
    footer: {
      copyright: '© 2024 AfriVerse. All rights reserved.',
      tagline: 'Amplifying African Voices',
    },
  });
  
  console.log('  ✅ Created site settings');
}

// Main migration function
async function migrate(): Promise<void> {
  console.log('🚀 Starting AfriVerse → Sanity Migration\n');
  console.log('='.repeat(50));
  
  // Check configuration
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('❌ Missing Sanity configuration!');
    console.error('   Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env');
    process.exit(1);
  }
  
  console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);
  
  try {
    // Create site settings
    await createSiteSettings();
    
    // Get all markdown files
    const files = getMarkdownFiles();
    console.log(`\nFound ${files.length} markdown files to migrate`);
    
    // Migrate each article
    for (const file of files) {
      await migrateArticle(file);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('  1. Visit /studio to access Sanity Studio');
    console.log('  2. Upload images for articles (they were not migrated)');
    console.log('  3. Review and publish your content');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
