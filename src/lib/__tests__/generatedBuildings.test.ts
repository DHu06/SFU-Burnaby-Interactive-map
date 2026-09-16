import { describe, expect, it } from 'vitest'
import { findRoute } from '@/lib/pathfinding'
import { buildings, GENERATED_BUILDING_IDS } from '@/data/buildings'
import { nodes } from '@/data/nodes'
import { rooms } from '@/data/rooms'
import { searchLocations } from '@/lib/search'

describe('generated buildings (campus-map expansion)', () => {
  it('generates two floors of rooms/nodes for every generated building', () => {
    for (const id of GENERATED_BUILDING_IDS) {
      const buildingRooms = rooms.filter((r) => r.buildingId === id)
      expect(buildingRooms).toHaveLength(4) // 2 floors x 2 rooms
      const buildingNodes = nodes.filter((n) => n.buildingId === id)
      // entrance + (hallway, 2 rooms, washroom, stairs, elevator) x 2 floors
      expect(buildingNodes).toHaveLength(1 + 6 * 2)
    }
  })

  it('routes across the campus plaza hub between two generated buildings', () => {
    const route = findRoute('lib-f1-101', 'scc-f1-101')
    expect(route).not.toBeNull()
    const nodeIds = route!.steps.map((s) => s.node.id)
    expect(nodeIds).toContain('campus-plaza')
    expect(nodeIds[0]).toBe('lib-f1-101')
    expect(nodeIds.at(-1)).toBe('scc-f1-101')
  })

  it('routes from a generated building to the hand-authored AQ', () => {
    const route = findRoute('wmc-f1-101', 'aq-f1-101')
    expect(route).not.toBeNull()
  })

  it('respects accessibility when routing through a generated building', () => {
    const route = findRoute('lib-f1-101', 'lib-f2-201', { accessibleOnly: true })
    expect(route).not.toBeNull()
    expect(route!.steps.some((s) => s.viaEdge?.type === 'stairs')).toBe(false)
  })

  it('every generated building is searchable by its real name', () => {
    for (const id of GENERATED_BUILDING_IDS) {
      const building = buildings.find((b) => b.id === id)!
      const results = searchLocations(building.name)
      expect(results.some((r) => r.buildingId === id)).toBe(true)
    }
  })
})
