import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { buildings, backdropBuildings } from '@/data/buildings'
import { GroundPlane } from '@/components/map3d/GroundPlane'
import { CampusGroundContext } from '@/components/map3d/CampusGroundContext'
import { PlaceholderBuilding } from '@/components/map3d/PlaceholderBuilding'
import { BackdropBuildingBlock } from '@/components/map3d/BackdropBuildingBlock'
import { BuildingInterior } from '@/components/map3d/BuildingInterior'
import { RouteLine } from '@/components/map3d/RouteLine'
import { CameraRig } from '@/components/map3d/CameraRig'
import { LoadingOverlay } from '@/components/common/LoadingOverlay'
import { useNavigationStore } from '@/store/useNavigationStore'
import { useUiStore } from '@/store/useUiStore'
import { useRoute } from '@/hooks/useRoute'

// A small SFU-red/charcoal/grey palette cycled across buildings so a dozen
// blocks stay visually distinguishable without straying from the theme.
const PALETTE = ['#a6192e', '#52525b', '#7c1322', '#71717a', '#8a2a3c']
function colorForBuilding(id: string, index: number): string {
  if (id === 'aq') return '#a6192e'
  if (id === 'asb') return '#52525b'
  return PALETTE[index % PALETTE.length]
}

function SceneContent() {
  const selectedBuildingId = useNavigationStore((s) => s.selectedBuildingId)
  const selectedFloor = useNavigationStore((s) => s.selectedFloor)
  const activeStepIndex = useNavigationStore((s) => s.activeStepIndex)
  const selectBuilding = useNavigationStore((s) => s.selectBuilding)
  const { route } = useRoute()

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId)

  return (
    <>
      <GroundPlane />
      <CampusGroundContext />
      {backdropBuildings.map((b) => (
        <BackdropBuildingBlock key={b.id} building={b} />
      ))}
      {buildings.map((b, index) => (
        <PlaceholderBuilding
          key={b.id}
          id={b.id}
          name={`${b.name} (demo)`}
          position={b.footprint.position}
          size={b.footprint.size}
          color={colorForBuilding(b.id, index)}
          onSelect={(id) => selectBuilding(id)}
          faded={Boolean(selectedBuildingId) && selectedBuildingId !== b.id}
          isolated={selectedBuildingId === b.id}
        />
      ))}
      {selectedBuilding && (
        <BuildingInterior building={selectedBuilding} selectedFloor={selectedFloor} />
      )}
      {route && <RouteLine route={route} activeStepIndex={activeStepIndex} />}
      <CameraRig />
    </>
  )
}

export function Scene() {
  const theme = useUiStore((s) => s.theme)
  const backgroundColor = theme === 'dark' ? '#1f2023' : '#dfe1e6'

  return (
    <Canvas shadows camera={{ position: [90, 80, 120], fov: 50 }} className="!absolute inset-0">
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={theme === 'dark' ? 0.35 : 0.6} />
      <directionalLight
        position={[30, 60, 20]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight args={['#ffffff', '#8892a0', 0.5]} />
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
      <OrbitControls
        makeDefault
        enableDamping
        minDistance={15}
        maxDistance={320}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  )
}

export function SceneWithLoader() {
  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<LoadingOverlay label="Loading campus map…" />}>
        <Scene />
      </Suspense>
    </div>
  )
}
