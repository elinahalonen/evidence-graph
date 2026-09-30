import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import MarkdownIt from 'markdown-it'
import { createVault, siteBase } from '../apps/site/.vitepress/vault.mjs'

function fixture(context, files) {
  const directory = mkdtempSync(path.join(tmpdir(), 'site-template-'))
  context.after(() => rmSync(directory, { recursive: true, force: true }))
  for (const [name, content] of Object.entries(files)) {
    const filename = path.join(directory, name)
    mkdirSync(path.dirname(filename), { recursive: true })
    writeFileSync(filename, content)
  }
  return createVault(directory)
}

test('normalizes root, repository and custom deployment bases', () => {
  assert.equal(siteBase(), '/')
  assert.equal(siteBase(''), '/')
  assert.equal(siteBase('/'), '/')
  assert.equal(siteBase('project'), '/project/')
  assert.equal(siteBase('/project/'), '/project/')
  assert.equal(siteBase('/group/project'), '/group/project/')
})

test('derives sidebar titles and nested index links without editor files', (context) => {
  const vault = fixture(context, {
    'index.md': '# Home',
    'graph.md': '# Graph',
    'First.md': '---\ntitle: First title\n---\n# Another title',
    'Section/index.md': '# Section title',
    'Section/Note with spaces.md': '# Note title',
    '.obsidian/private.md': '[[Missing]]',
    'Section/.private/Secret.md': '[[Missing]]',
    'public/asset.md': '[[Missing]]'
  })
  assert.equal(vault.pages.length, 5)
  assert.deepEqual(vault.sidebar, [
    { text: 'First title', link: '/First' },
    {
      text: 'Section title', link: '/Section/', collapsed: true,
      items: [{ text: 'Note title', link: '/Section/Note%20with%20spaces' }]
    }
  ])
})

test('resolves aliases, headings, block anchors, root and relative links', (context) => {
  const vault = fixture(context, {
    'index.md': '# Home',
    'Section/index.md': '# Section',
    'Section/Note.md': '# Note\n\n## Hello World\n\n^block-id',
    'Second.md': '# Second'
  })
  assert.equal(vault.resolveWikiLink('Note|A label').href, '/Section/Note')
  assert.equal(vault.resolveWikiLink('Note|A label').label, 'A label')
  assert.equal(vault.resolveWikiLink('Note#Hello World').href, '/Section/Note#hello-world')
  assert.equal(vault.resolveWikiLink('Note#^block-id').href, '/Section/Note#block-id')
  assert.equal(vault.resolveWikiLink('#Hello World', 'Section/Note.md').href, '#hello-world')
  assert.equal(vault.resolveWikiLink('../Second.md', 'Section/Note.md').href, '/Second')
  assert.equal(vault.resolveWikiLink('index').href, '/')
  assert.equal(vault.resolveWikiLink('Section').href, '/Section/')
  const markdown = new MarkdownIt().use(vault.wikiLinks)
  assert.match(markdown.render('[[Note|A label]]'), /href="\/Section\/Note">A label<\/a>/)
  assert.match(markdown.render('^block-id'), /<span id="block-id"><\/span>/)
  assert.match(markdown.render('| Link |\n| --- |\n| [[Note\\|A label]] |'), />A label<\/a>/)
})

test('ambiguous basenames require a path while local targets still resolve', (context) => {
  const vault = fixture(context, {
    'First/Note.md': '# First',
    'Second/Note.md': '# Second',
    'First/Other.md': '# Other'
  })
  assert.throws(() => vault.resolveWikiLink('Note'), /ambiguous wiki link/)
  assert.equal(vault.resolveWikiLink('First/Note').href, '/First/Note')
  assert.equal(vault.resolveWikiLink('./Note', 'First/Other.md').href, '/First/Note')
})

test('builds a deduplicated graph from parsed links, not code samples', (context) => {
  const vault = fixture(context, {
    'index.md': '# Home\n\n[[First]]',
    'graph.md': '# Graph',
    'First.md': '# First\n\n[[Second]] [[Second|Again]] [[First]] [[index]]\n\n`[[Missing]]`\n\n```md\n[[Missing]]\n```',
    'Second.md': '# Second\n\n[[First]]',
    'Hidden.md': '---\ngraph: false\n---\n# Hidden\n\n[[First]]'
  })
  assert.deepEqual(vault.graph.edges, [{ source: 'First.md', target: 'Second.md' }])
  assert.deepEqual(vault.graph.nodes.map((node) => [node.id, node.degree]), [
    ['First.md', 1], ['Second.md', 1]
  ])
})

test('missing wiki links fail validation with the source filename', (context) => {
  assert.throws(() => fixture(context, { 'index.md': '# Home\n\n[[Missing]]' }), /\[\[Missing\]\] in index\.md/)
})

test('an empty starter has no content graph or sidebar entries', (context) => {
  const vault = fixture(context, { 'index.md': '# Home', 'graph.md': '# Graph' })
  assert.deepEqual(vault.graph, { nodes: [], edges: [] })
  assert.deepEqual(vault.sidebar, [])
})