export type GraphNodeData = {
  id: string
  label: string
  route: string
  degree: number
}

export type GraphData = {
  nodes: GraphNodeData[]
  edges: { source: string; target: string }[]
}

declare const __SITE_GRAPH_DATA__: GraphData

export const graphData = __SITE_GRAPH_DATA__