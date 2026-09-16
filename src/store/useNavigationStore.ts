import { create } from 'zustand'

interface NavigationState {
  startId: string | null
  endId: string | null
  accessibleOnly: boolean

  /** Building currently focused in the 3D scene (drives fade/isolate + floor selector). */
  selectedBuildingId: string | null
  selectedFloor: string | null

  /** Index into the current route's steps, used for camera focus and "Start Navigation" mode. */
  activeStepIndex: number | null
  isNavigating: boolean

  setStart: (id: string | null) => void
  setEnd: (id: string | null) => void
  swap: () => void
  setAccessibleOnly: (value: boolean) => void
  selectBuilding: (id: string | null, floor?: string | null) => void
  setSelectedFloor: (floor: string | null) => void
  setActiveStep: (index: number | null) => void
  startNavigation: () => void
  stopNavigation: () => void
  nextStep: (stepCount: number) => void
  prevStep: () => void
  reset: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  startId: null,
  endId: null,
  accessibleOnly: false,
  selectedBuildingId: null,
  selectedFloor: null,
  activeStepIndex: null,
  isNavigating: false,

  setStart: (id) => set({ startId: id }),
  setEnd: (id) => set({ endId: id }),
  swap: () => set((s) => ({ startId: s.endId, endId: s.startId })),
  setAccessibleOnly: (value) => set({ accessibleOnly: value }),
  selectBuilding: (id, floor = null) => set({ selectedBuildingId: id, selectedFloor: floor }),
  setSelectedFloor: (floor) => set({ selectedFloor: floor }),
  setActiveStep: (index) => set({ activeStepIndex: index }),

  startNavigation: () => set({ isNavigating: true, activeStepIndex: 0 }),
  stopNavigation: () => set({ isNavigating: false, activeStepIndex: null }),
  nextStep: (stepCount) => {
    const current = get().activeStepIndex ?? 0
    set({ activeStepIndex: Math.min(current + 1, stepCount - 1) })
  },
  prevStep: () => {
    const current = get().activeStepIndex ?? 0
    set({ activeStepIndex: Math.max(current - 1, 0) })
  },

  reset: () =>
    set({
      startId: null,
      endId: null,
      activeStepIndex: null,
      isNavigating: false,
    }),
}))
