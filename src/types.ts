export type Point = [number, number, number];
export type NodeType =
  | "classroom"
  | "hallway"
  | "entrance"
  | "stairs"
  | "elevator"
  | "outdoor"
  | "washroom";
export interface Provenance {
  source: string;
  lastUpdated: string;
}
export interface NavNode extends Provenance {
  id: string;
  name: string;
  building: string;
  room?: string;
  floor: number;
  position: Point;
  type: NodeType;
  accessible: boolean;
}
export interface Edge extends Provenance {
  from: string;
  to: string;
  distance: number;
  seconds: number;
  type: "walk" | "stairs" | "elevator" | "outdoor";
  accessible: boolean;
  bidirectional: boolean;
}
export interface Building extends Provenance {
  id: string;
  name: string;
  short: string;
  position: Point;
  size: Point;
  floors: number[];
  navigable: boolean;
  modelUrl?: string;
  footprints: import("./data/geography").Footprint[];
  heightEstimated: boolean;
}
export interface Route {
  nodes: NavNode[];
  edges: Edge[];
  distance: number;
  seconds: number;
}
