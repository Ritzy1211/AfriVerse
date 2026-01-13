import { type SchemaTypeDefinition } from 'sanity'

// Import custom AfriVerse schemas
import article from '../../../sanity/schemas/article'
import author from '../../../sanity/schemas/author'
import category from '../../../sanity/schemas/category'
import tag from '../../../sanity/schemas/tag'
import blockContent from '../../../sanity/schemas/blockContent'
import siteSettings from '../../../sanity/schemas/siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [article, author, category, tag, blockContent, siteSettings],
}
