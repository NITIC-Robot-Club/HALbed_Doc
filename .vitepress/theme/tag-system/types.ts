export interface TaggedArticle {
  title: string
  description: string
  date: string
  tags: string[]
  relativePath: string
  link: string
}

export interface TagSummary {
  tag: string
  count: number
}

export interface FrontmatterRecord {
  title?: string
  description?: string
  date?: string
  tags?: string[] | string
  layout?: string
  thumbnail?: {
    description?: string
  }
}

export interface MarkdownPageData {
  title?: string
  description?: string
  relativePath?: string
  frontmatter?: FrontmatterRecord
}

export interface MarkdownPageModule {
  __pageData?: MarkdownPageData
  frontmatter?: FrontmatterRecord
}

export type MarkdownPageSource = MarkdownPageModule | MarkdownPageData

export interface TagCatalogOptions {
  includePath?: (relativePath: string) => boolean
}
