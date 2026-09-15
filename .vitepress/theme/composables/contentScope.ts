export function isTechnicalArticlePath(relativePath: string): boolean {
  return relativePath.replace(/^\/+/, '').startsWith('Docs/Technical_articles/')
}

export function isTechnicalArticlesHomePath(relativePath: string): boolean {
  return relativePath.replace(/^\/+/, '') === 'Docs/Technical_articles/Article_Home.md'
}
