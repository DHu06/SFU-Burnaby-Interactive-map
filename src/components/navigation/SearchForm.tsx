import { LocationSearch } from '@/components/search/LocationSearch'
import { SwapButton } from '@/components/search/SwapButton'
import { UseMyLocationButton } from '@/components/search/UseMyLocationButton'
import { AccessibilityToggle } from '@/components/navigation/AccessibilityToggle'
import { useNavigationStore } from '@/store/useNavigationStore'

export function SearchForm() {
  const startId = useNavigationStore((s) => s.startId)
  const endId = useNavigationStore((s) => s.endId)
  const setStart = useNavigationStore((s) => s.setStart)
  const setEnd = useNavigationStore((s) => s.setEnd)

  return (
    <div className="flex flex-col gap-3 border-b border-mid-grey/60 p-4 dark:border-white/10">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <LocationSearch label="From" selectedNodeId={startId} onSelect={setStart} placeholder="Starting classroom or location" />
        </div>
        <SwapButton />
      </div>
      <UseMyLocationButton onLocate={setStart} />

      <LocationSearch label="To" selectedNodeId={endId} onSelect={setEnd} placeholder="Destination classroom or location" />

      <AccessibilityToggle />
    </div>
  )
}
