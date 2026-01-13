import { defineType, defineArrayMember } from 'sanity';

/**
 * Block content schema for rich text editing in Sanity
 * Supports headings, lists, links, images, and custom blocks
 */
export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      title: 'Block',
      // Styles for text blocks
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      // List types
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      // Inline text decorators
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' },
          { title: 'Code', value: 'code' },
          { title: 'Highlight', value: 'highlight' },
        ],
        // Annotation types (links, etc.)
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ['http', 'https', 'mailto', 'tel'],
                  }),
              },
              {
                name: 'openInNewTab',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: false,
              },
            ],
          },
          {
            name: 'internalLink',
            type: 'object',
            title: 'Internal Link',
            fields: [
              {
                name: 'reference',
                type: 'reference',
                title: 'Reference',
                to: [{ type: 'article' }, { type: 'category' }, { type: 'author' }],
              },
            ],
          },
        ],
      },
    }),
    // Image blocks in content
    defineArrayMember({
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for accessibility',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    // YouTube embed
    defineArrayMember({
      name: 'youtube',
      type: 'object',
      title: 'YouTube Video',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'YouTube URL',
          description: 'Paste the full YouTube video URL',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      preview: {
        select: {
          url: 'url',
          caption: 'caption',
        },
        prepare({ url, caption }) {
          return {
            title: caption || 'YouTube Video',
            subtitle: url,
          };
        },
      },
    }),
    // Twitter/X embed
    defineArrayMember({
      name: 'twitter',
      type: 'object',
      title: 'Twitter/X Post',
      fields: [
        {
          name: 'url',
          type: 'url',
          title: 'Tweet URL',
          description: 'Paste the full tweet URL',
        },
      ],
      preview: {
        select: {
          url: 'url',
        },
        prepare({ url }) {
          return {
            title: 'Twitter/X Post',
            subtitle: url,
          };
        },
      },
    }),
    // Code block
    defineArrayMember({
      name: 'code',
      type: 'object',
      title: 'Code Block',
      fields: [
        {
          name: 'language',
          type: 'string',
          title: 'Language',
          options: {
            list: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'JSON', value: 'json' },
              { title: 'Bash', value: 'bash' },
              { title: 'Other', value: 'text' },
            ],
          },
        },
        {
          name: 'code',
          type: 'text',
          title: 'Code',
        },
        {
          name: 'filename',
          type: 'string',
          title: 'Filename',
          description: 'Optional filename to display',
        },
      ],
      preview: {
        select: {
          language: 'language',
          filename: 'filename',
        },
        prepare({ language, filename }) {
          return {
            title: filename || 'Code Block',
            subtitle: language || 'text',
          };
        },
      },
    }),
    // Call to action / highlight box
    defineArrayMember({
      name: 'callout',
      type: 'object',
      title: 'Callout Box',
      fields: [
        {
          name: 'type',
          type: 'string',
          title: 'Type',
          options: {
            list: [
              { title: 'Info', value: 'info' },
              { title: 'Warning', value: 'warning' },
              { title: 'Success', value: 'success' },
              { title: 'Error', value: 'error' },
            ],
          },
          initialValue: 'info',
        },
        {
          name: 'title',
          type: 'string',
          title: 'Title',
        },
        {
          name: 'text',
          type: 'text',
          title: 'Text',
        },
      ],
      preview: {
        select: {
          title: 'title',
          type: 'type',
        },
        prepare({ title, type }) {
          const icons: Record<string, string> = {
            info: 'ℹ️',
            warning: '⚠️',
            success: '✅',
            error: '❌',
          };
          return {
            title: title || 'Callout',
            subtitle: `${icons[type] || 'ℹ️'} ${type}`,
          };
        },
      },
    }),
    // Table (simple)
    defineArrayMember({
      name: 'table',
      type: 'object',
      title: 'Table',
      fields: [
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
        {
          name: 'rows',
          type: 'array',
          title: 'Rows',
          of: [
            {
              type: 'object',
              name: 'row',
              fields: [
                {
                  name: 'cells',
                  type: 'array',
                  of: [{ type: 'string' }],
                },
              ],
            },
          ],
        },
      ],
      preview: {
        select: {
          caption: 'caption',
        },
        prepare({ caption }) {
          return {
            title: caption || 'Table',
            subtitle: '📊 Data table',
          };
        },
      },
    }),
  ],
});
