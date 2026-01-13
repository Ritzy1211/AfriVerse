'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

// Define the structure for the studio sidebar
const deskStructure = (S: any) =>
  S.list()
    .title('AfriVerse Content')
    .items([
      // Articles
      S.listItem()
        .title('Articles')
        .icon(() => '📰')
        .child(
          S.list()
            .title('Articles')
            .items([
              S.listItem()
                .title('All Articles')
                .child(
                  S.documentList()
                    .title('All Articles')
                    .filter('_type == "article"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Featured Articles')
                .child(
                  S.documentList()
                    .title('Featured Articles')
                    .filter('_type == "article" && featured == true')
                ),
              S.listItem()
                .title('Trending Articles')
                .child(
                  S.documentList()
                    .title('Trending Articles')
                    .filter('_type == "article" && trending == true')
                ),
              S.listItem()
                .title('Drafts')
                .child(
                  S.documentList()
                    .title('Drafts')
                    .filter('_type == "article" && !defined(publishedAt)')
                ),
            ])
        ),
      S.divider(),
      
      // Authors
      S.listItem()
        .title('Authors')
        .icon(() => '✍️')
        .child(
          S.documentList()
            .title('Authors')
            .filter('_type == "author"')
        ),
      
      // Categories
      S.listItem()
        .title('Categories')
        .icon(() => '📁')
        .child(
          S.documentList()
            .title('Categories')
            .filter('_type == "category"')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
      
      // Tags
      S.listItem()
        .title('Tags')
        .icon(() => '🏷️')
        .child(
          S.documentList()
            .title('Tags')
            .filter('_type == "tag"')
        ),
      
      S.divider(),
      
      // Site Settings (singleton)
      S.listItem()
        .title('Site Settings')
        .icon(() => '⚙️')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
    ]);

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'afriverse-studio',
  title: 'AfriVerse Studio',
  
  projectId,
  dataset,
  
  basePath: '/studio',
  
  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),
  ],
  
  schema: {
    types: schemaTypes,
  },
  
  // Studio customization
  studio: {
    components: {
      // You can add custom components here
    },
  },
});
