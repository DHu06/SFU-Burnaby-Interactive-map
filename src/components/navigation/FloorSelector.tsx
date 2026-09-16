import { X } from 'lucide-react'
import { getBuildingById } from '@/data/buildings'
import { useNavigationStore } from '@/store/useNavigationStore'

export function FloorSelector() {
  const selectedBuildingId = useNavigationStore((s) => s.selectedBuildingId)
  const selectedFloor = useNavigationStore((s) => s.selectedFloor)
  const setSelectedFloor = useNavigationStore((s) => s.setSelectedFloor)
  const selectBuilding = useNavigationStore((s) => s.selectBuilding)

  if (!selectedBuildingId) return null
  const building = getBuildingById(selectedBuildingId)
  if (!building) return null

  const activeFloor = selectedFloor ?? building.floors[0]

  return (
    <div className="flex items-center justify-between gap-2 border-b border-mid-grey/60 px-4 py-3 dark:border-white/10">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <span className="h-2 w-2 rounded-full bg-sfu-red" aria-hidden="true" />
        {building.name}
      </div>
      <div className="flex items-center gap-2">
        <div role="group" aria-label="Select floor" className="flex overflow-hidden rounded-md border border-mid-grey/60 dark:border-white/20">
          {building.floors.map((floor) => (
            <button
              key={floor}
              type="button"
              aria-pressed={floor === activeFloor}
              onClick={() => setSelectedFloor(floor)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                floor === activeFloor
                  ? 'bg-sfu-red text-white'
                  : 'bg-white text-charcoal hover:bg-mid-grey/30 dark:bg-charcoal dark:text-light-grey dark:hover:bg-white/10'
              }`}
            >
              Floor {floor}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => selectBuilding(null)}
          aria-label="Exit building view"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-charcoal/60 hover:bg-mid-grey/30 dark:text-light-grey/60 dark:hover:bg-white/10"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
