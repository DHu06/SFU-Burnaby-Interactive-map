import { useMemo } from "react";
import { Edges } from "@react-three/drei";
import { ExtrudeGeometry, Path, Shape } from "three";
import type { Footprint } from "../data/geography";
export default function FootprintMesh({
  polygons,
  height = 1,
  elevation = 0,
  color = "#d9d2c1",
  wallColor = "#b3b6ab",
  opacity = 1,
  outline = false,
}: {
  polygons: Footprint[];
  height?: number;
  elevation?: number;
  color?: string;
  wallColor?: string;
  opacity?: number;
  outline?: boolean;
}) {
  const geometry = useMemo(() => {
    const shapes = polygons.map(([outer, ...holes]) => {
      const shape = new Shape();
      outer.forEach(([x, z], i) =>
        i ? shape.lineTo(x, -z) : shape.moveTo(x, -z),
      );
      shape.closePath();
      shape.holes = holes.map((ring) => {
        const path = new Path();
        ring.forEach(([x, z], i) =>
          i ? path.lineTo(x, -z) : path.moveTo(x, -z),
        );
        path.closePath();
        return path;
      });
      return shape;
    });
    return new ExtrudeGeometry(shapes, {
      depth: height,
      bevelEnabled: false,
      curveSegments: 1,
    });
  }, [polygons, height]);
  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, elevation, 0]}
      castShadow={height > 2 && opacity === 1}
      receiveShadow
    >
      <meshStandardMaterial
        attach="material-0"
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity === 1}
      />
      <meshStandardMaterial
        attach="material-1"
        color={wallColor}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity === 1}
      />
      {outline && opacity === 1 && <Edges color="#8a9182" threshold={25} />}
    </mesh>
  );
}
