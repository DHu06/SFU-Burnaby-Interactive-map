import type { RouteResult, RouteStep } from '@/lib/pathfinding/types'
import { getBuildingById } from '@/data/buildings'

export interface DirectionStep {
  stepIndex: number
  nodeId: string
  instruction: string
  distance: number
  timeSec: number
}

function verticalDirection(from: RouteStep, to: RouteStep): 'up' | 'down' {
  return to.node.position[1] > from.node.position[1] ? 'up' : 'down'
}

function buildingLabel(buildingId: string | null): string {
  if (!buildingId) return 'outdoors'
  return getBuildingById(buildingId)?.name ?? buildingId
}

/**
 * Converts a raw pathfinding result into human-readable directions, one entry
 * per step. Kept separate from the RoutePanel component so the wording logic
 * can be unit tested and reused (e.g. by "Start Navigation" mode).
 */
export function generateDirections(route: RouteResult): DirectionStep[] {
  const { steps } = route

  return steps.map((step, i): DirectionStep => {
    if (i === 0) {
      return {
        stepIndex: i,
        nodeId: step.node.id,
        instruction: `Start at ${step.node.name}.`,
        distance: 0,
        timeSec: 0,
      }
    }

    const prev = steps[i - 1]
    const edge = step.viaEdge
    const distance = edge?.distance ?? 0
    const timeSec = edge?.walkTimeSec ?? 0
    const isLast = i === steps.length - 1
    const dest = isLast ? `Arrive at ${step.node.name}` : `Continue to ${step.node.name}`

    let instruction = `${dest}.`

    if (edge?.type === 'stairs') {
      instruction = `Take the stairs ${verticalDirection(prev, step)} to ${step.node.name}.`
    } else if (edge?.type === 'elevator') {
      instruction = `Take the elevator ${verticalDirection(prev, step)} to ${step.node.name}.`
    } else if (edge?.type === 'outdoor' && prev.node.buildingId && !step.node.buildingId) {
      instruction = `Exit ${buildingLabel(prev.node.buildingId)} and head outside.`
    } else if (edge?.type === 'outdoor' && !prev.node.buildingId && step.node.buildingId) {
      instruction = `Head toward ${buildingLabel(step.node.buildingId)}.`
    } else if (edge?.type === 'outdoor') {
      instruction = 'Continue along the outdoor path.'
    } else if (edge?.type === 'door' && step.node.type === 'entrance') {
      instruction = isLast
        ? `Arrive at ${step.node.name}.`
        : `Head to ${step.node.name} to exit ${buildingLabel(prev.node.buildingId)}.`
    } else if (edge?.type === 'door') {
      instruction = `Enter ${buildingLabel(step.node.buildingId)} through ${prev.node.name}.`
    } else {
      instruction = `${dest}.`
    }

    return { stepIndex: i, nodeId: step.node.id, instruction, distance, timeSec }
  })
}
