export interface ArticleIndexItem {
  title: string
  link: string
  description?: string
  tags?: string[]
  date?: string
  relativePath?: string
}

export interface ArticleIndexSection {
  title: string
  description?: string
  articles: ArticleIndexItem[]
}
