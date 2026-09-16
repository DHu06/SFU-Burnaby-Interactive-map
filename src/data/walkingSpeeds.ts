/**
 * Shared walking-speed constants. Used both when generating demo edge
 * durations (src/data/edges.ts) and as the A* heuristic's speed assumption
 * (src/lib/pathfinding/astar.ts), so the heuristic never overestimates.
 */
export const WALK_SPEED_MPS = 1.3
export const STAIR_SPEED_MPS = 0.6
export const ELEVATOR_WAIT_SEC = 25
