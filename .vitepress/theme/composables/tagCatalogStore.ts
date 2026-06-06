import { createTagCatalog } from '../tag-system'

// Keep the catalog scoped to public docs and isolate it in its own module so
// Rollup can split it into a shared chunk.
const markdownPages = import.meta.glob([
  '/Docs/**/*.md',
  '/index.md'
], {
  eager: true,
  import: '__pageData'
})

export const tagCatalog = createTagCatalog(markdownPages, {
  includePath(relativePath) {
    return (
      relativePath.startsWith('/Docs/') ||
      relativePath === '/index.md'
    )
  }
})
