import { createTagCatalog } from '../tag-system'
import markdownPages from '../generated/contentCatalog'

export const tagCatalog = createTagCatalog(markdownPages, {
  includePath(relativePath) {
    return (
      relativePath.startsWith('/Docs/') ||
      relativePath === '/index.md'
    )
  }
})
