import { useEffect, useRef } from 'react'
import { LocateFixed, LoaderCircle } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { nodes } from '@/data/nodes'

interface UseMyLocationButtonProps {
  onLocate: (nodeId: string) => void
}

// Demo fallback: without a verified GPS-to-indoor-graph mapping, "your location"
// snaps to the nearest labeled campus entrance rather than a precise position.
const NEAREST_ENTRANCE_FALLBACK_ID = nodes.find((n) => n.type === 'entrance')?.id ?? null

export function UseMyLocationButton({ onLocate }: UseMyLocationButtonProps) {
  const { status, error, locate } = useGeolocation()
  const reportedRef = useRef(false)

  useEffect(() => {
    if (status === 'success' && NEAREST_ENTRANCE_FALLBACK_ID && !reportedRef.current) {
      reportedRef.current = true
      onLocate(NEAREST_ENTRANCE_FALLBACK_ID)
    }
    if (status === 'idle' || status === 'locating') {
      reportedRef.current = false
    }
  }, [status, onLocate])

  function handleClick() {
    locate()
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'locating'}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-sfu-red hover:underline disabled:opacity-60"
      >
        {status === 'locating' ? (
          <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <LocateFixed size={14} aria-hidden="true" />
        )}
        Use my location
      </button>
      <p className="text-[11px] leading-snug text-charcoal/50 dark:text-light-grey/50">
        Indoor position is approximate — this snaps to the nearest campus entrance, not your exact room.
      </p>
      {status === 'error' && error && (
        <p role="alert" className="text-[11px] text-sfu-red">
          {error}
        </p>
      )}
    </div>
  )
}
