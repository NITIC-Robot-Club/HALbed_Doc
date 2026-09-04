import { createTagCatalog } from '../tag-system'
import markdownPages from '../generated/contentCatalog'
import { isTechnicalArticlePath } from './contentScope'

export const tagCatalog = createTagCatalog(markdownPages, {
  includePath: isTechnicalArticlePath
})
