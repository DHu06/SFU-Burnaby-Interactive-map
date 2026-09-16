import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import type { LineSegments2 } from 'three-stdlib'
import type { RouteResult } from '@/lib/pathfinding/types'

interface RouteLineProps {
  route: RouteResult
  /** Index of the step the user currently has focused, used to highlight that segment. */
  activeStepIndex: number | null
}

/**
 * Draws the full route as an animated dashed line (marching-ants effect),
 * plus a solid, brighter overlay on the segment adjacent to the active step
 * so "current segment" is visually obvious in the side panel and the 3D view.
 */
export function RouteLine({ route, activeStepIndex }: RouteLineProps) {
  const dashedRef = useRef<LineSegments2 | null>(null)

  // Lift the whole route slightly above the floor/ground so it doesn't z-fight.
  const points = useMemo<[number, number, number][]>(
    () => route.steps.map((s) => [s.node.position[0], s.node.position[1] + 0.4, s.node.position[2]]),
    [route],
  )

  const activeSegment = useMemo<[number, number, number][] | null>(() => {
    if (activeStepIndex === null || activeStepIndex === 0) return null
    const a = points[activeStepIndex - 1]
    const b = points[activeStepIndex]
    if (!a || !b) return null
    return [a, b]
  }, [points, activeStepIndex])

  useFrame((_, delta) => {
    const material = dashedRef.current?.material as { dashOffset?: number } | undefined
    if (material && typeof material.dashOffset === 'number') {
      material.dashOffset -= delta * 2
    }
  })

  if (points.length < 2) return null

  return (
    <group>
      <Line
        ref={dashedRef}
        points={points}
        color="#a6192e"
        lineWidth={3}
        dashed
        dashSize={0.8}
        gapSize={0.5}
        transparent
        opacity={0.85}
        depthTest={false}
        renderOrder={10}
      />
      {activeSegment && (
        <Line
          points={activeSegment}
          color="#ffb703"
          lineWidth={6}
          transparent
          opacity={0.95}
          depthTest={false}
          renderOrder={11}
        />
      )}
    </group>
  )
}
