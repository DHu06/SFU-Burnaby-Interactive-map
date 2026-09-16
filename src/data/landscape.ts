import type { Point } from "../types";
import { buildings } from "./buildings";
import { campusGeometry, inFootprint, type Footprint } from "./geography";
// Landscape placements are schematic context from the supplied campus directory,
// not surveyed vegetation, playing-field boundaries, or pedestrian navigation.
export const landscapeLabels = [
  {
    name: "BURNABY MOUNTAIN CONSERVATION AREA",
    position: [-340, 0.7, -340] as Point,
  },
  { name: "NAHEENO PARK", position: [-280, 0.7, 440] as Point },
  { name: "TERRY FOX FIELD", position: [-440, 0.7, 65] as Point },
  { name: "AQ GARDENS", position: [0, 0.7, 0] as Point },
  { name: "NORTH PARKING", position: [185, 0.7, -215] as Point },
];
const roads = campusGeometry.roads.flatMap((r) => r.polygons) as Footprint[];
export const trees: Point[] = Array.from({ length: 480 }, (_, i) => {
  const x = -970 + ((i * 167.39) % 1450),
    z = -470 + ((i * 93.71) % 1130);
  const forest = z < -245 || (z > 300 && x < 70) || x < -680;
  const clear =
    !buildings.some((b) => inFootprint(x, z, b.footprints)) &&
    !inFootprint(x, z, roads);
  return forest && clear ? ([x, 0, z] as Point) : null;
}).filter((p): p is Point => p !== null);
