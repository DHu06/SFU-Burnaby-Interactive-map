import { describe, expect, it } from "vitest";
import { findRoute } from "./findRoute";
import { nodes } from "../data/nodes";
import { edges } from "../data/edges";
import { directions } from "./directions";
import type { Edge, NavNode } from "../types";
describe("demonstration routes", () => {
  it("connects different buildings through their entrances and an outdoor path", () => {
    const route = findRoute(nodes, edges, "aq201", "asb101")!;
    expect(route.nodes[0].id).toBe("aq201");
    expect(route.nodes.at(-1)!.id).toBe("asb101");
    expect(route.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining(["aq-entry", "asb-entry", "plaza"]),
    );
    expect(route.distance).toBeGreaterThan(0);
    expect(route.seconds).toBeGreaterThan(0);
  });
  it("uses faster stairs by default and elevators for step-free travel", () => {
    const regular = findRoute(nodes, edges, "aq101", "aq301")!;
    const accessible = findRoute(nodes, edges, "aq101", "aq301", true)!;
    expect(regular.edges.some((e) => e.type === "stairs")).toBe(true);
    expect(accessible.edges.some((e) => e.type === "elevator")).toBe(true);
    expect(
      accessible.edges.every((e) => e.accessible && e.type !== "stairs"),
    ).toBe(true);
    expect(accessible.nodes.every((n) => n.accessible)).toBe(true);
  });
  it("returns no route when the only floor connections are stairs", () => {
    expect(
      findRoute(
        nodes,
        edges.filter((e) => e.type !== "elevator"),
        "aq101",
        "aq301",
        true,
      ),
    ).toBeNull();
  });
  it("handles missing, disconnected, and identical locations", () => {
    expect(findRoute(nodes, edges, "missing", "aq101")).toBeNull();
    expect(findRoute(nodes, [], "aq101", "asb101")).toBeNull();
    expect(findRoute(nodes, edges, "aq101", "aq101")).toMatchObject({
      distance: 0,
      seconds: 0,
      edges: [],
    });
  });
  it("describes elevator floor transitions", () => {
    const route = findRoute(nodes, edges, "aq101", "aq301", true)!;
    expect(
      directions(route).some((d) => d.title === "Take the elevator to level 3"),
    ).toBe(true);
  });
  it("has valid endpoints and finite positive weights for all demonstration edges", () => {
    for (const edge of edges) {
      expect(nodes.some((n) => n.id === edge.from)).toBe(true);
      expect(nodes.some((n) => n.id === edge.to)).toBe(true);
      expect(edge.distance).toBeGreaterThan(0);
      expect(edge.seconds).toBeGreaterThan(0);
    }
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length);
  });
});
describe("graph invariants", () => {
  const ns = ["a", "b", "c", "d"].map((id) => ({
    ...nodes[0],
    id,
  })) as NavNode[];
  const edge = (
    from: string,
    to: string,
    seconds: number,
    bidirectional = true,
  ): Edge => ({ ...edges[0], from, to, seconds, bidirectional });
  it("minimizes total time rather than selecting the first discovered path", () => {
    const route = findRoute(
      ns,
      [
        edge("a", "d", 20),
        edge("a", "b", 2),
        edge("b", "c", 2),
        edge("c", "d", 2),
      ],
      "a",
      "d",
    )!;
    expect(route.nodes.map((n) => n.id)).toEqual(["a", "b", "c", "d"]);
    expect(route.seconds).toBe(6);
  });
  it("respects one-way edges", () => {
    const es = [edge("a", "b", 1, false)];
    expect(findRoute(ns, es, "a", "b")).not.toBeNull();
    expect(findRoute(ns, es, "b", "a")).toBeNull();
  });
  it("filters inaccessible nodes even on accessible edges", () => {
    const inaccessible = ns.map((n) =>
      n.id === "b" ? { ...n, accessible: false } : n,
    );
    expect(
      findRoute(
        inaccessible,
        [edge("a", "b", 1), edge("b", "c", 1)],
        "a",
        "c",
        true,
      ),
    ).toBeNull();
    expect(
      findRoute(inaccessible, [edge("a", "b", 1)], "b", "a", true),
    ).toBeNull();
  });
});
