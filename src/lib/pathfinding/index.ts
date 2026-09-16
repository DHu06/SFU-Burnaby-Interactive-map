import { nodes as allNodes } from '@/data/nodes'
import { edges as allEdges } from '@/data/edges'
import { buildGraph } from '@/lib/pathfinding/graph'
import { astar } from '@/lib/pathfinding/astar'
import type { FindRouteOptions, RouteResult } from '@/lib/pathfinding/types'

export type { RouteResult, RouteStep, FindRouteOptions, NavGraph } from '@/lib/pathfinding/types'
export { buildGraph } from '@/lib/pathfinding/graph'
export { astar } from '@/lib/pathfinding/astar'
export { dijkstra } from '@/lib/pathfinding/dijkstra'

/**
 * Public entry point used by the UI: computes a route over the full campus
 * graph using A*, optionally restricted to accessible (non-stairs) edges.
 * Keeping this here — rather than in a component — is what lets route
 * calculation be unit tested independently of React/Three.js.
 */
export function findRoute(
  startId: string,
  endId: string,
  options: FindRouteOptions = {},
): RouteResult | null {
  const nodesById = new Map(allNodes.map((n) => [n.id, n]))
  const graph = buildGraph(allNodes, allEdges, options)
  return astar(graph, nodesById, startId, endId)
}
