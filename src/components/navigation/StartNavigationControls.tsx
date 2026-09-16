import { ChevronLeft, ChevronRight, Navigation, Square } from 'lucide-react'
import { useNavigationStore } from '@/store/useNavigationStore'

interface StartNavigationControlsProps {
  stepCount: number
}

export function StartNavigationControls({ stepCount }: StartNavigationControlsProps) {
  const isNavigating = useNavigationStore((s) => s.isNavigating)
  const activeStepIndex = useNavigationStore((s) => s.activeStepIndex)
  const startNavigation = useNavigationStore((s) => s.startNavigation)
  const stopNavigation = useNavigationStore((s) => s.stopNavigation)
  const nextStep = useNavigationStore((s) => s.nextStep)
  const prevStep = useNavigationStore((s) => s.prevStep)

  if (!isNavigating) {
    return (
      <button
        type="button"
        onClick={startNavigation}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-sfu-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sfu-red-dark"
      >
        <Navigation size={16} aria-hidden="true" />
        Start Navigation
      </button>
    )
  }

  const current = activeStepIndex ?? 0

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={prevStep}
        disabled={current === 0}
        aria-label="Previous step"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-mid-grey/60 disabled:opacity-40 dark:border-white/20"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="flex-1 text-center text-sm font-medium">
        Step {current + 1} of {stepCount}
      </span>
      <button
        type="button"
        onClick={() => nextStep(stepCount)}
        disabled={current === stepCount - 1}
        aria-label="Next step"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-mid-grey/60 disabled:opacity-40 dark:border-white/20"
      >
        <ChevronRight size={16} />
      </button>
      <button
        type="button"
        onClick={stopNavigation}
        aria-label="Stop navigation"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-sfu-red text-sfu-red"
      >
        <Square size={14} />
      </button>
    </div>
  )
}
