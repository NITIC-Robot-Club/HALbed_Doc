import { createHomeThumbnailCatalog } from '../home-thumbnail'

const markdownPages = import.meta.glob([
  '/Docs/**/*.md',
  '/index.md'
], {
  eager: true,
  import: '__pageData'
})

export const homeThumbnailCatalog = createHomeThumbnailCatalog(markdownPages, {
  includePath(relativePath) {
    return (
      relativePath.startsWith('/Docs/') ||
      relativePath === '/index.md'
    )
  }
})
