import { ArrowUpDown } from 'lucide-react'
import { useNavigationStore } from '@/store/useNavigationStore'

export function SwapButton() {
  const swap = useNavigationStore((s) => s.swap)
  const startId = useNavigationStore((s) => s.startId)
  const endId = useNavigationStore((s) => s.endId)

  return (
    <button
      type="button"
      onClick={swap}
      disabled={!startId && !endId}
      aria-label="Swap starting point and destination"
      className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-mid-grey/60 text-charcoal transition-colors hover:bg-mid-grey/30 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20 dark:text-light-grey dark:hover:bg-white/10"
    >
      <ArrowUpDown size={16} aria-hidden="true" />
    </button>
  )
}
