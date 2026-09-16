import type { NavNode } from "../types";
import { provenance } from "./buildings";
import { rooms } from "./rooms";
const indoor: NavNode[] = ["AQ", "ASB"].flatMap((building) =>
  [1, 2, 3].flatMap((floor) => {
    const x = building === "AQ" ? 65 : 165,
      z = building === "AQ" ? 0 : 145,
      y = 1 + (floor - 1) * 4;
    return [
      {
        id: `${building}-hall-${floor}`,
        name: `${building} · Level ${floor} corridor`,
        position: [x, y, z],
        type: "hallway",
        accessible: true,
      },
      {
        id: `${building}-lift-${floor}`,
        name: `${building} · Level ${floor} elevator`,
        position: [x, y, z + 7],
        type: "elevator",
        accessible: true,
      },
      {
        id: `${building}-stairs-${floor}`,
        name: `${building} · Level ${floor} stairs`,
        position: [x + 5, y, z],
        type: "stairs",
        accessible: false,
      },
    ].map((n) => ({ ...n, building, floor, ...provenance }) as NavNode);
  }),
);
export const nodes: NavNode[] = [
  ...rooms,
  ...indoor,
  {
    id: "aq-entry",
    name: "Academic Quadrangle · Accessible entrance",
    building: "AQ",
    floor: 1,
    position: [65, 1, 35],
    type: "entrance",
    accessible: true,
    ...provenance,
  },
  {
    id: "asb-entry",
    name: "Applied Sciences · Accessible entrance",
    building: "ASB",
    floor: 1,
    position: [180, 1, 130],
    type: "entrance",
    accessible: true,
    ...provenance,
  },
  {
    id: "plaza",
    name: "Demo campus plaza",
    building: "OUT",
    floor: 0,
    position: [95, 0.35, 65],
    type: "outdoor",
    accessible: true,
    ...provenance,
  },
  {
    id: "junction",
    name: "Demo east walkway",
    building: "OUT",
    floor: 0,
    position: [180, 0.35, 90],
    type: "outdoor",
    accessible: true,
    ...provenance,
  },
  {
    id: "aq-wc",
    name: "AQ · Demo accessible washroom",
    building: "AQ",
    floor: 1,
    position: [60, 1, -10],
    type: "washroom",
    accessible: true,
    ...provenance,
  },
];
