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
}

export interface MarkdownPageModule {
  __pageData?: {
    title?: string
    description?: string
    relativePath?: string
    frontmatter?: FrontmatterRecord
  }
  frontmatter?: FrontmatterRecord
}

export interface TagCatalogOptions {
  includePath?: (relativePath: string) => boolean
}