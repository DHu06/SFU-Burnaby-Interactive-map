import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { getBuildingById } from '@/data/buildings'
import { useNavigationStore } from '@/store/useNavigationStore'
import { useRoute } from '@/hooks/useRoute'

interface OrbitControlsLike {
  target: Vector3
  update: () => void
}

/**
 * Smoothly pans the OrbitControls target toward whatever the user is
 * currently focused on: the active direction step (click-to-focus / Start
 * Navigation), falling back to the selected building's footprint.
 */
export function CameraRig() {
  const activeStepIndex = useNavigationStore((s) => s.activeStepIndex)
  const selectedBuildingId = useNavigationStore((s) => s.selectedBuildingId)
  const { route } = useRoute()
  const controls = useThree((state) => state.controls) as unknown as OrbitControlsLike | null

  const desired = useMemo(() => {
    if (route && activeStepIndex !== null) {
      const node = route.steps[activeStepIndex]?.node
      if (node) return new Vector3(...node.position)
    }
    if (selectedBuildingId) {
      const building = getBuildingById(selectedBuildingId)
      if (building) return new Vector3(...building.footprint.position)
    }
    return null
  }, [route, activeStepIndex, selectedBuildingId])

  useFrame(() => {
    if (!desired || !controls) return
    controls.target.lerp(desired, 0.08)
    controls.update()
  })

  return null
}
