import catalog from '../.vitepress/theme/generated/contentCatalog'

function getTagPaths(): { params: { tag: string } }[] {
  const tags = new Set<string>()

  for (const page of Object.values(catalog)) {
    for (const tag of page.frontmatter.tags ?? []) {
      tags.add(tag)
    }
  }

  return [...tags]
    .sort((left, right) => left.localeCompare(right, 'ja'))
    .map((tag) => ({ params: { tag } }))
}

export default {
  watch: ['../Docs/**/*.md', '../index.md'],
  paths() {
    return getTagPaths()
  }
}
