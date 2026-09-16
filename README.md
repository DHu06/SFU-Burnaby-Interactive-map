# SFU Campus Wayfinder

A responsive campus-navigation prototype built with React, TypeScript, Vite, Tailwind CSS, React Three Fiber, Drei, and React Context.

**All coordinates, room numbers, floor layouts, paths, travel times, and accessibility attributes are demonstration data. This is not an official SFU map and must not be used for real navigation.** Building names provide context; their placement is illustrative.

## Run locally

Requires Node.js 22.12+ (developed with Node 24).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` produces `dist/`; `npm run preview` serves the production build. `npm test` runs routing unit tests. `npm run test:e2e` runs browser checks after `npx playwright install chromium`.

## Explore

- Search by building, sample classroom, entrance, or outdoor place. Autocomplete supports arrow keys, Enter, and Escape.
- Choose the sample AQ classroom 201 → ASB classroom 101 route to cross floors and buildings.
- Try AQ classroom 101 → AQ classroom 301 with step-free mode off and on to compare stairs and elevators.
- Click Find my route, then any direction to focus that segment. Start navigation advances manually with Next step; it does not track physical movement.
- Click AQ or ASB, or use Explore campus, to select floors. Other buildings are context models without navigation data.
- Drag to orbit, right-drag to pan, scroll/pinch to zoom. Use the map controls to zoom or reset.
- Switch to 2D, show the legend, toggle the theme, or collapse the mobile planner.

## Structure

```text
src/
  components/       Campus scene, autocomplete, directions
  data/
    buildings.ts    Footprints, floors, future model URLs, provenance
    rooms.ts        Demonstration classroom nodes
    nodes.ts        Hallways, elevators, stairs, entrances, outdoor paths
    edges.ts        Connections and their costs
  routing/
    findRoute.ts    Pure Dijkstra shortest-time routing
    directions.ts  Route-to-instruction conversion
    *.test.ts       Graph and accessibility unit tests
  types.ts          Shared typed data contracts
  store.tsx         React Context application state
  App.tsx           Responsive app shell and route planner
  styles.css        Tailwind import, theme tokens, responsive styles
```

## Navigation data

Each `NavNode` has a stable ID, display name, building ID, optional room number, floor, `[x,y,z]` position, node type, accessibility, source, and last-updated date. Y is vertical. One horizontal coordinate unit is treated as a demonstration metre.

Each `Edge` has source and destination IDs, distance, estimated seconds, connection type, accessibility, bidirectionality, source, and last-updated date. Routing minimizes seconds, not distance. Step-free routing excludes stairs, inaccessible edges, and inaccessible nodes. Missing endpoints or disconnected locations return `null`; identical endpoints return a zero-length route.

The example edge factory derives distance from coordinates, adds elevator waiting time, and assigns a walking speed. Replace these estimates with measured values for a real campus graph. All current edges are bidirectional; the routing engine also supports one-way edges.

## Add buildings and classrooms

1. Add a `Building` to `data/buildings.ts`, including a unique ID, footprint, floor list, source, and last-updated date. Set `navigable` only when navigation nodes and connections exist.
2. Add classroom nodes to `data/rooms.ts`. Use stable IDs and the matching building ID; room numbers here must remain explicitly marked as demo until verified.
3. Add floor corridors, entrances, stairs, elevators, and washrooms to `data/nodes.ts` as needed.
4. Connect rooms to corridors and create vertical and inter-building edges in `data/edges.ts`. Both ends must exist. Record measured distance, travel time, directionality, and verified accessibility.
5. Add route tests, especially for accessible alternatives and disconnected floors.

## Import verified data and models

No GIS importer or verified SFU dataset is bundled. An adapter can transform floor plans or GeoJSON into the same TypeScript contracts without changing the routing engine. Convert latitude/longitude into a local metric coordinate system before creating `[x,y,z]`; do not put degrees directly into scene coordinates. Align building models and floor elevations to that same origin. Preserve source URLs, survey dates, licensing, and last-updated information on every record. Validate connectivity and physical accessibility on site before removing demo labels.

For GLB/GLTF models, place assets in `public/models/` and set `modelUrl: '/models/example.glb'` on a building. The reusable `BuildingModel` uses `useGLTF` and clones the loaded scene. The default interior view remains schematic; floor-aware real models require separate floor meshes and verified room geometry. Optimize models, textures, and polygon counts before deployment.

## Limitations and performance

- AQ and ASB are the only navigable demonstration buildings. No real room locations or SFU access rules are represented.
- Walk estimates are illustrative; there is no live elevator status, occupancy, closures, emergency routing, or indoor positioning.
- Floor views show schematic room markers and corridors rather than architectural plans. The 2D overview projects vertical route sections onto the ground plane.
- Route instructions advance manually. The whole route remains visible when a floor is selected for context.
- The scene loads lazily, caps pixel ratio at 1.5, uses low-poly trees/buildings, and avoids external map/model requests. The Three.js scene bundle remains the largest asset.
- If WebGL initialization or scene rendering fails, the app displays an SVG map. The SVG overview supports building selection and routing, but does not currently pan or zoom.
- The demo has no backend, account system, saved routes, or offline service worker.

## Location privacy

Use my location explains why location cannot be placed on this ungeoreferenced demonstration. It intentionally does not request browser location permissions or substitute a fabricated origin. No coordinates are collected, stored, or transmitted. Indoor GPS may be approximate or unavailable. With a verified georeferenced dataset, add explicit opt-in browser geolocation, show its reported accuracy, snap only within a conservative radius, and let users confirm the nearest mapped entrance. Avoid continuous tracking unless separately requested.

## Development phases

Implemented in the requested sequence with a production build after phases 1–7:

1. Responsive shell and basic 3D scene.
2. Typed building, room, node, and edge datasets.
3. Search and keyboard autocomplete.
4. Independent Dijkstra routing.
5. Animated map route and current-segment highlight.
6. Building selection, floor switching, and schematic interiors.
7. Directions, manual navigation, and step-free routes.
8. Routing tests, browser checks, dependency review, and documentation.
