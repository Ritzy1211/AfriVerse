# AfriVerse - Content Management Guide

## How to Post New Articles

Creating content on AfriVerse is simple! Just follow these steps:

### Step 1: Create a Markdown File

Create a new `.md` file in the appropriate category folder:

```
content/
└── articles/
    ├── business/       ← Business & Finance articles
    ├── entertainment/  ← Music, Movies, Culture
    ├── lifestyle/      ← Fashion, Food, Travel
    ├── politics/       ← Government, Policy, Opinion
    ├── sports/         ← Football, Basketball, etc.
    └── technology/     ← Tech news, Reviews, Gadgets
```

### Step 2: Name Your File

Use a URL-friendly slug format:
- ✅ `nigerian-tech-startups-2024.md`
- ✅ `davido-world-tour-announcement.md`
- ❌ `Nigerian Tech Startups 2024.md` (no spaces)
- ❌ `ARTICLE.md` (use lowercase)

### Step 3: Add Frontmatter

Every article needs frontmatter at the top:

```yaml
---
title: "Your Article Title Here"
excerpt: "Brief 1-2 sentence summary for SEO and article cards."
category: "technology"
author: "Your Name"
date: "2024-12-30"
image: "https://images.unsplash.com/photo-XXXXX?w=800"
readTime: "5 min read"
tags: ["Tag1", "Tag2", "Tag3"]
featured: false
trending: false
---
```

#### Frontmatter Fields Explained:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Article headline (50-70 characters ideal) |
| `excerpt` | ✅ | Summary for cards/SEO (120-160 characters) |
| `category` | ✅ | Must match folder: `technology`, `business`, `entertainment`, `lifestyle`, `sports`, `politics` |
| `author` | ✅ | Author name (will match to author database) |
| `date` | ✅ | Publication date in `YYYY-MM-DD` format |
| `image` | ✅ | Featured image URL (use Unsplash for free images) |
| `readTime` | ⚪ | Optional - auto-calculated if not provided |
| `tags` | ⚪ | Array of keywords for related articles |
| `featured` | ⚪ | Set `true` to highlight on homepage hero |
| `trending` | ⚪ | Set `true` to show in "Trending" sections |

### Step 4: Write Your Content

Use standard Markdown syntax:

```markdown
## Main Section Heading

Your paragraph text here. Use **bold** for emphasis and *italics* for titles.

### Subsection

- Bullet point one
- Bullet point two

1. Numbered item
2. Another item

> Blockquote for important quotes

| Column 1 | Column 2 |
|----------|----------|
| Data     | Data     |
```

### Step 5: Save and Preview

1. Save your `.md` file
2. The site will automatically reload (in development)
3. Check your article at: `http://localhost:3000/{category}/{slug}`

---

## Image Guidelines

### Featured Images
- Minimum size: 1200 x 630 pixels (social media optimized)
- Format: JPG or WebP
- Sources: [Unsplash](https://unsplash.com) (free), [Pexels](https://pexels.com)

### Unsplash URL Format
```
https://images.unsplash.com/photo-{ID}?w=800
```

---

## Author Database

Current registered authors:
- Amara Okonkwo (Entertainment Editor)
- Emeka Nwankwo (Business Editor)
- Zainab Bello (Lifestyle Editor)
- Chidi Okafor (Sports Editor)
- Tunde Fashola (Tech Writer)
- Dr. Funke Adeyemi (Opinion Contributor)

To add new authors, edit `/src/data/articles.ts`.

---

## Category Reference

| Category | Slug | Folder |
|----------|------|--------|
| Technology | `technology` | `/content/articles/technology/` |
| Business | `business` | `/content/articles/business/` |
| Entertainment | `entertainment` | `/content/articles/entertainment/` |
| Lifestyle | `lifestyle` | `/content/articles/lifestyle/` |
| Sports | `sports` | `/content/articles/sports/` |
| Politics | `politics` | `/content/articles/politics/` |

---

## Quick Start: Copy This Template

```markdown
---
title: ""
excerpt: ""
category: ""
author: ""
date: "2024-12-30"
image: ""
readTime: "5 min read"
tags: []
featured: false
trending: false
---

Article content here...
```

---

## Need Help?

Check the `_template.md` file in `/content/articles/` for a complete example.
