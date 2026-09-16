/**
 * Campus data model.
 *
 * Everything here is DEMONSTRATION data for the MVP (Academic Quadrangle +
 * Applied Sciences Building) unless a dataset's `source` field says otherwise.
 * Coordinates are illustrative, not surveyed — see README "Accuracy" section
 * before treating any of this as a real floor plan.
 */

export type NodeType =
  | 'classroom'
  | 'hallway'
  | 'entrance'
  | 'stairs'
  | 'elevator'
  | 'washroom'
  | 'outdoor'

export type EdgeType = 'hallway' | 'stairs' | 'elevator' | 'outdoor' | 'door'

export interface DataProvenance {
  /** Where this record came from, e.g. "Demonstration data — not verified SFU floor plans". */
  source: string
  /** ISO date string of when this record was last reviewed/updated. */
  lastUpdated: string
}

export interface Building extends DataProvenance {
  id: string
  name: string
  /** Short code shown in room labels, e.g. "AQ". */
  code: string
  description: string
  /** Ordered floor identifiers, ground-up, e.g. ["1", "2"]. */
  floors: string[]
  /** Outdoor footprint center + size for the placeholder 3D model, in scene units. */
  footprint: {
    position: [number, number, number]
    size: [number, number, number]
  }
}

/**
 * A building shown for campus-layout context only — no indoor nav data
 * (no floors/rooms/nodes). Positioned approximately from a reference campus
 * map, purely so the 3D scene reads as "campus" rather than a few isolated
 * boxes. Never searchable or routable.
 */
export interface BackdropBuilding {
  id: string
  name: string
  position: [number, number, number]
  size: [number, number, number]
}

export interface Room extends DataProvenance {
  id: string
  buildingId: string
  floor: string
  roomNumber: string
  name: string
  /** True if this room can be reached without using stairs. */
  accessible: boolean
}

export interface NavNode extends DataProvenance {
  id: string
  /** Human-readable label used in search results and directions. */
  name: string
  buildingId: string | null
  /** Null for outdoor nodes that aren't tied to a single floor. */
  floor: string | null
  roomId: string | null
  type: NodeType
  position: [number, number, number]
  accessible: boolean
}

export interface NavEdge extends DataProvenance {
  id: string
  from: string
  to: string
  /** Distance in metres. */
  distance: number
  /** Estimated walking time in seconds. */
  walkTimeSec: number
  type: EdgeType
  accessible: boolean
  bidirectional: boolean
}
