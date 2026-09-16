import type { Building, Point } from "../types";
import { campusGeometry, footprintBounds, type Footprint } from "./geography";
export const provenance = {
  source:
    "Synthetic demonstration interior and routing — not verified SFU locations",
  lastUpdated: "2026-09-15",
};
const heights: Record<string, number> = {
  AQ: 17,
  ASB: 16,
  LIB: 27,
  RCB: 13,
  EDB: 13,
  BLU: 19,
  SWH: 18,
  SH: 12,
  SUB: 18,
  MBC: 16,
  WMC: 25,
  LDC: 13,
  SSB: 15,
  TASC1: 16,
  TASC2: 16,
  CML: 6,
  VP: 7,
  STDM: 9,
};
export const buildings: Building[] = campusGeometry.buildings.map((record) => {
  const footprints = record.polygons as Footprint[],
    bounds = footprintBounds(footprints);
  const position: Point = [
    (bounds.minX + bounds.maxX) / 2,
    0,
    (bounds.minZ + bounds.maxZ) / 2,
  ];
  return {
    id: record.id,
    name: record.id === "ASB" ? "Applied Sciences Building" : record.name,
    short: record.short,
    position,
    size: [
      bounds.maxX - bounds.minX,
      heights[record.id] ?? 10,
      bounds.maxZ - bounds.minZ,
    ],
    footprints,
    heightEstimated: true,
    floors: ["AQ", "ASB"].includes(record.id) ? [1, 2, 3] : [],
    navigable: ["AQ", "ASB"].includes(record.id),
    source: campusGeometry.source,
    lastUpdated: campusGeometry.retrievedAt,
  };
});
