import { describe, expect, it } from 'vitest'
import { findRoute } from '@/lib/pathfinding'
import { astar } from '@/lib/pathfinding/astar'
import { dijkstra } from '@/lib/pathfinding/dijkstra'
import { buildGraph } from '@/lib/pathfinding/graph'
import { nodes } from '@/data/nodes'
import { edges } from '@/data/edges'

const nodesById = new Map(nodes.map((n) => [n.id, n]))

describe('findRoute (A*)', () => {
  it('finds a route within a single floor', () => {
    const route = findRoute('aq-f1-101', 'aq-f1-102')
    expect(route).not.toBeNull()
    expect(route!.steps.at(0)?.node.id).toBe('aq-f1-101')
    expect(route!.steps.at(-1)?.node.id).toBe('aq-f1-102')
    expect(route!.totalDistance).toBeGreaterThan(0)
    expect(route!.totalTimeSec).toBeGreaterThan(0)
  })

  it('finds a route across floors within one building, via stairs or elevator', () => {
    const route = findRoute('aq-f1-101', 'aq-f2-201')
    expect(route).not.toBeNull()
    const viaTypes = route!.steps.map((s) => s.viaEdge?.type).filter(Boolean)
    expect(viaTypes.some((t) => t === 'stairs' || t === 'elevator')).toBe(true)
  })

  it('finds a route across buildings, using the outdoor path', () => {
    const route = findRoute('aq-f1-101', 'asb-f1-101')
    expect(route).not.toBeNull()
    const nodeIds = route!.steps.map((s) => s.node.id)
    expect(nodeIds).toContain('outdoor-wp1')
    expect(nodeIds).toContain('outdoor-wp2')
    expect(nodeIds[0]).toBe('aq-f1-101')
    expect(nodeIds.at(-1)).toBe('asb-f1-101')
  })

  it('returns null when either endpoint does not exist', () => {
    expect(findRoute('does-not-exist', 'aq-f1-101')).toBeNull()
    expect(findRoute('aq-f1-101', 'does-not-exist')).toBeNull()
  })

  it('returns the same optimal cost as Dijkstra', () => {
    const graph = buildGraph(nodes, edges)
    const a = astar(graph, nodesById, 'aq-f2-202', 'asb-f2-201')
    const d = dijkstra(graph, nodesById, 'aq-f2-202', 'asb-f2-201')
    expect(a).not.toBeNull()
    expect(d).not.toBeNull()
    expect(a!.totalTimeSec).toBeCloseTo(d!.totalTimeSec, 5)
  })
})

describe('accessible-route filtering', () => {
  it('avoids stairs edges when accessibleOnly is set', () => {
    const route = findRoute('aq-f1-101', 'aq-f2-201', { accessibleOnly: true })
    expect(route).not.toBeNull()
    const usedStairs = route!.steps.some((s) => s.viaEdge?.type === 'stairs')
    expect(usedStairs).toBe(false)
    const usedElevator = route!.steps.some((s) => s.viaEdge?.type === 'elevator')
    expect(usedElevator).toBe(true)
  })

  it('excludes all stairs edges from the accessible-only graph', () => {
    const graph = buildGraph(nodes, edges, { accessibleOnly: true })
    for (const adjacency of graph.values()) {
      for (const { edge } of adjacency) {
        expect(edge.accessible).toBe(true)
      }
    }
  })

  it('returns null if the only path requires an inaccessible edge', () => {
    // Synthetic two-node graph whose sole connection is a stairs edge —
    // the demo campus data always has an elevator alternative, so this
    // isolates the "no accessible route exists" case directly.
    const a = nodes.find((n) => n.id === 'aq-f1-stairs')!
    const b = nodes.find((n) => n.id === 'aq-f2-stairs')!
    const stairsOnlyEdges = edges.filter((e) => e.id === 'e-aq-stairs-1-2')
    const tinyNodesById = new Map([[a.id, a], [b.id, b]])
    const graph = buildGraph([a, b], stairsOnlyEdges, { accessibleOnly: true })
    const route = astar(graph, tinyNodesById, a.id, b.id)
    expect(route).toBeNull()
  })
})
