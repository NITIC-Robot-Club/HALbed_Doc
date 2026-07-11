import { createHomeThumbnailCatalog } from '../home-thumbnail'
import markdownPages from '../generated/contentCatalog'

export const homeThumbnailCatalog = createHomeThumbnailCatalog(markdownPages, {
  includePath(relativePath) {
    return (
      relativePath.startsWith('/Docs/') ||
      relativePath === '/index.md'
    )
  }
})
