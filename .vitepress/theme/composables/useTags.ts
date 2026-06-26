import { normalizeTags } from '../tag-system'
import { tagCatalog } from './tagCatalogStore'

export function useTags() {
  return tagCatalog
}

export { normalizeTags }
