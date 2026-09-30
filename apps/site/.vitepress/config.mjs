import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { createVault, siteBase } from './vault.mjs'

const vaultDir = fileURLToPath(new URL('../../../vault', import.meta.url))
const vault = createVault(vaultDir)

export default defineConfig({
  srcDir: vaultDir,
  srcExclude: ['**/.*', '**/.*/**', '**/node_modules/**', '**/public/**'],
  base: siteBase(process.env.VITEPRESS_BASE),
  title: 'Site',
  description: '',
  head: [['link', { rel: 'icon', href: 'data:,' }]],
  cleanUrls: true,
  vite: {
    define: { __SITE_GRAPH_DATA__: JSON.stringify(vault.graph) }
  },
  markdown: {
    config: vault.wikiLinks
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/using-the-site' },
      { text: 'Graph', link: '/graph' }
    ],
    sidebar: vault.sidebar,
    search: { provider: 'local' }
  }
})