# Sanity CMS Setup Guide for AfriVerse

This guide walks you through setting up Sanity CMS for content management in AfriVerse.

## Table of Contents

1. [Overview](#overview)
2. [Create Sanity Project](#create-sanity-project)
3. [Configure Environment](#configure-environment)
4. [Access Sanity Studio](#access-sanity-studio)
5. [Migrate Existing Content](#migrate-existing-content)
6. [Content Management](#content-management)
7. [Switching Data Sources](#switching-data-sources)

---

## Overview

AfriVerse uses Sanity as a headless CMS for managing articles, authors, categories, and site settings. The integration includes:

- **Sanity Studio**: Embedded at `/studio` for content editing
- **GROQ Queries**: Fast, flexible data fetching
- **Image Optimization**: Automatic via Sanity's CDN
- **Real-time Preview**: Draft content preview support
- **Type Safety**: Full TypeScript support

### File Structure

```
├── sanity/
│   └── schemas/
│       ├── index.ts          # Schema exports
│       ├── article.ts        # Article document schema
│       ├── author.ts         # Author document schema
│       ├── category.ts       # Category document schema
│       ├── tag.ts            # Tag document schema
│       ├── blockContent.ts   # Rich text editor config
│       └── siteSettings.ts   # Global settings
├── sanity.config.ts          # Sanity Studio configuration
├── sanity.cli.ts             # Sanity CLI configuration
├── src/
│   ├── app/studio/           # Embedded Sanity Studio route
│   ├── lib/
│   │   ├── sanity.ts         # Sanity client setup
│   │   └── sanity-queries.ts # GROQ query functions
│   ├── components/
│   │   └── PortableText.tsx  # Rich text renderer
│   └── types/
│       └── sanity.ts         # TypeScript types
```

---

## Create Sanity Project

### Step 1: Create Account

1. Go to [sanity.io/manage](https://www.sanity.io/manage)
2. Sign up or log in
3. Click **"Create Project"**

### Step 2: Project Setup

1. Name your project: `AfriVerse`
2. Select dataset: `production` (default)
3. Choose your plan (Free tier is sufficient to start)

### Step 3: Get Credentials

From your project dashboard, note:

- **Project ID**: Found in project settings (e.g., `abc123xyz`)
- **Dataset**: Usually `production`

### Step 4: Create API Token

1. Go to **API** tab in project settings
2. Click **Add API Token**
3. Name: `AfriVerse Write Token`
4. Permissions: **Editor** (for read/write access)
5. Save the token securely

---

## Configure Environment

### Step 1: Update .env

Add these variables to your `.env` file:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_API_TOKEN="your-api-token"
```

### Step 2: Add CORS Origins

In Sanity dashboard:

1. Go to **API** → **CORS origins**
2. Add your development URL: `http://localhost:3000`
3. Add your production URL: `https://afriverse.africa`
4. Enable **Allow credentials** for both

---

## Access Sanity Studio

### Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open Sanity Studio:
   ```
   http://localhost:3000/studio
   ```

3. Log in with your Sanity account

### Production

After deploying, access at:
```
https://your-domain.com/studio
```

---

## Migrate Existing Content

If you have existing markdown articles, migrate them to Sanity:

### Run Migration Script

```bash
npm run sanity:migrate
```

This will:
- Create authors from your existing author data
- Create categories matching your current structure
- Import all markdown articles as Sanity documents
- Generate tags from article metadata

### Post-Migration Tasks

1. **Upload Images**: Article images need to be uploaded manually in Studio
2. **Review Content**: Check imported articles for formatting
3. **Publish**: Imported articles are created as drafts

---

## Content Management

### Creating Articles

1. Go to `/studio`
2. Click **Articles** → **All Articles**
3. Click **+ Create new**
4. Fill in:
   - **Title**: Article headline
   - **Slug**: URL-friendly identifier (auto-generated)
   - **Excerpt**: Brief summary (for cards)
   - **Main Image**: Featured image
   - **Body**: Rich text content
   - **Author**: Select from authors
   - **Category**: Select category
   - **Tags**: Add relevant tags
   - **Published At**: Publication date
   - **Featured/Trending**: Highlight flags

### Managing Authors

1. Go to **Authors**
2. Add name, bio, role, avatar
3. Link social profiles
4. Mark as "Featured" for Storytellers page

### Managing Categories

1. Go to **Categories**
2. Set name, slug, description
3. Choose color (hex) and icon (emoji)
4. Set display order

### Site Settings

1. Go to **Site Settings**
2. Configure:
   - Site title and description
   - Logo and favicon
   - Social media links
   - Newsletter settings
   - Footer content

---

## Switching Data Sources

AfriVerse supports both markdown files and Sanity. Here's how to switch:

### Option 1: Sanity Only (Recommended)

Update your data fetching to use Sanity queries:

```typescript
// Before (markdown)
import { getArticles } from '@/data/articles';

// After (Sanity)
import { getArticles } from '@/lib/sanity-queries';
```

### Option 2: Hybrid Mode

Use Sanity with markdown fallback:

```typescript
import { getArticles as getSanityArticles } from '@/lib/sanity-queries';
import { getArticles as getMarkdownArticles } from '@/data/articles';
import { isSanityConfigured } from '@/lib/sanity';

export async function getArticles() {
  if (isSanityConfigured()) {
    return getSanityArticles();
  }
  return getMarkdownArticles();
}
```

### Example: Update Category Page

```typescript
// src/app/[category]/page.tsx

// Old import
// import { getArticlesByCategory } from '@/data/articles';
// import { getCategoryBySlug } from '@/data/categories';

// New imports
import { 
  getArticlesByCategory, 
  getCategoryBySlug 
} from '@/lib/sanity-queries';
```

---

## GROQ Query Examples

### Get Latest Articles

```typescript
const articles = await sanityClient.fetch(`
  *[_type == "article"] | order(publishedAt desc) [0...10] {
    title,
    "slug": slug.current,
    excerpt,
    mainImage,
    publishedAt,
    "author": author->name,
    "category": category->name
  }
`);
```

### Get Single Article

```typescript
const article = await sanityClient.fetch(`
  *[_type == "article" && slug.current == $slug][0] {
    title,
    body,
    mainImage,
    "author": author->{name, bio, avatar},
    "category": category->{name, slug, color}
  }
`, { slug: 'article-slug' });
```

### Search Articles

```typescript
const results = await sanityClient.fetch(`
  *[_type == "article" && (
    title match $query + "*" ||
    excerpt match $query + "*"
  )] | order(publishedAt desc) [0...20]
`, { query: 'search term' });
```

---

## Troubleshooting

### Studio Not Loading

1. Check environment variables are set
2. Verify CORS origins in Sanity dashboard
3. Clear browser cache

### API Errors

1. Verify API token has correct permissions
2. Check project ID matches
3. Ensure dataset name is correct

### Images Not Displaying

1. Verify `cdn.sanity.io` is in Next.js image domains
2. Check image asset reference is valid
3. Use `urlFor()` helper for image URLs

### Build Errors

If TypeScript errors occur:

```bash
# Regenerate types
npx sanity schema extract
```

---

## Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Reference](https://www.sanity.io/docs/groq)
- [next-sanity Package](https://github.com/sanity-io/next-sanity)
- [Portable Text](https://portabletext.org/)

---

## Support

For issues specific to AfriVerse's Sanity integration, check:
- [API Documentation](./API-DOCUMENTATION.md)
- [GitHub Issues](https://github.com/your-repo/issues)
