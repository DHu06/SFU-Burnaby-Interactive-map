import { AlertTriangle } from 'lucide-react'

/**
 * Shown when the browser/device has no WebGL context. A richer 2D top-down
 * fallback (rendered from the same nav-graph data as the 3D scene) lands once
 * the campus data model exists — see src/data/nodes.ts.
 */
export function WebGLFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-light-grey p-6 text-center dark:bg-charcoal">
      <AlertTriangle className="text-sfu-red" size={32} aria-hidden="true" />
      <h2 className="text-base font-semibold">3D map unavailable</h2>
      <p className="max-w-sm text-sm text-charcoal/70 dark:text-light-grey/70">
        Your browser or device doesn&apos;t support WebGL, so the interactive 3D campus
        map can&apos;t be displayed. You can still search for a route and follow the
        step-by-step directions in the panel.
      </p>
    </div>
  )
}
