import type {
  MarkdownPageData,
  MarkdownPageSource,
  TagCatalogOptions,
  TaggedArticle,
  TagSummary
} from './types'

export function normalizeTags(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  }

  return []
}

function normalizeLink(relativePath: string): string {
  if (relativePath === 'index.md') {
    return '/'
  }

  if (relativePath.endsWith('/index.md')) {
    return `/${relativePath.replace(/\/index\.md$/, '/')}`
  }

  return `/${relativePath.replace(/\.md$/, '')}`
}

function normalizeDate(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return ''
}

function getPageData(source: MarkdownPageSource): MarkdownPageData | undefined {
  if ('__pageData' in source) {
    return source.__pageData
  }

  return source
}

function getFrontmatter(source: MarkdownPageSource) {
  if ('__pageData' in source) {
    return source.__pageData?.frontmatter ?? source.frontmatter ?? {}
  }

  return source.frontmatter ?? {}
}

function toArticle(
  relativePath: string,
  source: MarkdownPageSource,
  includePath: (relativePath: string) => boolean
): TaggedArticle | null {
  if (!includePath(relativePath)) {
    return null
  }

  const frontmatter = getFrontmatter(source)
  const tags = normalizeTags(frontmatter.tags)

  if (!tags.length) {
    return null
  }

  const pageData = getPageData(source)
  const resolvedRelativePath = pageData?.relativePath ?? relativePath.slice(1)
  const thumbnailDescription = frontmatter.thumbnail?.description ?? ''

  return {
    title: pageData?.title ?? frontmatter.title ?? resolvedRelativePath.replace(/\.md$/, ''),
    description: firstNonEmpty(pageData?.description, thumbnailDescription, frontmatter.description),
    date: normalizeDate(frontmatter.date),
    tags,
    relativePath: resolvedRelativePath,
    link: normalizeLink(resolvedRelativePath)
  }
}

export function createTagCatalog(
  markdownPages: Record<string, MarkdownPageSource>,
  options: TagCatalogOptions = {}
) {
  const includePath = options.includePath ?? (() => true)

  const articles = Object.entries(markdownPages)
    .map(([relativePath, module]) => toArticle(relativePath, module, includePath))
    .filter((article): article is TaggedArticle => article !== null)

  articles.sort((left, right) => {
    const leftDate = left.date ? Date.parse(left.date) : 0
    const rightDate = right.date ? Date.parse(right.date) : 0

    if (leftDate !== rightDate) {
      return rightDate - leftDate
    }

    return left.title.localeCompare(right.title, 'ja')
  })

  const tagSummariesMap = new Map<string, number>()

  for (const article of articles) {
    for (const tag of article.tags) {
      tagSummariesMap.set(tag, (tagSummariesMap.get(tag) ?? 0) + 1)
    }
  }

  const tagSummaries: TagSummary[] = [...tagSummariesMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => {
      if (left.count !== right.count) {
        return right.count - left.count
      }

      return left.tag.localeCompare(right.tag, 'ja')
    })

  function getArticlesByTag(tag: string): TaggedArticle[] {
    return articles.filter((article) => article.tags.includes(tag))
  }

  function getArticlesByTags(tags: string[]): TaggedArticle[] {
    const filteredTags = tags.filter((tag) => tag.length > 0)
    if (!filteredTags.length) {
      return articles
    }

    return articles.filter((article) => filteredTags.every((tag) => article.tags.includes(tag)))
  }

  function getRelatedArticles(relativePath: string, tags: string[], limit = 5): TaggedArticle[] {
    const tagSet = new Set(tags)

    return articles
      .map((article) => {
        if (article.relativePath === relativePath) {
          return null
        }

        const sharedTags = article.tags.filter((tag) => tagSet.has(tag))
        if (!sharedTags.length) {
          return null
        }

        const score = sharedTags.length * 10
        const dateScore = article.date ? Date.parse(article.date) : 0

        return { article, score, dateScore }
      })
      .filter((item): item is { article: TaggedArticle; score: number; dateScore: number } => item !== null)
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }

        if (right.dateScore !== left.dateScore) {
          return right.dateScore - left.dateScore
        }

        return left.article.title.localeCompare(right.article.title, 'ja')
      })
      .slice(0, limit)
      .map((item) => item.article)
  }

  return {
    articles,
    getArticlesByTag,
    getArticlesByTags,
    getRelatedArticles,
    tagSummaries
  }
}
