const FRONTMATTER_PATTERN = /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/

function unquote(value) {
  const trimmed = value.trim()
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function normalizeTag(tag) {
  return unquote(tag).trim().replace(/^#/, '').trim()
}

function parseList(value) {
  const content = value.trim().replace(/^\[/, '').replace(/\]$/, '')
  return content
    .split(',')
    .map(normalizeTag)
    .filter(Boolean)
}

export function parseFrontmatter(source) {
  const match = source.match(FRONTMATTER_PATTERN)
  if (!match) return { frontmatter: {}, body: source }

  const frontmatter = {}
  const lines = match[1].split(/\r?\n/)
  let section = null
  let listKey = null

  for (const line of lines) {
    const topLevel = line.match(/^([\w-]+):\s*(.*)$/)
    if (topLevel) {
      const [, key, value] = topLevel
      section = null
      listKey = null
      if (key === 'tags') {
        frontmatter.tags = value ? parseList(value) : []
        section = value ? null : 'tags'
        listKey = value ? null : 'tags'
      } else if (key === 'aliases' && !value) {
        frontmatter.aliases = []
        section = 'aliases'
        listKey = 'aliases'
      } else if (value) {
        frontmatter[key] = unquote(value)
      } else {
        frontmatter[key] = {}
        section = key
      }
      continue
    }

    const nested = line.match(/^\s+([\w-]+):\s*(.*)$/)
    if (nested && section) {
      const [, key, value] = nested
      frontmatter[section] ??= {}
      frontmatter[section][key] = value ? unquote(value) : []
      listKey = value ? null : key
      continue
    }

    const item = line.match(/^\s*-\s+(.*)$/)
    if (item && section === 'tags') {
      frontmatter.tags.push(normalizeTag(item[1]))
    } else if (item && section === 'aliases') {
      frontmatter.aliases.push(unquote(item[1]))
    } else if (item && section && listKey && Array.isArray(frontmatter[section][listKey])) {
      frontmatter[section][listKey].push(unquote(item[1]))
    }
  }

  return { frontmatter, body: source.slice(match[0].length) }
}

export function extractInlineTags(markdown) {
  const tags = []
  let inCodeBlock = false

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock || /^\s*#/.test(line)) continue

    for (const match of line.matchAll(/(^|\s)#([\p{L}\p{N}_][\p{L}\p{N}_/-]*)/gu)) {
      tags.push(normalizeTag(match[2]))
    }
  }

  return tags
}

export function getTags(source) {
  const { frontmatter, body } = parseFrontmatter(source)
  return [...new Set([...(frontmatter.tags ?? []), ...extractInlineTags(body)])]
}
