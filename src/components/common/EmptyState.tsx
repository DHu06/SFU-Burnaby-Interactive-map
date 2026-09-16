import type { LucideIcon } from 'lucide-react'
import { MapPinned } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
}

export function EmptyState({ icon: Icon = MapPinned, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <Icon size={28} className="text-charcoal/30 dark:text-light-grey/30" aria-hidden="true" />
      <p className="text-sm font-medium text-charcoal/70 dark:text-light-grey/70">{title}</p>
      {description && (
        <p className="text-xs text-charcoal/50 dark:text-light-grey/50">{description}</p>
      )}
    </div>
  )
}
