import type { NavNode } from "../types";
import { provenance } from "./buildings";
import { rooms } from "./rooms";
const indoor: NavNode[] = ["AQ", "ASB"].flatMap((building) =>
  [1, 2, 3].flatMap((floor) => {
    const x = building === "AQ" ? -39 : 23,
      z = building === "AQ" ? -12 : 13,
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
    position: [-15, 1, 9],
    type: "entrance",
    accessible: true,
    ...provenance,
  },
  {
    id: "asb-entry",
    name: "Applied Sciences · Accessible entrance",
    building: "ASB",
    floor: 1,
    position: [17, 1, 13],
    type: "entrance",
    accessible: true,
    ...provenance,
  },
  {
    id: "plaza",
    name: "Demo campus plaza",
    building: "OUT",
    floor: 0,
    position: [-6, 0.35, 24],
    type: "outdoor",
    accessible: true,
    ...provenance,
  },
  {
    id: "junction",
    name: "Demo east walkway",
    building: "OUT",
    floor: 0,
    position: [10, 0.35, 24],
    type: "outdoor",
    accessible: true,
    ...provenance,
  },
  {
    id: "aq-wc",
    name: "AQ · Demo accessible washroom",
    building: "AQ",
    floor: 1,
    position: [-34, 1, -22],
    type: "washroom",
    accessible: true,
    ...provenance,
  },
];
