export interface HomeThumbnailFilter {
  includeTags?: string[]
  excludeTags?: string[]
}

export interface HomeThumbnailFrontmatter {
  title?: string
  description?: string
  order?: number
  targets?: string[] | string
}

export interface HomeThumbnailPageFrontmatter {
  title?: string
  description?: string
  date?: string
  tags?: string[] | string
  layout?: string
  thumbnail?: HomeThumbnailFrontmatter
}

export interface HomeThumbnailPageData {
  title?: string
  description?: string
  relativePath?: string
  frontmatter?: HomeThumbnailPageFrontmatter
}

export interface HomeThumbnailPageModule {
  __pageData?: HomeThumbnailPageData
  frontmatter?: HomeThumbnailPageFrontmatter
}

export type HomeThumbnailPageSource = HomeThumbnailPageModule | HomeThumbnailPageData

export interface HomeThumbnailItem {
  title: string
  description: string
  date: string
  tags: string[]
  targets: string[]
  relativePath: string
  link: string
  order: number
}

export interface HomeThumbnailSection {
  title: string
  description?: string
  filters: HomeThumbnailFilter[]
}
