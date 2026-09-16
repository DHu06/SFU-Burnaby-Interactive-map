import type { NavEdge, NavNode } from '@/data/types'
import { WALK_SPEED_MPS } from '@/data/walkingSpeeds'
import type { NavGraph, RouteResult } from '@/lib/pathfinding/types'
import { reconstructPath } from '@/lib/pathfinding/reconstructPath'

function straightLineDistance(a: NavNode, b: NavNode): number {
  const [ax, ay, az] = a.position
  const [bx, by, bz] = b.position
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2)
}

/**
 * Heuristic: straight-line distance at the fastest possible pace (normal
 * hallway walking speed). Real paths are never faster than this, so the
 * heuristic is admissible and A* is guaranteed to find the optimal route.
 */
function heuristicTimeSec(a: NavNode, b: NavNode): number {
  return straightLineDistance(a, b) / WALK_SPEED_MPS
}

/**
 * A* search weighted by estimated walking time (seconds), the primary
 * pathfinding algorithm used by the app (see lib/pathfinding/index.ts).
 * Falls back to a plain linear-scan open set — the demo graph has only a
 * few dozen nodes, so a binary heap isn't worth the added complexity.
 */
export function astar(
  graph: NavGraph,
  nodesById: Map<string, NavNode>,
  startId: string,
  endId: string,
): RouteResult | null {
  const startNode = nodesById.get(startId)
  const endNode = nodesById.get(endId)
  if (!graph.has(startId) || !graph.has(endId) || !startNode || !endNode) return null

  const gScore = new Map<string, number>([[startId, 0]])
  const distanceScore = new Map<string, number>([[startId, 0]])
  const fScore = new Map<string, number>([[startId, heuristicTimeSec(startNode, endNode)]])
  const cameFrom = new Map<string, string>()
  const cameVia = new Map<string, NavEdge>()
  const openSet = new Set<string>([startId])
  const closedSet = new Set<string>()

  while (openSet.size > 0) {
    let currentId: string | null = null
    let currentF = Infinity
    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity
      if (f < currentF) {
        currentF = f
        currentId = id
      }
    }
    if (currentId === null) break

    if (currentId === endId) {
      return reconstructPath(
        startId,
        endId,
        cameFrom,
        cameVia,
        nodesById,
        distanceScore.get(endId) ?? 0,
        gScore.get(endId) ?? 0,
      )
    }

    openSet.delete(currentId)
    closedSet.add(currentId)

    for (const { neighborId, edge } of graph.get(currentId) ?? []) {
      if (closedSet.has(neighborId)) continue
      const tentativeG = (gScore.get(currentId) ?? Infinity) + edge.walkTimeSec
      if (tentativeG < (gScore.get(neighborId) ?? Infinity)) {
        cameFrom.set(neighborId, currentId)
        cameVia.set(neighborId, edge)
        gScore.set(neighborId, tentativeG)
        distanceScore.set(neighborId, (distanceScore.get(currentId) ?? 0) + edge.distance)
        const neighborNode = nodesById.get(neighborId)
        fScore.set(neighborId, tentativeG + (neighborNode ? heuristicTimeSec(neighborNode, endNode) : 0))
        openSet.add(neighborId)
      }
    }
  }

  return null
}
