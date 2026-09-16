import type { ReactNode } from 'react'
import { useUiStore } from '@/store/useUiStore'

interface CollapsiblePanelProps {
  children: ReactNode
}

/**
 * On large screens the panel is a permanent sidebar. On small screens it becomes
 * an overlay sheet toggled from the header, so the 3D map keeps most of the viewport.
 */
export function CollapsiblePanel({ children }: CollapsiblePanelProps) {
  const isPanelOpen = useUiStore((s) => s.isPanelOpen)
  const setPanelOpen = useUiStore((s) => s.setPanelOpen)

  return (
    <>
      {isPanelOpen && (
        <button
          type="button"
          aria-label="Close navigation panel"
          onClick={() => setPanelOpen(false)}
          className="fixed inset-x-0 top-14 bottom-0 z-20 bg-charcoal/40 lg:hidden"
        />
      )}
      <aside
        aria-label="Wayfinding controls"
        className={`fixed top-14 bottom-0 left-0 z-30 flex w-[85vw] max-w-sm transform flex-col overflow-y-auto border-r border-mid-grey/60 bg-white transition-transform duration-200 ease-out dark:border-white/10 dark:bg-charcoal-light lg:static lg:top-0 lg:z-auto lg:w-96 lg:max-w-none lg:translate-x-0 ${
          isPanelOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {children}
      </aside>
    </>
  )
}
