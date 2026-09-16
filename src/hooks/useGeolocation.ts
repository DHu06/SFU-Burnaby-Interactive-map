import { useCallback, useState } from 'react'

export type GeolocationStatus = 'idle' | 'locating' | 'success' | 'error'

interface UseGeolocationResult {
  status: GeolocationStatus
  error: string | null
  locate: () => void
}

/**
 * Thin wrapper around the browser Geolocation API. This app has no verified
 * GPS-to-indoor-position mapping yet (see README "Privacy considerations"),
 * so callers should treat a successful fix only as a hint — e.g. "snap to
 * the nearest campus entrance" — never as a precise indoor room location.
 */
export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setError('Geolocation is not supported by this browser.')
      return
    }

    setStatus('locating')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      () => {
        // Coordinates are intentionally unused: this demo has no verified
        // mapping from GPS lat/long to the indoor nav graph yet.
        setStatus('success')
      },
      (err) => {
        setStatus('error')
        setError(err.code === err.PERMISSION_DENIED ? 'Location permission denied.' : 'Could not determine your location.')
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }, [])

  return { status, error, locate }
}
