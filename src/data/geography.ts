import geometry from "./campus-geometry.json";
import type { Point } from "../types";
export type Ring = [number, number][];
export type Footprint = Ring[];
export const campusGeometry = geometry;
export const campusOrigin = geometry.origin;
const radius = 6378137,
  rad = Math.PI / 180;
export function toLatLng([x, , z]: Point) {
  return {
    lat: campusOrigin.lat - z / (radius * rad),
    lng:
      campusOrigin.lng + x / (radius * rad * Math.cos(campusOrigin.lat * rad)),
  };
}
export function toLocal(lat: number, lng: number): Point {
  return [
    (lng - campusOrigin.lng) * rad * radius * Math.cos(campusOrigin.lat * rad),
    0,
    -(lat - campusOrigin.lat) * rad * radius,
  ];
}
export function footprintBounds(polygons: Footprint[]) {
  const points = polygons.flatMap((p) => p[0]);
  return {
    minX: Math.min(...points.map((p) => p[0])),
    maxX: Math.max(...points.map((p) => p[0])),
    minZ: Math.min(...points.map((p) => p[1])),
    maxZ: Math.max(...points.map((p) => p[1])),
  };
}
export function pointInRing(x: number, z: number, ring: Ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i],
      [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
      inside = !inside;
  }
  return inside;
}
export function inFootprint(x: number, z: number, polygons: Footprint[]) {
  return polygons.some(
    ([outer, ...holes]) =>
      pointInRing(x, z, outer) &&
      !holes.some((hole) => pointInRing(x, z, hole)),
  );
}
