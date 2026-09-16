import { DoubleSide } from 'three'
import { Html } from '@react-three/drei'
import type { NavNode } from '@/data/types'
import { NODE_TYPE_VISUALS } from '@/components/common/nodeTypeVisuals'

interface NodeMarkerProps {
  node: NavNode
  showLabel?: boolean
}

/** Small coloured marker for one nav-graph node, using the same colour/icon key as the legend. */
export function NodeMarker({ node, showLabel = false }: NodeMarkerProps) {
  const visual = NODE_TYPE_VISUALS[node.type]

  return (
    <group position={node.position}>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={visual.hex} />
      </mesh>
      {node.accessible && node.type !== 'stairs' && (
        <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.55, 24]} />
          <meshBasicMaterial color="#2563eb" side={DoubleSide} />
        </mesh>
      )}
      {showLabel && (
        <Html position={[0, 1.1, 0]} center distanceFactor={25} occlude>
          <div className="pointer-events-none select-none whitespace-nowrap rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-medium text-charcoal shadow dark:bg-charcoal/95 dark:text-light-grey">
            {node.name}
          </div>
        </Html>
      )}
    </group>
  )
}
