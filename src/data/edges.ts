import type { Edge } from "../types";
import { nodes } from "./nodes";
import { provenance } from "./buildings";
const connect = (
  from: string,
  to: string,
  type: Edge["type"] = "walk",
): Edge => {
  const a = nodes.find((n) => n.id === from)!,
    b = nodes.find((n) => n.id === to)!;
  const distance = Math.hypot(...a.position.map((v, i) => v - b.position[i]));
  return {
    from,
    to,
    type,
    distance,
    seconds:
      type === "elevator" ? 35 : distance / (type === "stairs" ? 0.6 : 1.25),
    accessible: type !== "stairs",
    bidirectional: true,
    ...provenance,
  };
};
export const edges: Edge[] = ["AQ", "ASB"].flatMap((b) =>
  [1, 2, 3].flatMap((f) => [
    connect(`${b.toLowerCase()}${f}01`, `${b}-hall-${f}`),
    connect(`${b}-hall-${f}`, `${b}-lift-${f}`),
    connect(`${b}-hall-${f}`, `${b}-stairs-${f}`),
    ...(f < 3
      ? [
          connect(`${b}-lift-${f}`, `${b}-lift-${f + 1}`, "elevator"),
          connect(`${b}-stairs-${f}`, `${b}-stairs-${f + 1}`, "stairs"),
        ]
      : []),
  ]),
);
edges.push(
  connect("AQ-hall-1", "aq-entry"),
  connect("ASB-hall-1", "asb-entry"),
  connect("aq-entry", "plaza", "outdoor"),
  connect("plaza", "junction", "outdoor"),
  connect("junction", "asb-entry", "outdoor"),
  connect("aq-wc", "AQ-hall-1"),
);
