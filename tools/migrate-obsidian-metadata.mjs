import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name)
    return entry.isDirectory() ? markdownFiles(file) : entry.name.endsWith('.md') ? [file] : []
  })
}

function titleFrom(source, file) {
  return source.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? relative(root, file).replaceAll('\\', '/').replace(/\.md$/, '')
}

function yamlString(value) {
  return JSON.stringify(value)
}

function categoryFor(file) {
  const path = relative(root, file).replaceAll('\\', '/')
  if (path.startsWith('Docs/API/')) return 'API'
  if (path.startsWith('Docs/Tools/')) return 'ツール'
  if (path.startsWith('Docs/FAQ/')) return 'FAQ'
  if (path.startsWith('Docs/Introduction/')) return 'ドキュメント'
  return '開発資料'
}

function migrate(file) {
  const source = readFileSync(file, 'utf8')
  const title = titleFrom(source, file)
  const category = categoryFor(file)
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)

  if (!match) {
    writeFileSync(file, `---\ntitle: ${yamlString(title)}\naliases:\n  - ${yamlString(title)}\ntags:\n  - ${yamlString(category)}\n---\n${source}`)
    return true
  }

  if (/^tags\s*:/m.test(match[1])) return false

  const frontmatter = `${match[1]}\ntags:\n  - ${yamlString(category)}`
  writeFileSync(file, `---\n${frontmatter}\n---${source.slice(match[0].length)}`)
  return true
}

const files = markdownFiles(join(root, 'Docs'))
const changed = files.filter(migrate)
console.log(`Migrated ${changed.length} of ${files.length} Markdown files to Obsidian metadata.`)
