import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'spotlight',
  title: 'Spotlight',
  type: 'document',
  icon: () => '🌟',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Title badge shown on the spotlight (e.g., "EXCLUSIVE", "INTERVIEW", "BREAKING")',
      validation: (Rule) => Rule.required().max(30),
    }),
    defineField({
      name: 'quote',
      title: 'Quote / Headline',
      type: 'text',
      description: 'The main quote or headline text displayed over the image',
      rows: 3,
    }),
    defineField({
      name: 'quoteHighlight',
      title: 'Highlight Words',
      type: 'string',
      description: 'Words from the quote to highlight with color (e.g., "RIGHT TIME")',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / Attribution',
      type: 'string',
      description: 'Subtitle or person name (e.g., "Burna Boy on his new album")',
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
    }),
    defineField({
      name: 'image',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      hidden: ({ document }) => document?.mediaType === 'video',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'URL to the video file (MP4 recommended)',
      hidden: ({ document }) => document?.mediaType !== 'video',
    }),
    defineField({
      name: 'videoThumbnail',
      title: 'Video Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Thumbnail image shown before video plays',
      hidden: ({ document }) => document?.mediaType !== 'video',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'string',
      description: 'URL to link to when clicking the CTA button (can be internal like /business/article-slug)',
    }),
    defineField({
      name: 'linkText',
      title: 'Link Button Text',
      type: 'string',
      description: 'Text for the CTA button (default: "Read Full Story")',
      initialValue: 'Read Full Story',
    }),
    defineField({
      name: 'overlayPosition',
      title: 'Text Position',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
    defineField({
      name: 'highlightColor',
      title: 'Highlight Color',
      type: 'string',
      description: 'Color for highlighted text and badge (e.g., #00D9FF, #F39C12)',
      initialValue: '#00D9FF',
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'string',
      description: 'Main text color (default: white)',
      initialValue: '#FFFFFF',
    }),
    defineField({
      name: 'placement',
      title: 'Placement',
      type: 'string',
      options: {
        list: [
          { title: 'Homepage', value: 'homepage' },
          { title: 'Category Page', value: 'category' },
          { title: 'Article (In-Content)', value: 'article' },
          { title: 'Global (All Articles)', value: 'global' },
        ],
      },
      description: 'Where should this spotlight appear?',
    }),
    defineField({
      name: 'category',
      title: 'Category (if placement is Category Page)',
      type: 'reference',
      to: [{ type: 'category' }],
      hidden: ({ document }) => document?.placement !== 'category',
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles (Sidebar)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article' }],
        },
      ],
      description: 'Articles to show in the sidebar next to the spotlight',
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle to show/hide this spotlight',
      initialValue: true,
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Higher number = higher priority (shows first)',
      initialValue: 0,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'When should this spotlight start showing?',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'When should this spotlight stop showing?',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'quote',
      media: 'image',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, media, isActive }) {
      return {
        title: `${isActive ? '🟢' : '🔴'} ${title}`,
        subtitle: subtitle ? subtitle.slice(0, 50) + '...' : 'No quote',
        media,
      };
    },
  },
  orderings: [
    {
      title: 'Priority',
      name: 'priorityDesc',
      by: [{ field: 'priority', direction: 'desc' }],
    },
    {
      title: 'Newest',
      name: 'createdAtDesc',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
});
