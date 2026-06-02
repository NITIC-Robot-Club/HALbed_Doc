import { createTagCatalog, normalizeTags } from '../tag-system'

const markdownPages = import.meta.glob('/**/*.md', { eager: true })

const catalog = createTagCatalog(markdownPages, {
  includePath(relativePath) {
    return (
      relativePath.startsWith('/Docs/') ||
      relativePath === '/index.md' ||
      relativePath.startsWith('/articles/')
    )
  }
})

export function useTags() {
  return catalog
}

export { normalizeTags }