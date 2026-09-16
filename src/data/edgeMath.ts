import type { EdgeType } from '@/data/types'
import { ELEVATOR_WAIT_SEC, STAIR_SPEED_MPS, WALK_SPEED_MPS } from '@/data/walkingSpeeds'

/** Shared by hand-authored edges (edges.ts) and generated ones (generateBuildingGraph.ts) so timing stays consistent everywhere. */
export function distanceBetween(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)
}

export function estimateWalkTimeSec(type: EdgeType, dist: number): number {
  if (type === 'elevator') return ELEVATOR_WAIT_SEC
  if (type === 'stairs') return Math.round(dist / STAIR_SPEED_MPS)
  return Math.round(dist / WALK_SPEED_MPS)
}
