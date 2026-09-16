import type { NavEdge, NavNode } from '@/data/types'
import type { FindRouteOptions, NavGraph } from '@/lib/pathfinding/types'

/**
 * Builds an adjacency list from the raw node/edge data. Kept separate from the
 * search algorithms so both A* and Dijkstra can share one graph representation,
 * and so accessibility filtering happens in exactly one place.
 */
export function buildGraph(
  nodes: NavNode[],
  edges: NavEdge[],
  options: FindRouteOptions = {},
): NavGraph {
  const graph: NavGraph = new Map(nodes.map((n) => [n.id, []]))

  for (const edge of edges) {
    if (options.accessibleOnly && !edge.accessible) continue
    if (!graph.has(edge.from) || !graph.has(edge.to)) continue

    graph.get(edge.from)!.push({ neighborId: edge.to, edge })
    if (edge.bidirectional) {
      graph.get(edge.to)!.push({ neighborId: edge.from, edge })
    }
  }

  return graph
}
