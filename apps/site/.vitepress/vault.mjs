import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { slugify } from '@mdit-vue/shared'

export function siteBase(value = '/') {
  const segments = value.split('/').filter(Boolean)
  return segments.length ? `/${segments.join('/')}/` : '/'
}

function normalizeTarget(value) {
  return value.trim().replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.md$/i, '')
}

function routeFor(sourcePath) {
  const route = sourcePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1')
  return `/${route.split('/').map(encodeURIComponent).join('/')}`
}

function parseWikiLink(value) {
  const separator = value.indexOf('|')
  const target = (separator < 0 ? value : value.slice(0, separator)).replace(/\\$/, '').trim()
  const label = separator < 0 ? target : value.slice(separator + 1).trim()
  return { target, label: label.replace(/\\([|\\])/g, '$1') }
}

function collectPages(directory, parent = '') {
  const markdown = new MarkdownIt()
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.') && !['node_modules', 'public'].includes(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const sourcePath = path.posix.join(parent, entry.name)
      const filename = path.join(directory, entry.name)
      if (entry.isDirectory()) return collectPages(filename, sourcePath)
      if (!entry.isFile() || !entry.name.endsWith('.md')) return []
      const { data, content } = matter(fs.readFileSync(filename, 'utf8'))
      const tokens = markdown.parse(content, {})
      const heading = tokens.findIndex((token) => token.type === 'heading_open' && token.tag === 'h1')
      const title = typeof data.title === 'string'
        ? data.title
        : heading >= 0 ? tokens[heading + 1].content : path.basename(entry.name, '.md')
      return [{ sourcePath, title, content, route: routeFor(sourcePath), data }]
    })
}

function buildSidebar(pages, parent = '') {
  const items = []
  const folders = new Set()
  for (const page of pages) {
    if (!page.sourcePath.startsWith(parent)) continue
    const relative = page.sourcePath.slice(parent.length)
    const separator = relative.indexOf('/')
    if (separator >= 0) folders.add(relative.slice(0, separator))
    else if (relative !== 'index.md' && page.sourcePath !== 'graph.md') {
      items.push({ text: page.title, link: page.route })
    }
  }
  for (const folder of folders) {
    const directory = `${parent}${folder}/`
    const index = pages.find((page) => page.sourcePath === `${directory}index.md`)
    const children = buildSidebar(pages, directory)
    items.push({
      text: index?.title || folder,
      ...(index ? { link: index.route } : {}),
      ...(children.length ? { collapsed: true, items: children } : {})
    })
  }
  return items
}

export function createVault(directory) {
  const pages = collectPages(directory)
  const byPath = new Map(pages.map((page) => [normalizeTarget(page.sourcePath), page]))
  const byName = new Map()
  for (const page of pages) {
    const name = path.posix.basename(normalizeTarget(page.sourcePath))
    byName.set(name, [...(byName.get(name) || []), page])
  }

  function resolveWikiLink(value, from = 'index.md') {
    const { target, label } = parseWikiLink(value)
    const separator = target.indexOf('#')
    const pageTarget = separator < 0 ? target : target.slice(0, separator)
    const heading = separator < 0 ? '' : target.slice(separator + 1)
    const normalized = normalizeTarget(pageTarget)
    const relative = path.posix.normalize(path.posix.join(path.posix.dirname(from), normalized))
    const page = !pageTarget ? byPath.get(normalizeTarget(from))
      : /^\.\.?\//.test(pageTarget) ? byPath.get(relative) || byPath.get(`${relative}/index`)
        : byPath.get(normalized) || byPath.get(`${normalized}/index`) || byPath.get(relative)
          || (byName.get(normalized)?.length === 1 ? byName.get(normalized)[0] : undefined)
    if (!page) throw new Error(`Unresolved or ambiguous wiki link [[${value}]] in ${from}`)
    const anchor = heading.startsWith('^') ? heading.slice(1) : slugify(heading)
    return {
      href: `${pageTarget ? page.route : ''}${anchor ? `#${encodeURIComponent(anchor)}` : ''}` || '#',
      label,
      page
    }
  }

  function wikiLinks(markdown) {
    markdown.inline.ruler.before('link', 'vault-wiki-link', (state, silent) => {
      if (!state.src.startsWith('[[', state.pos) || state.linkLevel > 0) return false
      const end = state.src.indexOf(']]', state.pos + 2)
      if (end < 0) return false
      if (!silent) {
        const resolved = resolveWikiLink(state.src.slice(state.pos + 2, end), state.env.relativePath)
        const opening = state.push('link_open', 'a', 1)
        opening.attrSet('href', resolved.href)
        opening.meta = { vaultTarget: resolved.page.sourcePath }
        state.push('text', '', 0).content = resolved.label
        state.push('link_close', 'a', -1)
      }
      state.pos = end + 2
      return true
    })
    markdown.block.ruler.before('paragraph', 'vault-block-anchor', (state, startLine, _endLine, silent) => {
      const line = state.getLines(startLine, startLine + 1, state.blkIndent, false).trim()
      const match = /^\^([A-Za-z0-9][A-Za-z0-9-]*)$/.exec(line)
      if (!match) return false
      if (!silent) state.push('vault_block_anchor', 'span', 0).attrSet('id', match[1])
      state.line = startLine + 1
      return true
    })
    markdown.renderer.rules.vault_block_anchor = (tokens, index) =>
      `<span${markdown.renderer.renderAttrs(tokens[index])}></span>`
  }

  const graphPages = pages.filter((page) => !['index.md', 'graph.md'].includes(page.sourcePath) && page.data.graph !== false)
  const graphIds = new Set(graphPages.map((page) => page.sourcePath))
  const edges = []
  const edgeKeys = new Set()
  const markdown = new MarkdownIt().use(wikiLinks)
  for (const page of pages) {
    const tokens = markdown.parse(page.content, { relativePath: page.sourcePath })
    for (const token of tokens.flatMap((token) => token.children || [])) {
      const target = token.meta?.vaultTarget
      if (!graphIds.has(page.sourcePath) || !graphIds.has(target) || target === page.sourcePath) continue
      const key = JSON.stringify([page.sourcePath, target].sort())
      if (edgeKeys.has(key)) continue
      edgeKeys.add(key)
      edges.push({ source: page.sourcePath, target })
    }
  }
  const degree = new Map()
  for (const edge of edges) {
    for (const id of [edge.source, edge.target]) degree.set(id, (degree.get(id) || 0) + 1)
  }
  const nodes = graphPages.map((page) => ({
    id: page.sourcePath,
    label: page.title,
    route: page.route,
    degree: degree.get(page.sourcePath) || 0
  }))
  return { pages, sidebar: buildSidebar(pages), graph: { nodes, edges }, wikiLinks, resolveWikiLink }
}