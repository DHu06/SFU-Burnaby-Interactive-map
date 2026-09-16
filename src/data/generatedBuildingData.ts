import { buildings, GENERATED_BUILDING_IDS } from '@/data/buildings'
import { generateStandardBuildingGraph } from '@/data/generateBuildingGraph'

const generated = buildings
  .filter((b) => GENERATED_BUILDING_IDS.includes(b.id))
  .map((b) => generateStandardBuildingGraph(b))

export const generatedRooms = generated.flatMap((g) => g.rooms)
export const generatedNodes = generated.flatMap((g) => g.nodes)
export const generatedEdges = generated.flatMap((g) => g.edges)
