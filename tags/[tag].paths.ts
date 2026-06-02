import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

function readMarkdownFiles(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const absolutePath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === '.vitepress') {
        return []
      }

      return readMarkdownFiles(absolutePath)
    }

    return entry.name.endsWith('.md') ? [absolutePath] : []
  })
}

function extractTags(markdown: string): string[] {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)

  if (!frontmatterMatch) {
    return []
  }

  const frontmatter = frontmatterMatch[1]
  const inlineMatch = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m)

  if (inlineMatch) {
    return inlineMatch[1]
      .split(',')
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter((tag) => tag.length > 0)
  }

  const blockMatch = frontmatter.match(/^tags:\s*$/m)
  if (!blockMatch) {
    const singleLineMatch = frontmatter.match(/^tags:\s*(.+)$/m)
    if (!singleLineMatch) {
      return []
    }

    return singleLineMatch[1]
      .split(',')
      .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
      .filter((tag) => tag.length > 0)
  }

  const lines = frontmatter.split(/\r?\n/)
  const startIndex = lines.findIndex((line) => /^tags:\s*$/.test(line))

  if (startIndex === -1) {
    return []
  }

  const tags: string[] = []

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]

    if (!/^\s*-\s+/.test(line)) {
      break
    }

    const value = line.replace(/^\s*-\s+/, '').trim().replace(/^['"]|['"]$/g, '')
    if (value.length > 0) {
      tags.push(value)
    }
  }

  return tags
}

function getTagPaths(): { params: { tag: string } }[] {
  const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const markdownFiles = readMarkdownFiles(path.join(workspaceRoot, 'Docs'))
  const tags = new Set<string>()

  for (const filePath of markdownFiles) {
    const markdown = fs.readFileSync(filePath, 'utf-8')
    for (const tag of extractTags(markdown)) {
      tags.add(tag)
    }
  }

  return [...tags]
    .sort((left, right) => left.localeCompare(right, 'ja'))
    .map((tag) => ({ params: { tag } }))
}

export default {
  watch: ['../Docs/**/*.md', '../index.md'],
  paths() {
    return getTagPaths()
  }
}