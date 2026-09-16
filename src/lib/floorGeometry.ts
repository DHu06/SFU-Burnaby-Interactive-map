import { nodes } from '@/data/nodes'

/** Looks up the Y-height used by a building's floor, derived from its nodes' positions. */
export function getFloorY(buildingId: string, floor: string): number | undefined {
  return nodes.find((n) => n.buildingId === buildingId && n.floor === floor)?.position[1]
}
