<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import {
  forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation,
  type Simulation, type SimulationNodeDatum
} from 'd3-force'
import type { GraphData, GraphNodeData } from './graph-data'

type GraphNode = GraphNodeData & SimulationNodeDatum
type GraphLink = { source: string | GraphNode; target: string | GraphNode }

const props = defineProps<{
  data: GraphData
  selectedId?: string | null
  query?: string
  compact?: boolean
}>()
const emit = defineEmits<{
  select: [id: string | null]
  open: [node: GraphNodeData]
}>()
const { isDark } = useData()
const canvas = ref<HTMLCanvasElement | null>(null)
const hovered = ref<{ label: string; left: number; top: number } | null>(null)
let nodes: GraphNode[] = []
let links: GraphLink[] = []
let simulation: Simulation<GraphNode, GraphLink> | null = null
let observer: ResizeObserver | null = null
let frame = 0
let width = 0
let height = 0
let zoom = 1
let pan = { x: 0, y: 0 }
let pointer: { startX: number; startY: number; panX: number; panY: number; node: GraphNode | null } | null = null

function nodeId(value: string | GraphNode) {
  return typeof value === 'string' ? value : value.id
}

function radius(node: GraphNode) {
  return (props.compact ? 3 : 5) + Math.min(5, Math.sqrt(node.degree))
}

function scheduleDraw() {
  if (frame) return
  frame = requestAnimationFrame(() => { frame = 0; draw() })
}

function draw() {
  const element = canvas.value
  const context = element?.getContext('2d')
  if (!element || !context || !width || !height) return
  const ratio = window.devicePixelRatio || 1
  const styles = getComputedStyle(element)
  const textColor = styles.getPropertyValue('--vp-c-text-1').trim()
  const background = styles.getPropertyValue('--vp-c-bg').trim()
  const query = props.query?.trim().toLowerCase() || ''
  const neighbors = new Set<string>()
  for (const link of links) {
    if (nodeId(link.source) === props.selectedId) neighbors.add(nodeId(link.target))
    if (nodeId(link.target) === props.selectedId) neighbors.add(nodeId(link.source))
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)
  context.save()
  context.translate(width / 2 + pan.x, height / 2 + pan.y)
  context.scale(zoom, zoom)
  for (const link of links) {
    if (typeof link.source === 'string' || typeof link.target === 'string') continue
    const source = link.source
    const target = link.target
    if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) continue
    const active = source.id === props.selectedId || target.id === props.selectedId
    context.strokeStyle = active ? '#008d83' : isDark.value ? '#676b72' : '#bec2c9'
    context.globalAlpha = props.selectedId && !active ? 0.3 : 1
    context.lineWidth = (active ? 1.8 : 1) / zoom
    context.beginPath()
    context.moveTo(source.x, source.y)
    context.lineTo(target.x, target.y)
    context.stroke()
  }
  for (const node of nodes) {
    if (node.x === undefined || node.y === undefined) continue
    const selected = node.id === props.selectedId
    const matches = !query || `${node.label} ${node.id}`.toLowerCase().includes(query)
    const connected = selected || neighbors.has(node.id)
    context.globalAlpha = !matches || (props.selectedId && !connected) ? 0.25 : 1
    context.beginPath()
    context.arc(node.x, node.y, radius(node) + (selected ? 2 : 0), 0, Math.PI * 2)
    context.fillStyle = selected ? '#d66a38' : connected ? '#008d83' : '#5382b7'
    context.fill()
    context.strokeStyle = background
    context.lineWidth = 2 / zoom
    context.stroke()
    if (!props.compact && (nodes.length <= 12 || selected || (query && matches) || zoom > 1.8)) {
      context.fillStyle = textColor
      context.font = `${12 / zoom}px ${styles.fontFamily}`
      context.fillText(node.label, node.x + radius(node) + 6 / zoom, node.y + 4 / zoom, 170 / zoom)
    }
  }
  context.restore()
  context.globalAlpha = 1
}

function fit() {
  if (!nodes.length || !width || !height) return
  const minX = Math.min(...nodes.map((node) => node.x ?? 0))
  const maxX = Math.max(...nodes.map((node) => node.x ?? 0))
  const minY = Math.min(...nodes.map((node) => node.y ?? 0))
  const maxY = Math.max(...nodes.map((node) => node.y ?? 0))
  const padding = props.compact ? 36 : 120
  zoom = Math.min(1.5, Math.max(0.05, Math.min(
    (width - padding) / Math.max(1, maxX - minX),
    (height - padding) / Math.max(1, maxY - minY)
  )))
  pan = { x: -(minX + maxX) / 2 * zoom, y: -(minY + maxY) / 2 * zoom }
  scheduleDraw()
}

function resize() {
  if (!canvas.value) return
  const rectangle = canvas.value.getBoundingClientRect()
  width = rectangle.width
  height = rectangle.height
  canvas.value.width = Math.max(1, Math.floor(width * (window.devicePixelRatio || 1)))
  canvas.value.height = Math.max(1, Math.floor(height * (window.devicePixelRatio || 1)))
  fit()
  scheduleDraw()
}

function start() {
  simulation?.stop()
  nodes = props.data.nodes.map((node) => ({ ...node }))
  links = props.data.edges.map((edge) => ({ ...edge }))
  simulation = forceSimulation(nodes)
    .force('link', forceLink<GraphNode, GraphLink>(links).id((node) => node.id).distance(props.compact ? 38 : 130))
    .force('charge', forceManyBody().strength(props.compact ? -50 : -240))
    .force('collide', forceCollide<GraphNode>().radius((node) => radius(node) + 12))
    .force('center', forceCenter(0, 0))
    .stop()
  simulation.tick(180)
  simulation.on('tick', scheduleDraw)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) simulation.restart()
  resize()
}

function centerOn(id: string) {
  const node = nodes.find((entry) => entry.id === id)
  if (!node) return
  pan = { x: -(node.x ?? 0) * zoom, y: -(node.y ?? 0) * zoom }
  scheduleDraw()
}

function zoomBy(factor: number) {
  zoom = Math.max(0.05, Math.min(4, zoom * factor))
  scheduleDraw()
}

function point(event: MouseEvent | PointerEvent) {
  const rectangle = canvas.value!.getBoundingClientRect()
  return { x: event.clientX - rectangle.left, y: event.clientY - rectangle.top }
}

function world(position: { x: number; y: number }) {
  return { x: (position.x - width / 2 - pan.x) / zoom, y: (position.y - height / 2 - pan.y) / zoom }
}

function hit(position: { x: number; y: number }) {
  const location = world(position)
  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index]
    if (Math.hypot(location.x - (node.x ?? 0), location.y - (node.y ?? 0)) < radius(node) + 7 / zoom) return node
  }
  return null
}

function pointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  const position = point(event)
  const node = hit(position)
  pointer = { startX: position.x, startY: position.y, panX: pan.x, panY: pan.y, node }
  canvas.value?.setPointerCapture(event.pointerId)
  if (node) { node.fx = node.x; node.fy = node.y }
}

function pointerMove(event: PointerEvent) {
  const position = point(event)
  const node = hit(position)
  hovered.value = node && !pointer
    ? { label: node.label, left: Math.max(8, Math.min(position.x + 14, width - 190)), top: Math.min(position.y + 14, height - 60) }
    : null
  if (pointer?.node) {
    const location = world(position)
    pointer.node.fx = location.x
    pointer.node.fy = location.y
    simulation?.alphaTarget(0.1).restart()
  } else if (pointer) {
    pan = { x: pointer.panX + position.x - pointer.startX, y: pointer.panY + position.y - pointer.startY }
  }
  scheduleDraw()
}

function pointerUp(event: PointerEvent) {
  if (!pointer) return
  const position = point(event)
  if (event.type === 'pointerup' && Math.hypot(position.x - pointer.startX, position.y - pointer.startY) < 5) {
    emit('select', pointer.node?.id || null)
  }
  if (pointer.node) { pointer.node.fx = null; pointer.node.fy = null }
  simulation?.alphaTarget(0)
  pointer = null
  if (canvas.value?.hasPointerCapture(event.pointerId)) canvas.value.releasePointerCapture(event.pointerId)
}

function wheel(event: WheelEvent) {
  const position = point(event)
  const before = world(position)
  zoomBy(event.deltaY > 0 ? 0.9 : 1.1)
  const after = world(position)
  pan.x += (after.x - before.x) * zoom
  pan.y += (after.y - before.y) * zoom
}

function doubleClick(event: MouseEvent) {
  const node = hit(point(event))
  if (node) emit('open', node)
}

watch(() => [props.selectedId, props.query, isDark.value], scheduleDraw)
watch(() => props.data, start)
onMounted(() => {
  start()
  observer = new ResizeObserver(resize)
  if (canvas.value) observer.observe(canvas.value)
})
onBeforeUnmount(() => {
  simulation?.stop()
  observer?.disconnect()
  if (frame) cancelAnimationFrame(frame)
})
defineExpose({ fit, reset: start, zoomBy, centerOn })
</script>

<template>
  <div class="graph-canvas">
    <canvas ref="canvas" role="img" :aria-label="`${data.nodes.length} pages and ${data.edges.length} connections`"
      @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp"
      @pointerleave="hovered = null" @wheel.prevent="wheel" @dblclick="doubleClick" />
    <span v-if="hovered" class="graph-tooltip" :style="{ left: `${hovered.left}px`, top: `${hovered.top}px` }">
      {{ hovered.label }}
    </span>
  </div>
</template>

<style scoped>
.graph-canvas { position: relative; width: 100%; height: 100%; min-width: 0; }
canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: grab; }
canvas:active { cursor: grabbing; }
.graph-tooltip { position: absolute; pointer-events: none; max-width: 180px; padding: 6px 8px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 12px; line-height: 1.4; overflow-wrap: anywhere; }
</style>