import { Moon, Sun } from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-mid-grey/60 text-charcoal transition-colors hover:bg-mid-grey/30 dark:border-white/20 dark:text-light-grey dark:hover:bg-white/10"
    >
      {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  )
}
