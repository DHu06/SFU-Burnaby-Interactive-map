import { describe, it, expect } from "vitest";
import { buildings } from "./buildings";
import {
  campusGeometry,
  campusOrigin,
  inFootprint,
  toLatLng,
  toLocal,
} from "./geography";
import { rooms } from "./rooms";
import { googleEmbedUrl, googleMapUrl, googleWalkingUrl } from "./googleMaps";
describe("SFU campus geography", () => {
  it("preserves the source geometry and AQ courtyard", () => {
    expect(buildings.length).toBe(80);
    expect(new Set(buildings.map((b) => b.id)).size).toBe(80);
    expect(buildings.find((b) => b.id === "AQ")!.footprints[0].length).toBe(2);
    expect(
      inFootprint(0, 0, buildings.find((b) => b.id === "AQ")!.footprints),
    ).toBe(false);
    expect(campusGeometry.roads.length).toBeGreaterThan(0);
  });
  it("places campus landmarks on the correct sides of AQ", () => {
    const get = (id: string) => buildings.find((b) => b.id === id)!.position;
    expect(get("LIB")[0]).toBeLessThan(get("AQ")[0]);
    expect(get("RCB")[2]).toBeLessThan(get("AQ")[2]);
    expect(get("ASB")[0]).toBeGreaterThan(get("AQ")[0]);
    expect(get("ASB")[2]).toBeGreaterThan(get("AQ")[2]);
    expect(get("SCC")[2]).toBeGreaterThan(get("AQ")[2]);
    expect(get("LDC")[0]).toBeLessThan(get("LIB")[0]);
  });
  it("converts local metres to geographic coordinates reversibly", () => {
    expect(toLocal(campusOrigin.lat, campusOrigin.lng)).toEqual([0, 0, -0]);
    const p = toLatLng([153, 0, -97]);
    const local = toLocal(p.lat, p.lng);
    expect(local[0]).toBeCloseTo(153, 5);
    expect(local[2]).toBeCloseTo(-97, 5);
  });
  it("keeps demonstration classrooms inside their associated building footprints", () => {
    for (const room of rooms) {
      expect(
        inFootprint(
          room.position[0],
          room.position[2],
          buildings.find((b) => b.id === room.building)!.footprints,
        ),
      ).toBe(true);
      expect(room.source).toContain("demonstration");
    }
  });
  it("creates Google links to actual buildings without exporting demo classroom coordinates", () => {
    const aq = buildings.find((b) => b.id === "AQ")!,
      asb = buildings.find((b) => b.id === "ASB")!;
    const walking = new URL(googleWalkingUrl(aq, asb));
    expect(walking.searchParams.get("api")).toBe("1");
    expect(walking.searchParams.get("travelmode")).toBe("walking");
    expect(walking.searchParams.get("destination")).toContain(
      "Applied Sciences",
    );
    expect(walking.href).not.toContain("Demo");
    expect(new URL(googleEmbedUrl(aq, true)).searchParams.get("t")).toBe("k");
    expect(new URL(googleEmbedUrl(aq, false)).searchParams.get("t")).toBe("m");
    expect(new URL(googleMapUrl(aq)).searchParams.get("center")).toContain(
      "49.",
    );
  });
});
