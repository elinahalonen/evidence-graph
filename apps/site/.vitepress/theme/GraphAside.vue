<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useData, useRouter, withBase } from 'vitepress'
import { Expand, Network, X } from '@lucide/vue'
import GraphCanvas from './GraphCanvas.vue'
import GraphView from './GraphView.vue'
import { graphData } from './graph-data'

const { page } = useData()
const router = useRouter()
const currentId = computed(() => page.value.relativePath)
const currentNode = computed(() => graphData.nodes.find((node) => node.id === currentId.value))
const localGraph = computed(() => {
  const ids = new Set([currentId.value])
  for (const edge of graphData.edges) {
    if (edge.source === currentId.value) ids.add(edge.target)
    if (edge.target === currentId.value) ids.add(edge.source)
  }
  return {
    nodes: graphData.nodes.filter((node) => ids.has(node.id)),
    edges: graphData.edges.filter((edge) => ids.has(edge.source) && ids.has(edge.target))
  }
})
const neighbors = computed(() => localGraph.value.nodes.filter((node) => node.id !== currentId.value))
const dialog = ref<HTMLDialogElement | null>(null)
const modalOpen = ref(false)

async function openDialog() {
  modalOpen.value = true
  await nextTick()
  dialog.value?.showModal()
}

function openNode(id: string | null) {
  const node = graphData.nodes.find((entry) => entry.id === id)
  if (node) router.go(withBase(node.route))
}

watch(currentId, () => dialog.value?.close())
</script>

<template>
  <section v-if="currentNode" class="graph-aside" aria-label="Local graph">
    <header>
      <h2>Local graph</h2>
      <div class="graph-aside-actions">
        <button class="graph-tool" type="button" title="Expand local graph" aria-label="Expand local graph" @click="openDialog"><Expand :size="16" /></button>
        <a class="graph-tool" :href="withBase('/graph')" title="Open full graph" aria-label="Open full graph"><Network :size="16" /></a>
      </div>
    </header>
    <div class="local-canvas"><GraphCanvas :data="localGraph" :selected-id="currentId" compact @select="openNode" /></div>
    <details>
      <summary>{{ neighbors.length }} connected pages</summary>
      <ul class="graph-list">
        <li v-for="node in neighbors" :key="node.id"><a :href="withBase(node.route)">{{ node.label }}</a></li>
      </ul>
    </details>
    <dialog ref="dialog" class="graph-dialog" aria-label="Local graph" @close="modalOpen = false">
      <div class="graph-dialog-actions"><button class="graph-tool" type="button" title="Close local graph" aria-label="Close local graph" @click="dialog?.close()"><X :size="20" /></button></div>
      <GraphView v-if="modalOpen" :data="localGraph" :initial-selection="currentId" :title="currentNode.label" />
    </dialog>
  </section>
</template>

<style scoped>
.graph-aside { margin-bottom: 24px; }
.graph-aside header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.graph-aside h2 { margin: 0; font-size: 13px; font-weight: 600; }
.graph-aside-actions { display: flex; gap: 4px; }
.local-canvas { height: 180px; width: 100%; background: var(--vp-c-bg-soft); margin-top: 8px; }
summary { cursor: pointer; font-size: 12px; color: var(--vp-c-text-2); margin-top: 8px; }
.graph-dialog { box-sizing: border-box; width: min(1100px, calc(100vw - 32px)); max-width: none; max-height: calc(100dvh - 32px); margin: auto; padding: 0; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.graph-dialog::backdrop { background: rgb(0 0 0 / 45%); }
.graph-dialog-actions { display: flex; justify-content: flex-end; padding: 12px 12px 0; }
</style>