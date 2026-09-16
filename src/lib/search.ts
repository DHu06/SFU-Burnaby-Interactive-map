import { nodes } from '@/data/nodes'
import { getBuildingById } from '@/data/buildings'
import { getRoomById } from '@/data/rooms'
import type { NodeType } from '@/data/types'

export interface SearchableLocation {
  nodeId: string
  /** Primary label, e.g. "AQ-101 Lecture Hall" or "AQ Main Entrance". */
  label: string
  /** Secondary line, e.g. "Academic Quadrangle · Floor 1". */
  subtitle: string
  buildingId: string | null
  floor: string | null
  type: NodeType
  accessible: boolean
}

let cache: SearchableLocation[] | null = null

/**
 * Flattens the nav-graph nodes (joined with building/room data) into a single
 * searchable list. Only "destination-worthy" node types are surfaced — raw
 * hallway waypoints are excluded since nobody searches for a hallway segment.
 */
export function getSearchableLocations(): SearchableLocation[] {
  if (cache) return cache

  const searchableTypes: NodeType[] = ['classroom', 'entrance', 'stairs', 'elevator', 'washroom']

  cache = nodes
    .filter((n) => searchableTypes.includes(n.type))
    .map((n) => {
      const building = n.buildingId ? getBuildingById(n.buildingId) : undefined
      const room = n.roomId ? getRoomById(n.roomId) : undefined
      const label = room ? room.name : n.name
      const subtitleParts = [building?.name, n.floor ? `Floor ${n.floor}` : null].filter(Boolean)
      return {
        nodeId: n.id,
        label,
        subtitle: subtitleParts.join(' · ') || 'Outdoor',
        buildingId: n.buildingId,
        floor: n.floor,
        type: n.type,
        accessible: n.accessible,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))

  return cache
}

/** Simple case-insensitive substring match, ranking "starts with" above "contains". */
export function searchLocations(query: string, limit = 8): SearchableLocation[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return []

  const scored = getSearchableLocations()
    .map((loc) => {
      const haystack = `${loc.label} ${loc.subtitle}`.toLowerCase()
      if (haystack.startsWith(trimmed) || loc.label.toLowerCase().startsWith(trimmed)) {
        return { loc, score: 0 }
      }
      if (haystack.includes(trimmed)) {
        return { loc, score: 1 }
      }
      return null
    })
    .filter((x): x is { loc: SearchableLocation; score: number } => x !== null)
    .sort((a, b) => a.score - b.score || a.loc.label.localeCompare(b.loc.label))

  return scored.slice(0, limit).map((x) => x.loc)
}

export function getLocationByNodeId(nodeId: string): SearchableLocation | undefined {
  return getSearchableLocations().find((loc) => loc.nodeId === nodeId)
}
