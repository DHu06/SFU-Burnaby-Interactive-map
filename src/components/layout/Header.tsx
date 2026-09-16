import { PanelLeft } from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Header() {
  const togglePanel = useUiStore((s) => s.togglePanel)

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-mid-grey/60 bg-white px-3 dark:border-white/10 dark:bg-charcoal-light sm:px-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePanel}
          aria-label="Toggle navigation panel"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-charcoal hover:bg-mid-grey/30 dark:text-light-grey dark:hover:bg-white/10 lg:hidden"
        >
          <PanelLeft size={20} aria-hidden="true" />
        </button>
        <span className="h-6 w-1.5 rounded-full bg-sfu-red" aria-hidden="true" />
        <h1 className="text-sm font-semibold tracking-tight sm:text-base">
          SFU Campus Wayfinder
        </h1>
      </div>
      <ThemeToggle />
    </header>
  )
}
