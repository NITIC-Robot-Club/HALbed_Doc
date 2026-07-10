import { normalizeTags } from '../tag-system'
import type {
  HomeThumbnailFilter,
  HomeThumbnailItem,
  HomeThumbnailPageSource,
} from './types'

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

function getPageData(source: HomeThumbnailPageSource) {
  if ('__pageData' in source) {
    return source.__pageData
  }

  return source
}

function getFrontmatter(source: HomeThumbnailPageSource) {
  if ('__pageData' in source) {
    return source.__pageData?.frontmatter ?? source.frontmatter ?? {}
  }

  return source.frontmatter ?? {}
}

function matchesFilter(tags: string[], filter: HomeThumbnailFilter): boolean {
  const includeTags = normalizeTags(filter.includeTags)
  const excludeTags = new Set(normalizeTags(filter.excludeTags))

  if (!includeTags.length) {
    return tags.every((tag) => !excludeTags.has(tag))
  }

  return includeTags.every((tag) => tags.includes(tag)) && tags.every((tag) => !excludeTags.has(tag))
}

function toArticle(
  relativePath: string,
  source: HomeThumbnailPageSource,
  includePath: (relativePath: string) => boolean
): HomeThumbnailItem | null {
  if (!includePath(relativePath)) {
    return null
  }

  const frontmatter = getFrontmatter(source)
  const thumbnail = frontmatter.thumbnail

  if (!thumbnail) {
    return null
  }

  const tags = normalizeTags(frontmatter.tags)
  const targets = normalizeTags(thumbnail.targets)

  if (!targets.length || !tags.length) {
    return null
  }

  const pageData = getPageData(source)
  const resolvedRelativePath = pageData?.relativePath ?? relativePath.slice(1)

  return {
    title: thumbnail.title ?? pageData?.title ?? frontmatter.title ?? resolvedRelativePath.replace(/\.md$/, ''),
    description: firstNonEmpty(thumbnail.description, pageData?.description, frontmatter.description),
    date: normalizeDate(frontmatter.date),
    tags,
    targets,
    relativePath: resolvedRelativePath,
    link: normalizeLink(resolvedRelativePath),
    order: typeof thumbnail.order === 'number' ? thumbnail.order : 0,
  }
}

export function createHomeThumbnailCatalog(
  markdownPages: Record<string, HomeThumbnailPageSource>,
  options: {
    includePath?: (relativePath: string) => boolean
  } = {}
) {
  const includePath = options.includePath ?? (() => true)

  const articles = Object.entries(markdownPages)
    .map(([relativePath, module]) => toArticle(relativePath, module, includePath))
    .filter((article): article is HomeThumbnailItem => article !== null)

  articles.sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order
    }

    return left.title.localeCompare(right.title, 'ja')
  })

  function getArticlesByTarget(target: string): HomeThumbnailItem[] {
    return articles.filter((article) => article.targets.includes(target))
  }

  function getArticlesByTargetAndFilters(
    target: string,
    filters: HomeThumbnailFilter[]
  ): HomeThumbnailItem[] {
    const targetArticles = getArticlesByTarget(target)

    if (!filters.length) {
      return targetArticles
    }

    return targetArticles.filter((article) => {
      return filters.some((filter) => matchesFilter(article.tags, filter))
    })
  }

  return {
    articles,
    getArticlesByTarget,
    getArticlesByTargetAndFilters,
  }
}
