import type { NavEdge, NavNode } from '@/data/types'
import type { NavGraph, RouteResult } from '@/lib/pathfinding/types'
import { reconstructPath } from '@/lib/pathfinding/reconstructPath'

/**
 * Dijkstra's algorithm, weighted by estimated walking time (seconds). The
 * campus graph is small (tens of nodes), so a simple O(n²) linear-scan queue
 * is fast enough and keeps the implementation easy to verify against A*.
 */
export function dijkstra(
  graph: NavGraph,
  nodesById: Map<string, NavNode>,
  startId: string,
  endId: string,
): RouteResult | null {
  if (!graph.has(startId) || !graph.has(endId)) return null

  const timeCost = new Map<string, number>([[startId, 0]])
  const distanceCost = new Map<string, number>([[startId, 0]])
  const cameFrom = new Map<string, string>()
  const cameVia = new Map<string, NavEdge>()
  const visited = new Set<string>()
  const unvisited = new Set(graph.keys())

  while (unvisited.size > 0) {
    let currentId: string | null = null
    let currentCost = Infinity
    for (const id of unvisited) {
      const cost = timeCost.get(id) ?? Infinity
      if (cost < currentCost) {
        currentCost = cost
        currentId = id
      }
    }

    if (currentId === null || currentCost === Infinity) break
    if (currentId === endId) break

    unvisited.delete(currentId)
    visited.add(currentId)

    for (const { neighborId, edge } of graph.get(currentId) ?? []) {
      if (visited.has(neighborId)) continue
      const tentativeTime = currentCost + edge.walkTimeSec
      if (tentativeTime < (timeCost.get(neighborId) ?? Infinity)) {
        timeCost.set(neighborId, tentativeTime)
        distanceCost.set(neighborId, (distanceCost.get(currentId) ?? 0) + edge.distance)
        cameFrom.set(neighborId, currentId)
        cameVia.set(neighborId, edge)
      }
    }
  }

  if (!timeCost.has(endId)) return null

  return reconstructPath(
    startId,
    endId,
    cameFrom,
    cameVia,
    nodesById,
    distanceCost.get(endId) ?? 0,
    timeCost.get(endId) ?? 0,
  )
}
