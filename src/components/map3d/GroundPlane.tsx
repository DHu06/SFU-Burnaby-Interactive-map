import { useUiStore } from '@/store/useUiStore'

/** Simple outdoor "campus quad" ground. Replace with real terrain/GIS geometry later. */
export function GroundPlane() {
  const theme = useUiStore((s) => s.theme)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color={theme === 'dark' ? '#2c2d31' : '#e4e4e7'} />
    </mesh>
  )
}
