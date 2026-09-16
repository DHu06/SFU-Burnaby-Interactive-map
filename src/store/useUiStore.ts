import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface UiState {
  theme: Theme
  isPanelOpen: boolean
  toggleTheme: () => void
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem('sfu-wayfinder-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Matches Tailwind's `lg` breakpoint, where CollapsiblePanel switches from an
// overlay sheet to a permanent sidebar.
function getInitialPanelOpen(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(min-width: 1024px)').matches ?? true
}

export const useUiStore = create<UiState>((set, get) => ({
  theme: getInitialTheme(),
  // Panel starts open on desktop; collapsed by default on small screens so
  // the 3D map is visible first.
  isPanelOpen: getInitialPanelOpen(),
  toggleTheme: () => {
    const next: Theme = get().theme === 'light' ? 'dark' : 'light'
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('sfu-wayfinder-theme', next)
    }
    set({ theme: next })
  },
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
}))
