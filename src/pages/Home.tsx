import { Header } from '@/components/layout/Header'
import { CollapsiblePanel } from '@/components/layout/CollapsiblePanel'
import { SceneWithLoader } from '@/components/map3d/Scene'
import { WebGLFallback } from '@/components/map3d/WebGLFallback'
import { useWebGLSupport } from '@/hooks/useWebGLSupport'
import { SearchForm } from '@/components/navigation/SearchForm'
import { FloorSelector } from '@/components/navigation/FloorSelector'
import { RoutePanel } from '@/components/navigation/RoutePanel'
import { Legend } from '@/components/navigation/Legend'

export function Home() {
  const webglSupported = useWebGLSupport()

  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <div className="relative flex flex-1 overflow-hidden">
        <CollapsiblePanel>
          <SearchForm />
          <FloorSelector />
          <RoutePanel />
        </CollapsiblePanel>
        <main className="relative flex-1">
          {webglSupported === false ? (
            <WebGLFallback />
          ) : (
            <>
              <SceneWithLoader />
              <Legend />
            </>
          )}
        </main>
      </div>
    </div>
  )
}
