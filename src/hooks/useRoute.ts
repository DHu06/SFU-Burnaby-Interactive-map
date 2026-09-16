import { useMemo } from 'react'
import { findRoute, type RouteResult } from '@/lib/pathfinding'
import { useNavigationStore } from '@/store/useNavigationStore'

export interface UseRouteResult {
  route: RouteResult | null
  error: string | null
}

/**
 * Derives the current route from the navigation store's raw inputs
 * (start/end/accessibleOnly) rather than storing the computed route itself —
 * this keeps route calculation a pure function of its inputs, with no risk of
 * stale route state after the user changes a search box or the accessibility
 * toggle.
 */
export function useRoute(): UseRouteResult {
  const startId = useNavigationStore((s) => s.startId)
  const endId = useNavigationStore((s) => s.endId)
  const accessibleOnly = useNavigationStore((s) => s.accessibleOnly)

  return useMemo(() => {
    if (!startId || !endId) return { route: null, error: null }
    if (startId === endId) {
      return { route: null, error: 'Your starting point and destination are the same.' }
    }

    const route = findRoute(startId, endId, { accessibleOnly })
    if (!route) {
      return {
        route: null,
        error: accessibleOnly
          ? 'No accessible route was found between these locations.'
          : 'No route was found between these locations.',
      }
    }

    return { route, error: null }
  }, [startId, endId, accessibleOnly])
}
