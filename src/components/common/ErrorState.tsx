import { CircleAlert } from 'lucide-react'

interface ErrorStateProps {
  title: string
  description?: string
}

export function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 rounded-md border border-sfu-red/30 bg-sfu-red/5 px-4 py-6 text-center">
      <CircleAlert size={24} className="text-sfu-red" aria-hidden="true" />
      <p className="text-sm font-medium text-sfu-red">{title}</p>
      {description && <p className="text-xs text-charcoal/60 dark:text-light-grey/60">{description}</p>}
    </div>
  )
}
