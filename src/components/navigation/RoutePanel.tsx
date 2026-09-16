import { useMemo } from 'react'
import { Clock, Route as RouteIcon } from 'lucide-react'
import { useRoute } from '@/hooks/useRoute'
import { generateDirections } from '@/lib/directions'
import { formatDistance, formatDuration } from '@/lib/format'
import { useNavigationStore } from '@/store/useNavigationStore'
import { DirectionStepItem } from '@/components/navigation/DirectionStepItem'
import { StartNavigationControls } from '@/components/navigation/StartNavigationControls'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'

export function RoutePanel() {
  const startId = useNavigationStore((s) => s.startId)
  const endId = useNavigationStore((s) => s.endId)
  const activeStepIndex = useNavigationStore((s) => s.activeStepIndex)
  const setActiveStep = useNavigationStore((s) => s.setActiveStep)

  const { route, error } = useRoute()
  const directions = useMemo(() => (route ? generateDirections(route) : []), [route])

  if (!startId || !endId) {
    return (
      <EmptyState
        title="Choose a starting point and destination"
        description="Search above to plan a route across campus."
      />
    )
  }

  if (error) {
    return <ErrorState title="No route available" description={error} />
  }

  if (!route) return null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-mid-grey/60 px-4 py-3 text-sm dark:border-white/10">
        <span className="flex items-center gap-1.5 font-medium">
          <RouteIcon size={16} className="text-sfu-red" aria-hidden="true" />
          {formatDistance(route.totalDistance)}
        </span>
        <span className="flex items-center gap-1.5 text-charcoal/70 dark:text-light-grey/70">
          <Clock size={16} aria-hidden="true" />
          {formatDuration(route.totalTimeSec)}
        </span>
      </div>

      <ol className="flex-1 space-y-1 overflow-y-auto p-3">
        {directions.map((step) => (
          <DirectionStepItem
            key={step.stepIndex}
            step={step}
            isActive={activeStepIndex === step.stepIndex}
            onFocus={setActiveStep}
          />
        ))}
      </ol>

      <div className="border-t border-mid-grey/60 p-3 dark:border-white/10">
        <StartNavigationControls stepCount={directions.length} />
      </div>
    </div>
  )
}
