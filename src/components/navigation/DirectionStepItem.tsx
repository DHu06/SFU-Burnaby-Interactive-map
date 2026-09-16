import type { DirectionStep } from '@/lib/directions'
import { formatDistance, formatDuration } from '@/lib/format'

interface DirectionStepItemProps {
  step: DirectionStep
  isActive: boolean
  onFocus: (stepIndex: number) => void
}

export function DirectionStepItem({ step, isActive, onFocus }: DirectionStepItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onFocus(step.stepIndex)}
        aria-current={isActive ? 'step' : undefined}
        className={`flex w-full flex-col gap-0.5 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
          isActive
            ? 'border-sfu-red bg-sfu-red/10'
            : 'border-transparent hover:border-mid-grey/60 hover:bg-mid-grey/20 dark:hover:border-white/10 dark:hover:bg-white/5'
        }`}
      >
        <span className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-charcoal text-[11px] font-semibold text-white dark:bg-light-grey dark:text-charcoal">
            {step.stepIndex + 1}
          </span>
          <span>{step.instruction}</span>
        </span>
        {step.timeSec > 0 && (
          <span className="pl-7 text-xs text-charcoal/60 dark:text-light-grey/60">
            {formatDistance(step.distance)} · {formatDuration(step.timeSec)}
          </span>
        )}
      </button>
    </li>
  )
}
