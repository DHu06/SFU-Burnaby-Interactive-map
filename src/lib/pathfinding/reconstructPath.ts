import type { NavEdge, NavNode } from '@/data/types'
import type { RouteResult, RouteStep } from '@/lib/pathfinding/types'

/** Walks the `cameFrom`/`cameVia` maps produced by a search back into an ordered route. */
export function reconstructPath(
  startId: string,
  endId: string,
  cameFrom: Map<string, string>,
  cameVia: Map<string, NavEdge>,
  nodesById: Map<string, NavNode>,
  totalDistance: number,
  totalTimeSec: number,
): RouteResult {
  const stepsReversed: RouteStep[] = []
  let currentId: string | undefined = endId

  while (currentId !== undefined) {
    const node = nodesById.get(currentId)
    if (!node) break
    stepsReversed.push({ node, viaEdge: cameVia.get(currentId) })
    if (currentId === startId) break
    currentId = cameFrom.get(currentId)
  }

  const steps = stepsReversed.reverse()

  return { steps, totalDistance, totalTimeSec }
}
