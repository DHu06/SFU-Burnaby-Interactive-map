import type { NavEdge, NavNode } from '@/data/types'

export interface AdjacencyEntry {
  neighborId: string
  edge: NavEdge
}

/** Adjacency-list representation of the navigation graph, keyed by node ID. */
export type NavGraph = Map<string, AdjacencyEntry[]>

export interface RouteStep {
  node: NavNode
  /** The edge taken to arrive at `node` from the previous step (undefined for the first step). */
  viaEdge?: NavEdge
}

export interface RouteResult {
  steps: RouteStep[]
  totalDistance: number
  totalTimeSec: number
}

export interface FindRouteOptions {
  /** When true, edges marked `accessible: false` (e.g. stairs) are excluded from the graph. */
  accessibleOnly?: boolean
}
