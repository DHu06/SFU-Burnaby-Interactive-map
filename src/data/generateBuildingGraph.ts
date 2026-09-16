import type { Building, NavEdge, NavNode, Room } from '@/data/types'
import { distanceBetween, estimateWalkTimeSec } from '@/data/edgeMath'

const DEMO_SOURCE = 'Demonstration data — not verified SFU floor plans (building name is real, this internal layout is not)'
const LAST_UPDATED = '2026-09-15'

// Relative (dx, dz) offsets from a building's footprint center, tuned against
// the Academic Quadrangle's hand-authored layout (a 24×20 footprint) and
// scaled per-building so they land inside footprints of other sizes too.
const BASE_FOOTPRINT: [number, number] = [24, 20]
const LOCAL_OFFSETS = {
  entrance: [10, 2] as const,
  hallway: [0, 2] as const,
  classroomA: [-6, -4] as const,
  classroomB: [-6, 8] as const,
  washroom: [6, 8] as const,
  stairs: [4, -6] as const,
  elevator: [8, -6] as const,
}

const DEFAULT_ROOM_NAMES: Record<string, [string, string]> = {
  '1': ['Lecture Hall', 'Seminar Room'],
  '2': ['Classroom', 'Faculty Office'],
}

interface GeneratedBuildingGraph {
  rooms: Room[]
  nodes: NavNode[]
  edges: NavEdge[]
}

/**
 * Produces a standard 2-room-per-floor indoor layout (entrance, hallway,
 * 2 classrooms, washroom, stairs, elevator per floor) for a building, using
 * the same node/edge ID convention and shape as the hand-authored Academic
 * Quadrangle / Applied Sciences Building data. Used for buildings where we
 * only know the real name and rough footprint (see src/data/buildings.ts) —
 * everything inside is fabricated demo data, same as AQ/ASB.
 */
export function generateStandardBuildingGraph(
  building: Building,
  roomNames: Record<string, [string, string]> = DEFAULT_ROOM_NAMES,
): GeneratedBuildingGraph {
  const { id, code, name, floors, footprint } = building
  const [cx, cy, cz] = footprint.position
  const [width, height, depth] = footprint.size
  const scaleX = width / BASE_FOOTPRINT[0]
  const scaleZ = depth / BASE_FOOTPRINT[1]
  const floorHeight = height / floors.length

  const rooms: Room[] = []
  const nodes: NavNode[] = []
  const edges: NavEdge[] = []

  function pos(offset: readonly [number, number], floorY: number): [number, number, number] {
    return [cx + offset[0] * scaleX, floorY, cz + offset[1] * scaleZ]
  }

  function addNode(partial: Omit<NavNode, 'source' | 'lastUpdated'>) {
    nodes.push({ ...partial, source: DEMO_SOURCE, lastUpdated: LAST_UPDATED })
  }

  function addEdge(
    edgeId: string,
    from: string,
    to: string,
    type: NavEdge['type'],
    accessible: boolean,
  ) {
    const a = nodes.find((n) => n.id === from)
    const b = nodes.find((n) => n.id === to)
    if (!a || !b) throw new Error(`generateStandardBuildingGraph: unknown node in ${edgeId}`)
    const dist = Math.round(distanceBetween(a.position, b.position) * 10) / 10
    edges.push({
      id: edgeId,
      from,
      to,
      distance: dist,
      walkTimeSec: estimateWalkTimeSec(type, dist),
      type,
      accessible,
      bidirectional: true,
      source: DEMO_SOURCE,
      lastUpdated: LAST_UPDATED,
    })
  }

  floors.forEach((floor, floorIndex) => {
    const floorY = cy - height / 2 + 0.2 + floorIndex * floorHeight
    const [nameA, nameB] = roomNames[floor] ?? DEFAULT_ROOM_NAMES['1']
    const roomNumberA = `${floor}01`
    const roomNumberB = `${floor}02`

    const hallwayId = `${id}-f${floor}-hallway`
    const roomAId = `${id}-f${floor}-${roomNumberA}`
    const roomBId = `${id}-f${floor}-${roomNumberB}`
    const washroomId = `${id}-f${floor}-washroom`
    const stairsId = `${id}-f${floor}-stairs`
    const elevatorId = `${id}-f${floor}-elevator`

    const roomRecordA: Room = {
      id: `room-${id}-${roomNumberA}`,
      buildingId: id,
      floor,
      roomNumber: `${code}-${roomNumberA}`,
      name: `${nameA} ${code}-${roomNumberA}`,
      accessible: true,
      source: DEMO_SOURCE,
      lastUpdated: LAST_UPDATED,
    }
    const roomRecordB: Room = {
      id: `room-${id}-${roomNumberB}`,
      buildingId: id,
      floor,
      roomNumber: `${code}-${roomNumberB}`,
      name: `${nameB} ${code}-${roomNumberB}`,
      accessible: true,
      source: DEMO_SOURCE,
      lastUpdated: LAST_UPDATED,
    }
    rooms.push(roomRecordA, roomRecordB)

    addNode({ id: hallwayId, name: `${name} Floor ${floor} Hallway`, buildingId: id, floor, roomId: null, type: 'hallway', position: pos(LOCAL_OFFSETS.hallway, floorY), accessible: true })
    addNode({ id: roomAId, name: roomRecordA.name, buildingId: id, floor, roomId: roomRecordA.id, type: 'classroom', position: pos(LOCAL_OFFSETS.classroomA, floorY), accessible: true })
    addNode({ id: roomBId, name: roomRecordB.name, buildingId: id, floor, roomId: roomRecordB.id, type: 'classroom', position: pos(LOCAL_OFFSETS.classroomB, floorY), accessible: true })
    addNode({ id: washroomId, name: `${name} Floor ${floor} Washroom`, buildingId: id, floor, roomId: null, type: 'washroom', position: pos(LOCAL_OFFSETS.washroom, floorY), accessible: true })
    addNode({ id: stairsId, name: `${name} Floor ${floor} Stairs`, buildingId: id, floor, roomId: null, type: 'stairs', position: pos(LOCAL_OFFSETS.stairs, floorY), accessible: false })
    addNode({ id: elevatorId, name: `${name} Floor ${floor} Elevator`, buildingId: id, floor, roomId: null, type: 'elevator', position: pos(LOCAL_OFFSETS.elevator, floorY), accessible: true })

    addEdge(`e-${id}-f${floor}hall-${roomNumberA}`, hallwayId, roomAId, 'hallway', true)
    addEdge(`e-${id}-f${floor}hall-${roomNumberB}`, hallwayId, roomBId, 'hallway', true)
    addEdge(`e-${id}-f${floor}hall-washroom`, hallwayId, washroomId, 'hallway', true)
    addEdge(`e-${id}-f${floor}hall-stairs`, hallwayId, stairsId, 'hallway', true)
    addEdge(`e-${id}-f${floor}hall-elevator`, hallwayId, elevatorId, 'hallway', true)

    if (floorIndex === 0) {
      const entranceId = `${id}-entrance`
      addNode({ id: entranceId, name: `${name} Main Entrance`, buildingId: id, floor, roomId: null, type: 'entrance', position: pos(LOCAL_OFFSETS.entrance, floorY), accessible: true })
      addEdge(`e-${id}-entrance-f${floor}hall`, entranceId, hallwayId, 'door', true)
    }

    if (floorIndex > 0) {
      const prevFloor = floors[floorIndex - 1]
      addEdge(`e-${id}-stairs-${prevFloor}-${floor}`, `${id}-f${prevFloor}-stairs`, stairsId, 'stairs', false)
      addEdge(`e-${id}-elevator-${prevFloor}-${floor}`, `${id}-f${prevFloor}-elevator`, elevatorId, 'elevator', true)
    }
  })

  return { rooms, nodes, edges }
}
