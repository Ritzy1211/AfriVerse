// Export all schemas for Sanity Studio
import article from './article';
import author from './author';
import category from './category';
import tag from './tag';
import blockContent from './blockContent';
import siteSettings from './siteSettings';

export const schemaTypes = [
  // Document types
  article,
  author,
  category,
  tag,
  siteSettings,
  
  // Block types
  blockContent,
];
