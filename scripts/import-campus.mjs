import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const base = "https://viewsfu.its.sfu.ca/fsgis/rest/services/";
const sources = {
  buildings: base + "RoomFinder/RoomFinder2024_CampusMapB/MapServer/0",
  roads: base + "Vertisee/Vertisee_Transportations/MapServer/6",
};
const origin = { lat: 49.278945, lng: -122.916558 };
const radius = 6378137,
  rad = Math.PI / 180;
function xy(p) {
  return [
    Number(
      ((p[0] - origin.lng) * rad * radius * Math.cos(origin.lat * rad)).toFixed(
        2,
      ),
    ),
    Number((-(p[1] - origin.lat) * rad * radius).toFixed(2)),
  ];
}
function polygons(g) {
  return (g.type === "Polygon" ? [g.coordinates] : g.coordinates).map((p) =>
    p.map((r) => r.map(xy)),
  );
}
function get(source) {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    outSR: "4326",
    f: "geojson",
  });
  const data = JSON.parse(
    execFileSync(
      "curl",
      [
        "--fail",
        "--location",
        "--silent",
        "--show-error",
        "--max-time",
        "45",
        source + "/query?" + params,
      ],
      { maxBuffer: 10 * 1024 * 1024 },
    ).toString(),
  );
  if (!data.features || data.exceededTransferLimit)
    throw new Error("Incomplete GIS response");
  return data.features;
}
const features = get(sources.buildings).filter((f) =>
  ["Burnaby", "UniverCity"].includes(f.properties.Campus),
);
const ids = new Set();
const buildings = features.map((f) => {
  const p = f.properties;
  let id = p.Abbr;
  if (ids.has(id)) id += `-${f.id}`;
  ids.add(id);
  return {
    id,
    name: p.Name,
    short: p.Abbr,
    sourceObjectId: f.id,
    polygons: polygons(f.geometry),
  };
});
const roads = get(sources.roads).map((f) => ({
  id: String(f.id),
  polygons: polygons(f.geometry),
}));
const output = {
  origin,
  source: sources.buildings,
  roadSource: sources.roads,
  sourceEdition:
    "RoomFinder 2024 campus basemap; transportation service edition unspecified",
  retrievedAt: new Date().toISOString().slice(0, 10),
  attribution:
    "Building and road geometry: Simon Fraser University Facilities Services",
  buildings,
  roads,
};
writeFileSync("src/data/campus-geometry.json", JSON.stringify(output));
console.log(
  `Imported ${buildings.length} buildings and ${roads.length} road features from SFU GIS.`,
);
