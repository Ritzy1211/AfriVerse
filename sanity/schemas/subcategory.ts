import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'subcategory',
  title: 'Subcategory / Genre',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., Afrobeats, Hip-Hop, AI & Innovation',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentCategory',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
      description: 'The main category this subcategory belongs to',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'color',
      title: 'Badge Color',
      type: 'string',
      description: 'Hex color code for badges (e.g., #FF6B6B)',
      validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/, {
        name: 'hex color',
        invert: false,
      }),
    }),
    defineField({
      name: 'icon',
      title: 'Icon (Emoji)',
      type: 'string',
      description: 'An emoji to represent this subcategory (e.g., 🎵, 🎤, 🎸)',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order within parent category (lower = first)',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'parentCategory.name',
      icon: 'icon',
    },
    prepare({ title, subtitle, icon }) {
      return {
        title: `${icon || '📂'} ${title}`,
        subtitle: subtitle ? `in ${subtitle}` : 'No parent category',
      };
    },
  },
  orderings: [
    {
      title: 'Parent Category',
      name: 'parentCategoryAsc',
      by: [
        { field: 'parentCategory.name', direction: 'asc' },
        { field: 'order', direction: 'asc' },
      ],
    },
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
  ],
});
