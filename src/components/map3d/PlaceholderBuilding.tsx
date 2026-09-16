import { useMemo, useState } from 'react'
import { BoxGeometry } from 'three'
import { Html } from '@react-three/drei'
import { useUiStore } from '@/store/useUiStore'

interface PlaceholderBuildingProps {
  id: string
  name: string
  /** Center position of the building footprint, in scene units (1 unit ≈ 1 metre). */
  position: [number, number, number]
  size: [number, number, number]
  color?: string
  onSelect?: (id: string) => void
  /** Dims this building relative to whatever else is focused (a different selected building). */
  faded?: boolean
  /** True when this is the selected building itself: goes near-transparent so its floor interior (rendered separately) is visible through the shell. */
  isolated?: boolean
}

/**
 * Low-poly stand-in for a real building model. Swap for a GLTF/GLB component later
 * (see components/map3d/GltfBuilding.tsx once real models are available) without
 * changing how the scene selects or labels buildings.
 */
export function PlaceholderBuilding({
  id,
  name,
  position,
  size,
  color = '#a6192e',
  onSelect,
  faded = false,
  isolated = false,
}: PlaceholderBuildingProps) {
  const [hovered, setHovered] = useState(false)
  const theme = useUiStore((s) => s.theme)

  const labelColor = theme === 'dark' ? '#f4f4f5' : '#1f2023'
  const opacity = faded ? 0.25 : 1

  const emissive = useMemo(() => (hovered ? '#333333' : '#000000'), [hovered])
  const boxGeometry = useMemo(() => new BoxGeometry(...size), [size])

  return (
    <group position={position}>
      {isolated ? (
        // Selected building: swap the solid box for a wireframe footprint so
        // the floor interior (rendered separately) is never occluded.
        <lineSegments onClick={(e) => { e.stopPropagation(); onSelect?.(id) }}>
          <edgesGeometry args={[boxGeometry]} />
          <lineBasicMaterial color={color} transparent opacity={0.6} />
        </lineSegments>
      ) : (
        <mesh
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(id)
          }}
        >
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            transparent={faded}
            opacity={opacity}
          />
        </mesh>
      )}
      <Html position={[0, size[1] / 2 + 1.2, 0]} center distanceFactor={40} occlude>
        <div
          className="pointer-events-none select-none whitespace-nowrap rounded bg-white/90 px-2 py-0.5 text-xs font-semibold shadow dark:bg-charcoal/90"
          style={{ color: labelColor, opacity }}
        >
          {name}
        </div>
      </Html>
    </group>
  )
}
