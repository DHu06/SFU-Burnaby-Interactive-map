import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useAutocomplete } from '@/hooks/useAutocomplete'
import { getLocationByNodeId } from '@/lib/search'
import { NODE_TYPE_VISUALS } from '@/components/common/nodeTypeVisuals'

interface LocationSearchProps {
  label: string
  selectedNodeId: string | null
  onSelect: (nodeId: string | null) => void
  placeholder?: string
  trailingAction?: ReactNode
}

/**
 * ARIA combobox: text input + listbox of matching locations, fully
 * keyboard-operable (Up/Down to move, Enter to choose, Escape to close).
 */
export function LocationSearch({
  label,
  selectedNodeId,
  onSelect,
  placeholder = 'Search classrooms, entrances, elevators…',
  trailingAction,
}: LocationSearchProps) {
  const inputId = useId()
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const suggestions = useAutocomplete(query)

  // Reflect an externally-changed selection (swap, "Use my location", clear) in the input text.
  useEffect(() => {
    if (isOpen) return
    if (!selectedNodeId) {
      setQuery('')
      return
    }
    const loc = getLocationByNodeId(selectedNodeId)
    setQuery(loc?.label ?? '')
  }, [selectedNodeId, isOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectSuggestion(nodeId: string) {
    onSelect(nodeId)
    setIsOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true)
      return
    }
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const chosen = suggestions[highlightedIndex]
      if (chosen) selectSuggestion(chosen.nodeId)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-charcoal/70 dark:text-light-grey/70">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoComplete="off"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              setHighlightedIndex(0)
              if (e.target.value === '') onSelect(null)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-mid-grey/60 bg-white px-3 py-2 pr-8 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-sfu-red dark:border-white/20 dark:bg-charcoal dark:text-light-grey dark:placeholder:text-light-grey/40"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => {
                setQuery('')
                onSelect(null)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal dark:text-light-grey/40 dark:hover:text-light-grey"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {trailingAction}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-mid-grey/60 bg-white py-1 shadow-lg dark:border-white/20 dark:bg-charcoal-light"
        >
          {suggestions.map((loc, index) => {
            const Visual = NODE_TYPE_VISUALS[loc.type]
            const Icon = Visual.icon
            return (
              <li
                key={loc.nodeId}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectSuggestion(loc.nodeId)
                }}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                  index === highlightedIndex ? 'bg-sfu-red/10' : ''
                }`}
              >
                <Icon size={16} className={`flex-shrink-0 ${Visual.colorClass}`} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{loc.label}</p>
                  <p className="truncate text-xs text-charcoal/60 dark:text-light-grey/60">{loc.subtitle}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {isOpen && query.trim() !== '' && suggestions.length === 0 && (
        <div className="absolute z-40 mt-1 w-full rounded-md border border-mid-grey/60 bg-white px-3 py-2 text-sm text-charcoal/60 shadow-lg dark:border-white/20 dark:bg-charcoal-light dark:text-light-grey/60">
          No matching locations.
        </div>
      )}
    </div>
  )
}
