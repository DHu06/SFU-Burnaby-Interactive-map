import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls, useGLTF } from "@react-three/drei";
import { Vector3, type Mesh } from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import {
  Plus,
  Minus,
  RotateCcw,
  Compass,
  Layers,
  Box,
  Map,
  X,
  DoorOpen,
  GraduationCap,
  Accessibility,
  ArrowUpDown,
  Footprints,
} from "lucide-react";
import { buildings } from "../data/buildings";
import { nodes } from "../data/nodes";
import { useApp } from "../store";
import type { Building, Point } from "../types";
const trees: Point[] = Array.from({ length: 92 }, (_, i) => {
  const a = i * 2.399;
  const r = 66 + (i % 9) * 3.4;
  return [Math.cos(a) * r, 0, Math.sin(a) * r * 0.78];
});
function Block({
  position,
  size,
  color = "#c9c8b9",
  opacity = 1,
}: {
  position: Point;
  size: Point;
  color?: string;
  opacity?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}
export function BuildingModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
}
function BuildingMesh({ building: b }: { building: Building }) {
  const s = useApp(),
    selected = s.selected === b.id,
    fade = !!s.selected && !selected,
    alpha = fade ? 0.28 : 1;
  const parts =
    b.id === "AQ"
      ? [
          [0, 0, -16, 45, 8],
          [0, 0, 16, 45, 7],
          [-19, 0, 0, 7, 26],
          [19, 0, 0, 7, 26],
        ]
      : [[0, 0, 0, b.size[0], b.size[2]]];
  return (
    <group
      position={b.position}
      onClick={(e) => {
        e.stopPropagation();
        s.setSelected(b.id);
        s.setFloor(1);
        s.setFocus(b.position);
      }}
    >
      {selected && b.navigable ? (
        <IndoorBuilding building={b} />
      ) : b.modelUrl ? (
        <Suspense fallback={null}>
          <BuildingModel url={b.modelUrl} />
        </Suspense>
      ) : (
        parts.map(([x, , z, w, d], i) => (
          <group key={i}>
            <Block
              position={[x, 0.5, z]}
              size={[w + 1.2, 1, d + 1.2]}
              color="#c7c5b8"
              opacity={alpha}
            />
            <Block
              position={[x, b.size[1] / 2, z]}
              size={[w, b.size[1], d]}
              color={selected ? "#c3b8a0" : "#d1ccbe"}
              opacity={alpha}
            />
            {[2.3, 5.3, 8.3, 11.3]
              .filter((y) => y < b.size[1])
              .map((y) => (
                <group key={y}>
                  <Block
                    position={[x, y, z + d / 2 + 0.03]}
                    size={[w - 0.8, 1.2, 0.1]}
                    color="#858e85"
                    opacity={alpha}
                  />
                  <Block
                    position={[x - w / 2 - 0.03, y, z]}
                    size={[0.1, 1.2, d - 0.8]}
                    color="#9a9e90"
                    opacity={alpha}
                  />
                  <Block
                    position={[x + w / 2 + 0.03, y, z]}
                    size={[0.1, 1.2, d - 0.8]}
                    color="#9a9e90"
                    opacity={alpha}
                  />
                </group>
              ))}
            <Block
              position={[x, b.size[1] + 0.15, z]}
              size={[w + 0.8, 0.5, d + 0.8]}
              color="#ece8dc"
              opacity={alpha}
            />
            <Block
              position={[x, b.size[1] + 0.5, z]}
              size={[w - 2, 0.5, d - 2]}
              color="#c9c9bc"
              opacity={alpha}
            />
            <Block
              position={[x + 2, b.size[1] + 1, z]}
              size={[Math.min(w / 3, 8), 1.1, Math.min(d / 2, 5)]}
              color="#b7bbae"
              opacity={alpha}
            />
            {Array.from({ length: Math.floor(w / 3) }, (_, k) => (
              <Block
                key={k}
                position={[
                  x - w / 2 + 1.5 + k * 3,
                  b.size[1] / 2,
                  z + d / 2 + 0.12,
                ]}
                size={[0.35, b.size[1], 0.35]}
                color="#ddd8c9"
                opacity={alpha}
              />
            ))}
          </group>
        ))
      )}
      <Html
        position={[0, b.size[1] + 6, selected ? -b.size[2] / 2 : 0]}
        center
        zIndexRange={[8, 0]}
      >
        <button
          className={`building-label ${selected ? "selected" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            s.setSelected(b.id);
            s.setFloor(1);
            s.setFocus(b.position);
          }}
        >
          <span style={{ color: selected ? "#fff" : "#a3474c" }}>▦</span>
          {b.name}
          {!b.navigable && <small>context</small>}
        </button>
      </Html>
    </group>
  );
}
function IndoorBuilding({ building: b }: { building: Building }) {
  const { floor } = useApp();
  const y = 1 + (floor - 1) * 4;
  const places = nodes.filter((n) => n.building === b.id && n.floor === floor);
  const colorFor = (type: string) =>
    ({
      classroom: "#a65d70",
      entrance: "#537c68",
      elevator: "#817097",
      stairs: "#b38b56",
      washroom: "#49788f",
      hallway: "#939b86",
    })[type] ?? "#939b86";
  return (
    <group>
      <Block
        position={[0, y - 0.4, 0]}
        size={[b.size[0], 0.6, b.size[2]]}
        color="#e4dccb"
      />
      <Block
        position={[0, y, b.size[2] / 2]}
        size={[b.size[0], 1, 0.3]}
        color="#c2b59d"
      />
      <Block
        position={[-b.size[0] / 2, y, 0]}
        size={[0.3, 1, b.size[2]]}
        color="#c2b59d"
      />
      {places.map((n) => {
        const p: Point = [
          n.position[0] - b.position[0],
          y,
          n.position[2] - b.position[2],
        ];
        const Icon =
          n.type === "classroom"
            ? GraduationCap
            : n.type === "elevator"
              ? ArrowUpDown
              : n.type === "stairs"
                ? Footprints
                : n.type === "washroom"
                  ? Accessibility
                  : DoorOpen;
        return (
          <group key={n.id} position={p}>
            {n.type === "classroom" && (
              <>
                <Block
                  position={[0, 0.03, 0]}
                  size={[6, 0.1, 5]}
                  color="#d5c4bb"
                />
                <Block
                  position={[3, 0.6, 0]}
                  size={[0.2, 1.2, 5]}
                  color="#c3b6a2"
                />
              </>
            )}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.6, 0.6, 0.25, 12]} />
              <meshBasicMaterial color={colorFor(n.type)} />
            </mesh>
            {n.type !== "hallway" && (
              <Html position={[0, 2, 0]} center zIndexRange={[9, 0]}>
                <span className="node-label">
                  <Icon size={10} color={colorFor(n.type)} />
                  {n.room ?? n.type}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
function RouteLine() {
  const { route, step } = useApp();
  const dot = useRef<Mesh>(null);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const startVector = useRef(new Vector3());
  const endVector = useRef(new Vector3());
  useFrame(({ clock }) => {
    if (!route || !dot.current || route.nodes.length < 2) return;
    const progress = reducedMotion
      ? Math.min(step, route.nodes.length - 2)
      : (clock.elapsedTime * 0.45) % (route.nodes.length - 1);
    const i = Math.floor(progress);
    dot.current.position.lerpVectors(
      startVector.current.set(...route.nodes[i].position),
      endVector.current.set(...route.nodes[i + 1].position),
      progress - i,
    );
    dot.current.position.y += 0.6;
  });
  if (!route) return null;
  const points = route.nodes.map(
    (n) => [n.position[0], n.position[1] + 0.5, n.position[2]] as Point,
  );
  return (
    <group>
      {points.length > 1 && (
        <Line
          points={points}
          color="#b62940"
          lineWidth={4}
          depthTest={false}
          depthWrite={false}
          transparent
          renderOrder={20}
        />
      )}{" "}
      {points[step] && points[step + 1] && (
        <Line
          points={[points[step], points[step + 1]]}
          color="#f3a45a"
          lineWidth={7}
          renderOrder={21}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      )}
      <mesh ref={dot} renderOrder={22}>
        <sphereGeometry args={[0.65, 10, 10]} />
        <meshBasicMaterial
          color="#fff"
          depthTest={false}
          depthWrite={false}
          transparent
        />
      </mesh>
      {[points[0], points[points.length - 1]].map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <cylinderGeometry args={[1.2, 1.2, 0.3, 20]} />
            <meshBasicMaterial
              color={i ? "#b62940" : "#4c7968"}
              depthTest={false}
            />
          </mesh>
          <Html position={[0, 2, 0]} center zIndexRange={[9, 0]}>
            <span className="node-label">{i ? "Destination" : "Start"}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}
function Camera({ command }: { command: { kind: string; id: number } }) {
  const controls = useRef<OrbitControlsType>(null);
  const { camera } = useThree();
  const { focus } = useApp();
  const target = useRef<Vector3 | null>(null);
  const destination = useRef<Vector3 | null>(null);
  useEffect(() => {
    if (focus) {
      target.current = new Vector3(...focus);
      destination.current = new Vector3(
        focus[0] + 50,
        focus[1] + 62,
        focus[2] + 65,
      );
    }
  }, [focus]);
  useEffect(() => {
    if (command.kind === "reset") {
      target.current = new Vector3(-8, 0, 4);
      destination.current = new Vector3(107, 117, 137);
    } else if (command.kind === "in" || command.kind === "out") {
      const center = controls.current?.target ?? new Vector3();
      camera.position
        .sub(center)
        .multiplyScalar(command.kind === "in" ? 0.8 : 1.25)
        .add(center);
      destination.current = null;
      target.current = null;
    }
  }, [command, camera]);
  useFrame(() => {
    if (!controls.current || !target.current || !destination.current) return;
    controls.current.target.lerp(target.current, 0.08);
    camera.position.lerp(destination.current, 0.08);
    controls.current.update();
    if (camera.position.distanceTo(destination.current) < 0.1) {
      target.current = null;
      destination.current = null;
    }
  });
  return (
    <OrbitControls
      ref={controls}
      target={[-8, 0, 4]}
      minDistance={25}
      maxDistance={260}
      maxPolarAngle={Math.PI / 2.2}
      onStart={() => {
        target.current = null;
        destination.current = null;
      }}
    />
  );
}
function Scene({ command }: { command: { kind: string; id: number } }) {
  return (
    <>
      <color attach="background" args={["#e9ede4"]} />
      <ambientLight intensity={1.6} />
      <directionalLight
        position={[-35, 90, 40]}
        intensity={2.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-130}
        shadow-camera-right={130}
        shadow-camera-top={130}
        shadow-camera-bottom={-130}
        shadow-normalBias={0.08}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#e8ece2" />
      </mesh>
      <Block
        position={[-12, 0.04, 0]}
        size={[182, 0.07, 129]}
        color="#dce3d1"
      />
      {[-57, -3, 65].map((x) => (
        <Block
          key={x}
          position={[x, 0.1, 2]}
          size={[6, 0.1, 134]}
          color="#f2f0e7"
        />
      ))}
      {[-53, 29, 61].map((z) => (
        <Block
          key={z}
          position={[-10, 0.1, z]}
          size={[183, 0.1, 5]}
          color="#f4f1e8"
        />
      ))}
      <Block position={[-19, 0.12, 19]} size={[89, 0.15, 11]} color="#eeede3" />
      <Block
        position={[-24, 0.14, -12]}
        size={[28, 0.15, 24]}
        color="#c1cfaa"
      />
      {[-20, -12, -4].map((z) => (
        <Block
          key={z}
          position={[-24, 0.25, z]}
          size={[28, 0.1, 1]}
          color="#e5e5d4"
        />
      ))}
      <Block position={[-24, 0.25, -12]} size={[1, 0.1, 24]} color="#e5e5d4" />
      <Block position={[-65, 0.2, 38]} size={[25, 0.2, 18]} color="#c8d4b9" />
      <Block position={[-65, 0.35, 38]} size={[15, 0.15, 9]} color="#a7bec0" />
      {trees.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.35, 2.8, 5]} />
            <meshStandardMaterial color="#a2987c" />
          </mesh>
          <mesh position={[0, 3.1 + (i % 3) * 0.4, 0]} castShadow>
            <icosahedronGeometry args={[2 + (i % 4) * 0.25, 1]} />
            <meshStandardMaterial
              color={["#a2b78b", "#bac99d", "#8fa881", "#c1cca8"][i % 4]}
            />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <group key={i} position={[-53 + i * 9, 0, 32]}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <icosahedronGeometry args={[1.5, 1]} />
            <meshStandardMaterial color="#a5b993" />
          </mesh>
          <Block
            position={[0, 0.7, 0]}
            size={[0.3, 1.4, 0.3]}
            color="#a69e83"
          />
        </group>
      ))}
      {buildings.map((b) => (
        <BuildingMesh key={b.id} building={b} />
      ))}
      <Html position={[-23, 0.5, -12]} center zIndexRange={[3, 0]}>
        <span className="place-label">AQ GARDENS</span>
      </Html>
      <Html position={[-7, 0.5, 36]} center zIndexRange={[3, 0]}>
        <span className="place-label">CAMPUS WALK</span>
      </Html>
      <RouteLine />
      <Camera command={command} />
    </>
  );
}
function FallbackMap() {
  const s = useApp();
  return (
    <svg
      className="two-d"
      viewBox="-105 -85 205 170"
      role="img"
      aria-label="2D demonstration campus map"
    >
      <rect x="-105" y="-85" width="205" height="170" fill="#e4eadd" />
      {[-53, 29, 61].map((z) => (
        <path
          key={z}
          d={`M -100 ${z} H 100`}
          stroke="#f8f5eb"
          strokeWidth="6"
        />
      ))}
      {trees.map(([x, , z], i) => (
        <circle key={i} cx={x} cy={z} r="2.2" fill="#a7ba95" />
      ))}
      {buildings.map((b) => (
        <g
          key={b.id}
          role="button"
          tabIndex={0}
          aria-label={`Explore ${b.name}`}
          onClick={() => {
            s.setSelected(b.id);
            s.setFloor(1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              s.setSelected(b.id);
              s.setFloor(1);
            }
          }}
        >
          <rect
            x={b.position[0] - b.size[0] / 2}
            y={b.position[2] - b.size[2] / 2}
            width={b.size[0]}
            height={b.size[2]}
            fill={s.selected === b.id ? "#d4b9af" : "#ccc8b8"}
            stroke="#aaa995"
            strokeWidth=".4"
          />
          <text
            x={b.position[0]}
            y={b.position[2]}
            textAnchor="middle"
            fontSize="3.2"
            fill="#464d40"
          >
            {b.short}
          </text>
        </g>
      ))}
      {s.route && (
        <polyline
          points={s.route.nodes
            .map((n) => `${n.position[0]},${n.position[2]}`)
            .join(" ")}
          fill="none"
          stroke="#ba293e"
          strokeWidth="1.2"
        />
      )}
      {s.selected &&
        nodes
          .filter((n) => n.building === s.selected && n.floor === s.floor)
          .map((n) => (
            <g key={n.id}>
              <circle
                cx={n.position[0]}
                cy={n.position[2]}
                r="1"
                fill="#bc293d"
              />
              <text x={n.position[0] + 1.8} y={n.position[2]} fontSize="2.1">
                {n.room ?? n.type}
              </text>
            </g>
          ))}
    </svg>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <>
        <FallbackMap />
        <div className="map-error">
          3D is unavailable. Showing the 2D campus map.
        </div>
      </>
    ) : (
      this.props.children
    );
  }
}
function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}
export default function CampusScene() {
  const s = useApp();
  const [view, setView] = useState<"3d" | "2d">(() =>
      hasWebGL() ? "3d" : "2d",
    ),
    [legend, setLegend] = useState(false),
    [command, setCommand] = useState({ kind: "reset", id: 0 });
  const selected = buildings.find((b) => b.id === s.selected);
  return (
    <>
      <SceneBoundary>
        {view === "3d" ? (
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{
              position: [107, 117, 137],
              fov: 39,
              near: 0.1,
              far: 1200,
            }}
          >
            <Scene command={command} />
          </Canvas>
        ) : (
          <FallbackMap />
        )}
      </SceneBoundary>
      <div className="compass">
        <span>N</span>
        <Compass size={32} strokeWidth={1.2} />
      </div>
      {selected && (
        <div className="floor-panel">
          <div className="floor-heading">
            {selected.name}
            <button
              aria-label="Close building view"
              onClick={() => {
                s.setSelected(null);
                s.setFocus(null);
                setCommand({ kind: "reset", id: Date.now() });
              }}
            >
              <X size={14} />
            </button>
          </div>
          <p>
            {selected.navigable
              ? "Demonstration interior · Select a floor"
              : "Context model only. Navigation data is not available for this building."}
          </p>
          <div className="floors">
            {selected.floors.map((f) => (
              <button
                className={s.floor === f ? "active" : ""}
                key={f}
                onClick={() => s.setFloor(f)}
              >
                L{f}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="map-controls">
        <div className="control-group">
          <button
            aria-label="Toggle legend"
            className={legend ? "active" : ""}
            onClick={() => setLegend(!legend)}
          >
            <Layers size={17} />
          </button>
        </div>
        <div className="control-group">
          <button
            aria-label="Zoom in"
            disabled={view === "2d"}
            onClick={() => setCommand({ kind: "in", id: Date.now() })}
          >
            <Plus size={17} />
          </button>
          <button
            aria-label="Zoom out"
            disabled={view === "2d"}
            onClick={() => setCommand({ kind: "out", id: Date.now() })}
          >
            <Minus size={17} />
          </button>
          <button
            aria-label="Reset map view"
            onClick={() => {
              s.setSelected(null);
              s.setFocus(null);
              setCommand({ kind: "reset", id: Date.now() });
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
      <div className="view-switch">
        <button
          className={view === "3d" ? "active" : ""}
          onClick={() => setView(hasWebGL() ? "3d" : "2d")}
        >
          <Box size={13} />
          3D view
        </button>
        <button
          className={view === "2d" ? "active" : ""}
          onClick={() => setView("2d")}
        >
          <Map size={13} />
          2D map
        </button>
      </div>
      {legend && (
        <div className="legend">
          <div className="legend-title">MAKE YOURSELF AT HOME</div>
          <div className="legend-row">
            <span className="legend-line" />
            Your route
          </div>
          <div className="legend-row">
            <GraduationCap color="#a65d70" />
            Classroom
          </div>
          <div className="legend-row">
            <DoorOpen color="#537c68" />
            Accessible entrance
          </div>
          <div className="legend-row">
            <ArrowUpDown color="#817097" />
            Elevator
          </div>
          <div className="legend-row">
            <Footprints color="#b38b56" />
            Stairs
          </div>
          <div className="legend-row">
            <Accessibility color="#49788f" />
            Accessible washroom
          </div>
        </div>
      )}
    </>
  );
}
