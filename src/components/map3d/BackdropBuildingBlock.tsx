import { Html } from '@react-three/drei'
import type { BackdropBuilding } from '@/data/types'

interface BackdropBuildingBlockProps {
  building: BackdropBuilding
}

/**
 * Non-interactive campus-context block: no floors, no rooms, not
 * searchable/routable — just gives the 3D scene the shape of a full campus
 * around the buildings that actually have indoor navigation data.
 */
export function BackdropBuildingBlock({ building }: BackdropBuildingBlockProps) {
  return (
    <group position={building.position}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={building.size} />
        <meshStandardMaterial color="#a1a1aa" opacity={0.55} transparent />
      </mesh>
      <Html position={[0, building.size[1] / 2 + 1, 0]} center distanceFactor={55} occlude>
        <div className="pointer-events-none select-none whitespace-nowrap rounded bg-white/70 px-1.5 py-0.5 text-[10px] text-charcoal/70 shadow-sm dark:bg-charcoal/70 dark:text-light-grey/70">
          {building.name}
        </div>
      </Html>
    </group>
  )
}
