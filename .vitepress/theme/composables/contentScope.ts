export function isTechnicalArticlePath(relativePath: string): boolean {
  return relativePath.replace(/^\/+/, '').startsWith('Docs/Technical_articles/')
}
