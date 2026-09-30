import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import GraphAside from './GraphAside.vue'
import GraphView from './GraphView.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'aside-top': () => h(GraphAside)
  }),
  enhanceApp({ app }) {
    app.component('GraphView', GraphView)
  }
} satisfies Theme