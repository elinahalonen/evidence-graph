<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { Focus, RotateCcw, PanelRight, Maximize, Minimize, Plus, Minus, ArrowUpRight } from '@lucide/vue'
import GraphCanvas from './GraphCanvas.vue'
import { graphData, type GraphData, type GraphNodeData } from './graph-data'

const props = withDefaults(defineProps<{
  data?: GraphData
  title?: string
  initialSelection?: string
}>(), { data: () => graphData, title: 'Graph' })
const router = useRouter()
const wrapper = ref<HTMLElement | null>(null)
const surface = ref<InstanceType<typeof GraphCanvas> | null>(null)
const query = ref('')
const selectedId = ref<string | null>(props.initialSelection || null)
const detailsOpen = ref(false)
const fullscreen = ref(false)
const fullscreenAvailable = ref(false)
const fullscreenError = ref('')
const panelId = useId()
const selectedNode = computed(() => props.data.nodes.find((node) => node.id === selectedId.value))
const results = computed(() => {
  const value = query.value.trim().toLowerCase()
  return props.data.nodes.filter((node) => `${node.label} ${node.id}`.toLowerCase().includes(value))
})
const connections = computed(() => {
  const ids = new Set<string>()
  for (const edge of props.data.edges) {
    if (edge.source === selectedId.value) ids.add(edge.target)
    if (edge.target === selectedId.value) ids.add(edge.source)
  }
  return props.data.nodes.filter((node) => ids.has(node.id))
})

function selectNode(id: string | null, center = false) {
  selectedId.value = id
  if (id) detailsOpen.value = true
  if (id && center) nextTick(() => surface.value?.centerOn(id))
}

function reset() {
  query.value = ''
  selectedId.value = null
  surface.value?.reset()
}

function openNode(node: GraphNodeData) {
  router.go(withBase(node.route))
}

async function toggleFullscreen() {
  fullscreenError.value = ''
  try {
    if (document.fullscreenElement === wrapper.value) await document.exitFullscreen()
    else await wrapper.value?.requestFullscreen()
  } catch {
    fullscreenError.value = 'Fullscreen is unavailable in this browser.'
  }
}

function fullscreenChanged() {
  fullscreen.value = document.fullscreenElement === wrapper.value
  nextTick(() => surface.value?.fit())
}

onMounted(() => {
  fullscreenAvailable.value = Boolean(document.fullscreenEnabled)
  document.addEventListener('fullscreenchange', fullscreenChanged)
})
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', fullscreenChanged))
</script>

<template>
  <section ref="wrapper" class="graph-view">
    <header class="graph-header">
      <h1>{{ title }}</h1>
      <div class="graph-toolbar" aria-label="Graph controls">
        <input v-model="query" type="search" aria-label="Find a page in the graph" placeholder="Find a page"
          @input="detailsOpen = true" />
        <button class="graph-tool" type="button" title="Zoom in" aria-label="Zoom in" @click="surface?.zoomBy(1.2)"><Plus :size="18" /></button>
        <button class="graph-tool" type="button" title="Zoom out" aria-label="Zoom out" @click="surface?.zoomBy(1 / 1.2)"><Minus :size="18" /></button>
        <button class="graph-tool" type="button" title="Fit graph" aria-label="Fit graph" @click="surface?.fit()"><Focus :size="18" /></button>
        <button class="graph-tool" type="button" title="Reset graph" aria-label="Reset graph" @click="reset"><RotateCcw :size="18" /></button>
        <button class="graph-tool" type="button" title="Page details" aria-label="Page details" :aria-expanded="detailsOpen"
          :aria-controls="panelId" @click="detailsOpen = !detailsOpen"><PanelRight :size="18" /></button>
        <button v-if="fullscreenAvailable" class="graph-tool" type="button" :title="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
          :aria-label="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'" @click="toggleFullscreen">
          <Minimize v-if="fullscreen" :size="18" /><Maximize v-else :size="18" />
        </button>
      </div>
    </header>
    <p v-if="fullscreenError" role="status">{{ fullscreenError }}</p>
    <div class="graph-layout" :class="{ 'has-details': detailsOpen }">
      <div class="graph-stage">
        <GraphCanvas ref="surface" :data="data" :selected-id="selectedId" :query="query" @select="selectNode" @open="openNode" />
        <p v-if="!data.nodes.length" class="graph-empty">No pages yet.</p>
      </div>
      <aside v-if="detailsOpen" :id="panelId" class="graph-details" aria-label="Page details">
        <template v-if="selectedNode">
          <h2>{{ selectedNode.label }}</h2>
          <a class="graph-open" :href="withBase(selectedNode.route)">Open page <ArrowUpRight :size="16" /></a>
          <h3>Connected pages</h3>
          <ul class="graph-list">
            <li v-for="node in connections" :key="node.id"><button type="button" @click="selectNode(node.id, true)">{{ node.label }}</button></li>
          </ul>
          <p v-if="!connections.length">No connections.</p>
        </template>
        <h2>{{ query ? 'Search results' : 'Pages' }}</h2>
        <p v-if="!results.length" role="status">No pages found.</p>
        <ul class="graph-list">
          <li v-for="node in results" :key="node.id"><button type="button" @click="selectNode(node.id, true)">{{ node.label }}</button></li>
        </ul>
      </aside>
    </div>
    <footer class="graph-status"><span>{{ data.nodes.length }} pages</span><span>{{ data.edges.length }} connections</span></footer>
  </section>
</template>

<style scoped>
.graph-view { box-sizing: border-box; width: 100%; max-width: 1440px; margin: 0 auto; padding: 24px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.graph-view:fullscreen { max-width: none; height: 100%; overflow: auto; }
.graph-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.graph-header h1 { margin: 0; font-size: 24px; line-height: 1.3; overflow-wrap: anywhere; }
.graph-toolbar { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; max-width: 100%; }
.graph-toolbar input { width: 220px; max-width: 100%; min-width: 0; height: 40px; border: 1px solid var(--vp-c-divider); border-radius: 4px; padding: 0 12px; background: var(--vp-c-bg); color: inherit; font: inherit; }
.graph-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; }
.graph-layout.has-details { grid-template-columns: minmax(0, 1fr) minmax(0, 260px); }
.graph-stage { position: relative; min-width: 0; height: min(65vh, 640px); min-height: 320px; background-color: var(--vp-c-bg-soft); background-image: radial-gradient(var(--vp-c-divider) 0.7px, transparent 0.7px); background-size: 20px 20px; }
.graph-empty { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; color: var(--vp-c-text-2); pointer-events: none; }
.graph-details { min-width: 0; max-height: 640px; overflow: auto; overflow-wrap: anywhere; }
.graph-details h2 { margin: 0 0 12px; font-size: 18px; }
.graph-details h2:not(:first-child), .graph-details h3 { margin-top: 24px; }
.graph-details h3 { font-size: 14px; }
.graph-open { display: inline-flex; align-items: center; gap: 6px; color: var(--vp-c-brand-1); text-decoration: underline; }
.graph-status { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 12px; font-size: 12px; color: var(--vp-c-text-2); }
@media (max-width: 760px) {
  .graph-view { padding: 20px 16px; }
  .graph-layout.has-details { grid-template-columns: minmax(0, 1fr); }
  .graph-toolbar { width: 100%; }
  .graph-toolbar input { width: 100%; }
  .graph-details { max-height: 360px; }
}
</style>