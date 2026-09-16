import type { Building } from "../types";
import { campusOrigin, toLatLng } from "./geography";
export function googleMapUrl(building?: Building) {
  const p = building ? toLatLng(building.position) : campusOrigin;
  return (
    "https://www.google.com/maps/@?" +
    new URLSearchParams({
      api: "1",
      map_action: "map",
      center: `${p.lat},${p.lng}`,
      zoom: building ? "18" : "16",
      basemap: "satellite",
    })
  );
}
export function googleEmbedUrl(
  building: Building | undefined,
  satellite: boolean,
) {
  const p = building
    ? toLatLng(building.position)
    : { lat: 49.279, lng: -122.919 };
  return (
    "https://maps.google.com/maps?" +
    new URLSearchParams({
      q: building
        ? `${building.name}, Simon Fraser University, Burnaby`
        : "Simon Fraser University Burnaby",
      ll: `${p.lat},${p.lng}`,
      z: building ? "18" : "16",
      t: satellite ? "k" : "m",
      output: "embed",
    })
  );
}
export function googleWalkingUrl(start: Building, end: Building) {
  return (
    "https://www.google.com/maps/dir/?" +
    new URLSearchParams({
      api: "1",
      origin: `${start.name}, Simon Fraser University, Burnaby`,
      destination: `${end.name}, Simon Fraser University, Burnaby`,
      travelmode: "walking",
    })
  );
}
