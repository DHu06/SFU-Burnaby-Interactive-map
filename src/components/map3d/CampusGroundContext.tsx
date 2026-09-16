interface Patch {
  id: string
  position: [number, number]
  size: [number, number]
  rotationY?: number
  color: string
}

// Rough green space / road / parking layout, approximated from a published
// campus map (direction and adjacency only, not surveyed geometry) — purely
// to make the ground read as "campus" instead of a flat empty plane.
const GREEN_SPACE: Patch[] = [
  { id: 'conservation-area', position: [-20, -70], size: [220, 40], color: '#7a9b6e' },
  { id: 'naheeno-park', position: [10, 70], size: [140, 60], color: '#7a9b6e' },
  { id: 'terry-fox-field', position: [-70, 45], size: [40, 30], color: '#8fb47f' },
]

const ROADS: Patch[] = [
  { id: 'ring-road-w', position: [-70, 0], size: [8, 140], color: '#4b4b4f' },
  { id: 'ring-road-s', position: [0, 78], size: [220, 8], rotationY: 0, color: '#4b4b4f' },
  { id: 'ring-road-e', position: [70, 20], size: [8, 120], color: '#4b4b4f' },
  { id: 'transportation-spur', position: [-50, -8], size: [40, 6], color: '#4b4b4f' },
]

const PARKING = [
  { id: 'lot-transport', position: [-76, -30] as [number, number], size: [18, 22] as [number, number], color: '#8b93a1' },
  { id: 'lot-residence', position: [-100, 30] as [number, number], size: [20, 18] as [number, number], color: '#8b93a1' },
]

function GroundPatch({ patch, y }: { patch: Patch; y: number }) {
  return (
    <mesh position={[patch.position[0], y, patch.position[1]]} rotation={[-Math.PI / 2, 0, patch.rotationY ?? 0]} receiveShadow>
      <planeGeometry args={patch.size} />
      <meshStandardMaterial color={patch.color} />
    </mesh>
  )
}

/** Purely decorative ground-level context (green space, roads, parking) — no nav data, never clickable. */
export function CampusGroundContext() {
  return (
    <group>
      {GREEN_SPACE.map((patch) => (
        <GroundPatch key={patch.id} patch={patch} y={0.02} />
      ))}
      {ROADS.map((patch) => (
        <GroundPatch key={patch.id} patch={patch} y={0.03} />
      ))}
      {PARKING.map((patch) => (
        <GroundPatch key={patch.id} patch={patch} y={0.03} />
      ))}
    </group>
  )
}
