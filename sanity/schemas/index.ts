// Export all schemas for Sanity Studio
import article from './article';
import author from './author';
import category from './category';
import subcategory from './subcategory';
import tag from './tag';
import blockContent from './blockContent';
import siteSettings from './siteSettings';
import spotlight from './spotlight';

export const schemaTypes = [
  // Document types
  article,
  author,
  category,
  subcategory,
  tag,
  siteSettings,
  spotlight,
  
  // Block types
  blockContent,
];
