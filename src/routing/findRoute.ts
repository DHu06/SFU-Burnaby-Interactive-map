import type { Edge, NavNode, Route } from "../types";
export function findRoute(
  nodes: NavNode[],
  edges: Edge[],
  start: string,
  end: string,
  accessible = false,
): Route | null {
  const lookup = new Map(nodes.map((n) => [n.id, n]));
  if (
    !lookup.has(start) ||
    !lookup.has(end) ||
    (accessible &&
      (!lookup.get(start)!.accessible || !lookup.get(end)!.accessible))
  )
    return null;
  const distances = new Map<string, number>([[start, 0]]),
    previous = new Map<string, { id: string; edge: Edge }>(),
    remaining = new Set(nodes.map((n) => n.id));
  while (remaining.size) {
    let current: string | undefined,
      best = Infinity;
    for (const id of remaining) {
      const d = distances.get(id) ?? Infinity;
      if (d < best) {
        current = id;
        best = d;
      }
    }
    if (current === undefined) break;
    if (current === end) {
      const path: NavNode[] = [lookup.get(end)!],
        steps: Edge[] = [];
      let id = end;
      while (id !== start) {
        const p = previous.get(id)!;
        steps.unshift(p.edge);
        path.unshift(lookup.get(p.id)!);
        id = p.id;
      }
      return {
        nodes: path,
        edges: steps,
        distance: steps.reduce((sum, e) => sum + e.distance, 0),
        seconds: steps.reduce((sum, e) => sum + e.seconds, 0),
      };
    }
    remaining.delete(current);
    for (const edge of edges) {
      const next =
        edge.from === current
          ? edge.to
          : edge.bidirectional && edge.to === current
            ? edge.from
            : null;
      if (
        !next ||
        !remaining.has(next) ||
        !lookup.has(next) ||
        !Number.isFinite(edge.seconds) ||
        edge.seconds < 0
      )
        continue;
      if (
        accessible &&
        (!edge.accessible ||
          edge.type === "stairs" ||
          !lookup.get(next)!.accessible)
      )
        continue;
      const cost = best + edge.seconds;
      if (cost < (distances.get(next) ?? Infinity)) {
        distances.set(next, cost);
        previous.set(next, { id: current, edge });
      }
    }
  }
  return null;
}
