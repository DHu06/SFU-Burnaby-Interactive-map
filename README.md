# SFU Campus Wayfinder

A responsive campus-navigation prototype built with React, TypeScript, Vite, Tailwind CSS, React Three Fiber, Drei, and React Context.

Building and road footprints now come from SFU Facilities Services GIS, preserving real geographic placement, outline geometry, and courtyard holes. **Building heights, vegetation, athletics-field geometry, room locations, interior floors, routes, travel times, and accessibility attributes remain illustrative. This is not an official SFU navigation tool.**

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
- Switch to **Top down** for a north-up 3D plan. Drag to pan in this mode. The **2D map** also supports dragging and zoom controls.
- Open **Google Maps** for live satellite or street-map reference. Selecting a building in Explore campus updates the embedded map. The outdoor-directions link opens Google walking directions between the selected buildings; it never exports demo room positions.
- Show the legend, toggle the theme, or collapse the mobile planner.

## Structure

```text
src/
  components/       Campus scene, autocomplete, directions
  data/
    campus-geometry.json  SFU GIS snapshot with polygons and provenance
    geography.ts    Local metric/geographic coordinate conversion
    googleMaps.ts   Google embed, map, and outdoor-directions URLs
    landscape.ts    Explicitly schematic landscaping
    buildings.ts   GIS-derived footprints, estimated heights, demo floors
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

Each `NavNode` has a stable ID, display name, building ID, optional room number, floor, `[x,y,z]` position, node type, accessibility, source, and last-updated date. Y is vertical. One horizontal coordinate unit is one local metre, with X east and Z south. The local origin is latitude 49.278945, longitude -122.916558; the campus-scale equirectangular conversion is in `geography.ts`. Room and graph coordinates remain synthetic despite the real building outlines.

Each `Edge` has source and destination IDs, distance, estimated seconds, connection type, accessibility, bidirectionality, source, and last-updated date. Routing minimizes seconds, not distance. Step-free routing excludes stairs, inaccessible edges, and inaccessible nodes. Missing endpoints or disconnected locations return `null`; identical endpoints return a zero-length route.

The example edge factory derives distance from coordinates, adds elevator waiting time, and assigns a walking speed. Replace these estimates with measured values for a real campus graph. All current edges are bidirectional; the routing engine also supports one-way edges.

## Add buildings and classrooms

1. Import a building footprint into `data/campus-geometry.json` or extend the importer. `data/buildings.ts` derives bounding boxes and positions from those polygons. Preserve courtyard rings and source metadata; set `navigable` only when navigation nodes and connections exist.
2. Add classroom nodes to `data/rooms.ts`. Use stable IDs and the matching building ID; room numbers here must remain explicitly marked as demo until verified.
3. Add floor corridors, entrances, stairs, elevators, and washrooms to `data/nodes.ts` as needed.
4. Connect rooms to corridors and create vertical and inter-building edges in `data/edges.ts`. Both ends must exist. Record measured distance, travel time, directionality, and verified accessibility.
5. Add route tests, especially for accessible alternatives and disconnected floors.

## Import verified data and models

The repository bundles 80 building features from the [SFU RoomFinder 2024 Building Basemap](https://viewsfu.its.sfu.ca/fsgis/rest/services/RoomFinder/RoomFinder2024_CampusMapB/MapServer/0) and 27 road features from [SFU Transportation GIS](https://viewsfu.its.sfu.ca/fsgis/rest/services/Vertisee/Vertisee_Transportations/MapServer/6). Their geographic relationships were cross-checked against the user-supplied campus map and [SFU Facilities campus directory](https://www.sfu.ca/fs/campus-maps.html). The service edition is 2024; retrieval date does not imply that every footprint was surveyed on that date. Google imagery is displayed by Google and is not copied into the model.

Run `npm run import:campus` to refresh the snapshot (network and `curl` required). The script checks for incomplete responses, filters Burnaby/UniverCity features, projects WGS84 coordinates into local metres, and records the source and retrieval date. The polygon hierarchy preserves MultiPolygons and interior courtyard rings. `FootprintMesh` extrudes these outlines using explicitly estimated heights; it does not claim to reproduce building elevations or roof detail.

Floor-plan or GeoJSON adapters can emit the existing graph contracts without changing routing. Preserve licensing, source URLs, survey dates, and coordinate alignment. Validate connectivity and physical accessibility on site before removing demo labels.

For GLB/GLTF models, place assets in `public/models/` and set `modelUrl: '/models/example.glb'` on a building. The reusable `BuildingModel` uses `useGLTF` and clones the loaded scene. The default interior view remains schematic; floor-aware real models require separate floor meshes and verified room geometry. Optimize models, textures, and polygon counts before deployment.

## Limitations and performance

- AQ and ASB are the only navigable demonstration buildings. No real room locations or SFU access rules are represented.
- Walk estimates are illustrative; there is no live elevator status, occupancy, closures, emergency routing, or indoor positioning.
- Floor views show schematic room markers and corridors rather than architectural plans. The 2D overview projects vertical route sections onto the ground plane.
- Route instructions advance manually. The whole route remains visible when a floor is selected for context.
- The scene loads lazily, caps pixel ratio at 1.5, and uses memoized low-poly extrusions. Local views use the bundled GIS snapshot. Google Maps makes external requests only when its tab is opened. The Three.js scene bundle remains the largest asset.
- If WebGL initialization or scene rendering fails, the app displays an SVG map. The SVG overview supports building selection, route display, dragging, and zooming.
- The demo has no backend, account system, saved routes, or offline service worker.

## Location privacy

Use my location explains that building outlines are georeferenced but indoor nodes and accessible entrances remain unverified. It does not request browser geolocation or substitute a fabricated origin. No device coordinates are collected or transmitted by the app. Indoor GPS may be approximate or unavailable. Once entrances and paths are verified, add opt-in geolocation with accuracy and nearest-entrance confirmation.

The Google Maps tab loads a third-party iframe only after selection. Google receives ordinary web-request information and the selected public building name/position; its privacy policy applies. No indoor demo path or accessibility preference is sent. Switching back unmounts the iframe.

## Google Maps integration

`GoogleCampusMap` embeds the public Google Maps viewer, retaining its controls and attribution. No API key or paid Maps JavaScript SDK is needed for this viewer. Satellite/map toggles update the iframe, and a permanent external link handles blocked embeds or unavailable network access. Provider/network failures inside the cross-origin frame cannot be inspected by the app.

This is an outdoor reference view, not a Google basemap underneath the custom 3D meshes. The iframe cannot host app-owned building or route overlays. A future programmatically controlled map/overlay would require Maps JavaScript API configuration. Browser tests mock the iframe to stay deterministic; the live satellite embed was separately checked in Chromium.

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
