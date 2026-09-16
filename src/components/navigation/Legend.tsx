import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { NODE_TYPE_VISUALS } from '@/components/common/nodeTypeVisuals'
import type { NodeType } from '@/data/types'

const LEGEND_TYPES: NodeType[] = ['classroom', 'entrance', 'stairs', 'elevator', 'washroom']

export function Legend() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="absolute bottom-3 left-3 z-10 max-w-[13rem] rounded-md border border-mid-grey/60 bg-white/95 text-xs shadow-md backdrop-blur dark:border-white/10 dark:bg-charcoal-light/95">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 font-semibold"
      >
        Legend
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      {isOpen && (
        <ul className="space-y-1.5 px-3 pb-3">
          {LEGEND_TYPES.map((type) => {
            const visual = NODE_TYPE_VISUALS[type]
            const Icon = visual.icon
            return (
              <li key={type} className="flex items-center gap-2">
                <Icon size={14} className={visual.colorClass} aria-hidden="true" />
                <span>{visual.label}</span>
              </li>
            )
          })}
          <li className="flex items-center gap-2 pt-1">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full border-2 border-blue-600" aria-hidden="true" />
            <span>Accessible (no stairs)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-0.5 w-4 flex-shrink-0 bg-sfu-red" aria-hidden="true" />
            <span>Route</span>
          </li>
        </ul>
      )}
    </div>
  )
}
