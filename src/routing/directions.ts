import type { Route } from "../types";
export function directions(route: Route) {
  return route.edges.map((edge, i) => {
    const from = route.nodes[i],
      to = route.nodes[i + 1];
    let title = `Continue to ${to.name}`;
    if (edge.type === "elevator")
      title = `Take the elevator to level ${to.floor}`;
    else if (edge.type === "stairs")
      title = `Take the stairs ${to.floor > from.floor ? "up" : "down"} to level ${to.floor}`;
    else if (edge.type === "outdoor")
      title =
        to.type === "entrance"
          ? `Enter ${to.building} through the accessible entrance`
          : `Follow the outdoor path to ${to.name.replace("Demo ", "")}`;
    else if (to.type === "classroom") title = `Arrive at ${to.name}`;
    else if (to.type === "entrance")
      title = `Exit through the ${to.building} accessible entrance`;
    return {
      title,
      detail: `${Math.round(edge.distance)} m · ${edge.type === "outdoor" ? "Outdoors" : `${to.building} · Level ${to.floor}`}`,
      from,
      to,
    };
  });
}
