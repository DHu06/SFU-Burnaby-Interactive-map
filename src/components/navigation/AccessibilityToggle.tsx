import { Accessibility } from 'lucide-react'
import { useNavigationStore } from '@/store/useNavigationStore'

export function AccessibilityToggle() {
  const accessibleOnly = useNavigationStore((s) => s.accessibleOnly)
  const setAccessibleOnly = useNavigationStore((s) => s.setAccessibleOnly)

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-mid-grey/60 bg-light-grey px-3 py-2 text-sm dark:border-white/10 dark:bg-charcoal">
      <span className="flex items-center gap-2">
        <Accessibility size={16} className="text-sfu-red" aria-hidden="true" />
        Accessible route (avoid stairs)
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-checked={accessibleOnly}
        checked={accessibleOnly}
        onChange={(e) => setAccessibleOnly(e.target.checked)}
        className="h-4 w-4 accent-sfu-red"
      />
    </label>
  )
}
