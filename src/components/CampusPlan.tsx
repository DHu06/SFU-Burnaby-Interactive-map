import { useEffect, useRef, useState } from "react";
import { buildings } from "../data/buildings";
import { campusGeometry, type Footprint } from "../data/geography";
import { trees, landscapeLabels } from "../data/landscape";
import { nodes } from "../data/nodes";
import { useApp } from "../store";
export function footprintPath(polygons: Footprint[]) {
  return polygons
    .map((poly) =>
      poly
        .map(
          (ring) =>
            ring.map(([x, z], i) => `${i ? "L" : "M"}${x},${z}`).join(" ") +
            " Z",
        )
        .join(" "),
    )
    .join(" ");
}
export default function CampusPlan({
  command,
}: {
  command?: { kind: string; id: number };
}) {
  const s = useApp(),
    ref = useRef<SVGSVGElement>(null),
    drag = useRef<{ x: number; y: number; cx: number; cz: number } | null>(
      null,
    );
  const [width, setWidth] = useState(1300),
    [center, setCenter] = useState([-180, 60]),
    [ratio, setRatio] = useState(1.3);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setRatio(entry.contentRect.width / entry.contentRect.height),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (command?.kind === "in") setWidth((w) => Math.max(180, w * 0.75));
    if (command?.kind === "out") setWidth((w) => Math.min(2600, w / 0.75));
    if (command?.kind === "reset" || command?.kind === "top") {
      setWidth(1300);
      setCenter([-180, 60]);
    }
  }, [command]);
  useEffect(() => {
    if (s.focus) {
      setCenter([s.focus[0], s.focus[2]]);
      setWidth(400);
    }
  }, [s.focus]);
  const height = width / ratio;
  return (
    <svg
      ref={ref}
      className="two-d"
      viewBox={`${center[0] - width / 2} ${center[1] - height / 2} ${width} ${height}`}
      role="img"
      aria-label="2D demonstration campus map"
      onWheel={(e) =>
        setWidth((w) =>
          Math.max(180, Math.min(2600, w * (e.deltaY > 0 ? 1.12 : 0.89))),
        )
      }
      onPointerDown={(e) => {
        if ((e.target as Element).closest('[role="button"]')) return;
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          cx: center[0],
          cz: center[1],
        };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current || !ref.current) return;
        const scale = width / ref.current.getBoundingClientRect().width;
        setCenter([
          drag.current.cx - (e.clientX - drag.current.x) * scale,
          drag.current.cz - (e.clientY - drag.current.y) * scale,
        ]);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <rect x="-3000" y="-3000" width="6000" height="6000" fill="#e0e8d4" />
      {campusGeometry.roads.map((road) => (
        <path
          key={road.id}
          d={footprintPath(road.polygons as Footprint[])}
          fill="#faf9f0"
          fillRule="evenodd"
        />
      ))}
      {trees.map(([x, , z], i) => (
        <circle key={i} cx={x} cy={z} r={5 + (i % 4)} fill="#b1c39e" />
      ))}
      <g transform="translate(-440 65) rotate(13)">
        <rect x="-91" y="-60" width="182" height="120" rx="52" fill="#cfaa96" />
        <rect x="-78" y="-47" width="156" height="94" rx="43" fill="#b8cba5" />
        <rect
          x="-52"
          y="-27"
          width="104"
          height="54"
          fill="none"
          stroke="#eff1df"
        />
        <path d="M0 -27 V27" stroke="#eff1df" />
      </g>
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
          style={{ cursor: "pointer" }}
        >
          <title>{b.name}</title>
          <rect
            x={b.position[0] - b.size[0] / 2}
            y={b.position[2] - b.size[2] / 2}
            width={b.size[0]}
            height={b.size[2]}
            fill="transparent"
            pointerEvents="all"
          />
          <path
            d={footprintPath(b.footprints)}
            fill={
              s.selected === b.id
                ? "#c88185"
                : b.navigable
                  ? "#b6c9c3"
                  : "#c5d1d2"
            }
            stroke={s.selected === b.id ? "#a82b3b" : "#93a6a2"}
            strokeWidth={s.selected === b.id ? 2 : 0.7}
            fillRule="evenodd"
          />
          {(b.size[0] > 45 || b.navigable || s.selected === b.id) && (
            <text
              x={b.position[0]}
              y={b.position[2] + 3}
              textAnchor="middle"
              fontSize={width < 600 ? 5 : 9}
              fontWeight="600"
              fill="#344d47"
              pointerEvents="none"
            >
              {b.short}
            </text>
          )}
        </g>
      ))}
      {landscapeLabels.map((label) => (
        <text
          key={label.name}
          x={label.position[0]}
          y={label.position[2]}
          textAnchor="middle"
          fontSize={label.name === "AQ GARDENS" ? 5 : 10}
          letterSpacing="1.3"
          fill="#647957"
          pointerEvents="none"
        >
          {label.name}
        </text>
      ))}
      {s.route && (
        <>
          <polyline
            points={s.route.nodes
              .map((n) => `${n.position[0]},${n.position[2]}`)
              .join(" ")}
            fill="none"
            stroke="#b5293c"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {s.route.nodes[s.step + 1] && (
            <polyline
              points={[s.route.nodes[s.step], s.route.nodes[s.step + 1]]
                .map((n) => `${n.position[0]},${n.position[2]}`)
                .join(" ")}
              fill="none"
              stroke="#e2984f"
              strokeWidth="5"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </>
      )}
      {s.selected &&
        nodes
          .filter((n) => n.building === s.selected && n.floor === s.floor)
          .map((n) => (
            <g key={n.id}>
              <circle
                cx={n.position[0]}
                cy={n.position[2]}
                r="1.7"
                fill="#bd293d"
              />
              <text
                x={n.position[0] + 2.5}
                y={n.position[2] - 2.5}
                fontSize="4"
                fill="#3d4538"
              >
                {n.room ?? n.type}
              </text>
            </g>
          ))}
    </svg>
  );
}
