import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'meta', title: 'Meta & SEO' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    // Content Group
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Brief summary for article cards (max 200 characters)',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      group: 'content',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      group: 'content',
    }),
    
    // Meta Group
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      group: 'meta',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory / Genre',
      type: 'reference',
      to: [{ type: 'subcategory' }],
      group: 'meta',
      description: 'Optional: Select a subcategory or genre within the main category',
      options: {
        filter: ({ document }) => {
          // Only show subcategories that belong to the selected parent category
          const categoryRef = (document as any)?.category?._ref;
          if (!categoryRef) {
            return {
              filter: '_id == "none"', // Show nothing if no category is selected
            };
          }
          return {
            filter: 'parentCategory._ref == $categoryRef',
            params: {
              categoryRef: categoryRef,
            },
          };
        },
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
      group: 'meta',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
      group: 'meta',
      description: 'Estimated reading time. Will be auto-calculated if left empty.',
    }),
    
    // Settings Group
    defineField({
      name: 'featured',
      title: 'Featured Article',
      type: 'boolean',
      group: 'settings',
      description: 'Show on homepage featured section',
      initialValue: false,
    }),
    defineField({
      name: 'trending',
      title: 'Trending',
      type: 'boolean',
      group: 'settings',
      description: 'Mark as trending in the ticker',
      initialValue: false,
    }),
    defineField({
      name: 'impactScore',
      title: 'AfriPulse Impact Score',
      type: 'number',
      group: 'settings',
      description: 'Score from 0-100 for AfriPulse Index',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'settings',
      description: 'Override title for search engines',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'settings',
      rows: 2,
      description: 'Override description for search engines',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      category: 'category.name',
      media: 'mainImage',
      publishedAt: 'publishedAt',
    },
    prepare({ title, author, category, media, publishedAt }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Draft';
      return {
        title,
        subtitle: `${category || 'Uncategorized'} • ${author || 'Unknown'} • ${date}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
  ],
});
