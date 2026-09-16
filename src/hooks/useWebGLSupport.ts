import { useState } from 'react'

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

/** Detects WebGL availability so the 3D scene can fall back to a 2D view. Client-only (Vite/CSR), so this is safe to compute synchronously at first render. */
export function useWebGLSupport(): boolean {
  const [supported] = useState(detectWebGL)
  return supported
}
