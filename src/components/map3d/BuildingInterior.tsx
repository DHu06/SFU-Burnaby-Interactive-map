import { useMemo } from 'react'
import type { Building } from '@/data/types'
import { nodes } from '@/data/nodes'
import { getFloorY } from '@/lib/floorGeometry'
import { NodeMarker } from '@/components/map3d/NodeMarker'

interface BuildingInteriorProps {
  building: Building
  selectedFloor: string | null
}

/**
 * "Exploded" indoor view for a selected building: a flat slab per floor
 * (dimmed unless it's the active floor) plus labelled node markers for the
 * active floor only, so overlapping rooms don't clutter the view.
 */
export function BuildingInterior({ building, selectedFloor }: BuildingInteriorProps) {
  const floor = selectedFloor ?? building.floors[0]
  const [, , footprintDepth] = building.footprint.size
  const footprintWidth = building.footprint.size[0]
  const [cx, , cz] = building.footprint.position

  const floorNodes = useMemo(
    () => nodes.filter((n) => n.buildingId === building.id && n.floor === floor),
    [building.id, floor],
  )

  return (
    <group>
      {building.floors.map((f) => {
        const y = getFloorY(building.id, f)
        if (y === undefined) return null
        const isActive = f === floor
        return (
          <mesh key={f} position={[cx, y - 0.15, cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[footprintWidth, footprintDepth]} />
            <meshStandardMaterial
              color={isActive ? '#f4f4f5' : '#9ca3af'}
              transparent
              opacity={isActive ? 0.9 : 0.15}
            />
          </mesh>
        )
      })}
      {floorNodes.map((n) => (
        <NodeMarker key={n.id} node={n} showLabel />
      ))}
    </group>
  )
}
