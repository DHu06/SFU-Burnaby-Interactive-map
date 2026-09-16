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
import { MOUSE, Vector3, type Mesh } from "three";
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
import FootprintMesh from "./FootprintMesh";
import CampusPlan from "./CampusPlan";
import GoogleCampusMap from "./GoogleCampusMap";
import { campusGeometry, type Footprint } from "../data/geography";
import { trees, landscapeLabels } from "../data/landscape";
import { buildings } from "../data/buildings";
import { nodes } from "../data/nodes";
import { useApp } from "../store";
import type { Building, Point } from "../types";
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
    fade = !!s.selected && !selected;
  const minor = ![
    "AQ",
    "ASB",
    "LIB",
    "WMC",
    "MBC",
    "SUB",
    "LDC",
    "RCB",
    "EDB",
    "SWH",
    "BLU",
    "SH",
    "SSB",
    "TASC1",
    "TASC2",
    "SCC",
    "SCB",
    "SCP",
    "SCK",
    "DAC",
  ].includes(b.id);
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        s.setSelected(b.id);
        s.setFloor(1);
        s.setFocus([...b.position]);
      }}
    >
      {selected && b.navigable ? (
        <group position={b.position}>
          <IndoorBuilding building={b} />
        </group>
      ) : b.modelUrl ? (
        <group position={b.position}>
          <Suspense fallback={null}>
            <BuildingModel url={b.modelUrl} />
          </Suspense>
        </group>
      ) : (
        <FootprintMesh
          polygons={b.footprints}
          height={b.size[1]}
          color={
            selected
              ? "#c77e7e"
              : b.id === "AQ"
                ? "#ded7c4"
                : b.navigable
                  ? "#c5d1c9"
                  : "#d2d6ce"
          }
          wallColor={selected ? "#aa5b62" : "#a6afa6"}
          opacity={fade ? 0.22 : 1}
          outline={!fade}
        />
      )}
      {(!minor || selected) && (
        <Html
          position={[b.position[0], b.size[1] + 8, b.position[2]]}
          center
          zIndexRange={[8, 0]}
        >
          <button
            className={`building-label ${selected ? "selected" : ""}`}
            title={b.name}
            onClick={(e) => {
              e.stopPropagation();
              s.setSelected(b.id);
              s.setFloor(1);
              s.setFocus([...b.position]);
            }}
          >
            <span style={{ color: selected ? "white" : "#a3474c" }}>▦</span>
            {["AQ", "ASB", "LIB"].includes(b.id) ? b.name : b.short}
          </button>
        </Html>
      )}
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
      <group position={[-b.position[0], 0, -b.position[2]]}>
        <FootprintMesh
          polygons={b.footprints}
          height={0.6}
          elevation={y - 0.6}
          color="#e4dccb"
        />
      </group>
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
  const { focus, mapView } = useApp();
  const target = useRef<Vector3 | null>(null);
  const destination = useRef<Vector3 | null>(null);
  useEffect(() => {
    if (focus) {
      target.current = new Vector3(...focus);
      destination.current =
        mapView === "top"
          ? new Vector3(focus[0], 350, focus[2] + 0.01)
          : new Vector3(focus[0] + 90, focus[1] + 140, focus[2] + 150);
    }
  }, [focus, mapView]);
  useEffect(() => {
    if (command.kind === "reset" || command.kind === "top") {
      target.current = new Vector3(-180, 0, 60);
      destination.current =
        command.kind === "top" || mapView === "top"
          ? new Vector3(-180, 1500, 60.01)
          : new Vector3(-180, 1000, 1000);
      if (command.kind === "top" && controls.current) {
        controls.current.target.copy(target.current);
        camera.position.copy(destination.current);
        controls.current.update();
        target.current = null;
        destination.current = null;
      }
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
      target={[-180, 0, 60]}
      minDistance={45}
      maxDistance={2400}
      maxPolarAngle={Math.PI / 2.2}
      enableRotate={mapView !== "top"}
      mouseButtons={{
        LEFT: mapView === "top" ? MOUSE.PAN : MOUSE.ROTATE,
        MIDDLE: MOUSE.DOLLY,
        RIGHT: MOUSE.PAN,
      }}
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
      <color attach="background" args={["#e8ede2"]} />
      <ambientLight intensity={1.9} />
      <directionalLight
        position={[-300, 700, 300]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-1050}
        shadow-camera-right={1050}
        shadow-camera-top={850}
        shadow-camera-bottom={-850}
        shadow-camera-far={2200}
        shadow-normalBias={0.3}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6500, 6500]} />
        <meshStandardMaterial color="#dce5cd" />
      </mesh>
      {campusGeometry.roads.map((road) => (
        <FootprintMesh
          key={road.id}
          polygons={road.polygons as Footprint[]}
          height={0.3}
          elevation={0.05}
          color="#fbfaf2"
          wallColor="#fbfaf2"
        />
      ))}
      <group position={[-440, 0.5, 65]} rotation={[0, -0.23, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[155, 92]} />
          <meshStandardMaterial color="#b2c49a" />
        </mesh>
        <Line
          points={Array.from(
            { length: 65 },
            (_, i) =>
              [
                Math.cos((i * Math.PI) / 32) * 89,
                0.3,
                Math.sin((i * Math.PI) / 32) * 58,
              ] as Point,
          )}
          color="#cc9a85"
          lineWidth={12}
        />
        <Block position={[0, 0.4, 0]} size={[102, 0.1, 55]} color="#b4c69f" />
        <Line
          points={[
            [-51, 0.6, -27],
            [51, 0.6, -27],
            [51, 0.6, 27],
            [-51, 0.6, 27],
            [-51, 0.6, -27],
          ]}
          color="#f4f3dc"
          lineWidth={1}
        />
        <Line
          points={[
            [0, 0.6, -27],
            [0, 0.6, 27],
          ]}
          color="#f4f3dc"
          lineWidth={1}
        />
      </group>
      {trees.map((p, i) => (
        <mesh key={i} position={[p[0], 5, p[2]]} castShadow>
          <icosahedronGeometry args={[5 + (i % 4), 0]} />
          <meshStandardMaterial
            color={["#a2b78b", "#b3c396", "#94ad85"][i % 3]}
          />
        </mesh>
      ))}
      {buildings.map((b) => (
        <BuildingMesh key={b.id} building={b} />
      ))}
      {landscapeLabels.map((label) => (
        <Html
          key={label.name}
          position={label.position}
          center
          zIndexRange={[3, 0]}
        >
          <span className="place-label">{label.name}</span>
        </Html>
      ))}
      <RouteLine />
      <Camera command={command} />
    </>
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
        <CampusPlan />
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
  const view = s.mapView,
    setView = s.setMapView;
  useEffect(() => {
    if (!hasWebGL() && (view === "3d" || view === "top")) setView("2d");
  }, [view, setView]);
  const [legend, setLegend] = useState(false),
    [command, setCommand] = useState({ kind: "reset", id: 0 });
  const selected = buildings.find((b) => b.id === s.selected);
  return (
    <>
      <SceneBoundary>
        {view === "google" ? (
          <GoogleCampusMap />
        ) : view === "3d" || view === "top" ? (
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{
              position: [-180, 1000, 1000],
              fov: 39,
              near: 2,
              far: 6500,
            }}
          >
            <Scene command={command} />
          </Canvas>
        ) : (
          <CampusPlan command={command} />
        )}
      </SceneBoundary>
      {view !== "google" && (
        <div className="compass">
          <span>N</span>
          <Compass size={32} strokeWidth={1.2} />
        </div>
      )}
      {selected && view !== "google" && (
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
      {view !== "google" && (
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

              onClick={() => setCommand({ kind: "in", id: Date.now() })}
            >
              <Plus size={17} />
            </button>
            <button
              aria-label="Zoom out"

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
      )}
      <div className="view-switch">
        <button
          className={view === "3d" ? "active" : ""}
          onClick={() => {
            setView(hasWebGL() ? "3d" : "2d");
            setCommand({ kind: "reset", id: Date.now() });
          }}
        >
          <Box size={13} />
          3D view
        </button>
        <button
          className={view === "top" ? "active" : ""}
          onClick={() => {
            setView(hasWebGL() ? "top" : "2d");
            setCommand({ kind: "top", id: Date.now() });
          }}
        >
          <Compass size={13} />
          Top down
        </button>
        <button
          className={view === "2d" ? "active" : ""}
          onClick={() => setView("2d")}
        >
          <Map size={13} />
          2D map
        </button>
        <button
          className={view === "google" ? "active" : ""}
          onClick={() => setView("google")}
        >
          <Map size={13} />
          Google Maps
        </button>
      </div>
      {legend && view !== "google" && (
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
