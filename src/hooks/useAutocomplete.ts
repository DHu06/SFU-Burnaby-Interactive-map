import { useMemo } from 'react'
import { searchLocations, type SearchableLocation } from '@/lib/search'

export function useAutocomplete(query: string, limit = 8): SearchableLocation[] {
  return useMemo(() => searchLocations(query, limit), [query, limit])
}
