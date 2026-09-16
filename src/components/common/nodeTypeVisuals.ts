import {
  DoorOpen,
  Armchair,
  ArrowUpDown,
  Footprints,
  MapPin,
  ToiletIcon,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import type { NodeType } from '@/data/types'

export interface NodeTypeVisual {
  icon: LucideIcon
  /** Tailwind text-color utility class, shared by search results, the legend, and 3D markers. */
  colorClass: string
  /** Raw hex used for Three.js materials, which can't consume Tailwind classes. */
  hex: string
  label: string
}

export const NODE_TYPE_VISUALS: Record<NodeType, NodeTypeVisual> = {
  classroom: { icon: Armchair, colorClass: 'text-sfu-red', hex: '#a6192e', label: 'Classroom' },
  hallway: { icon: Waypoints, colorClass: 'text-charcoal/50 dark:text-light-grey/50', hex: '#9ca3af', label: 'Hallway' },
  entrance: { icon: DoorOpen, colorClass: 'text-emerald-600', hex: '#059669', label: 'Entrance' },
  stairs: { icon: Footprints, colorClass: 'text-amber-600', hex: '#d97706', label: 'Stairs' },
  elevator: { icon: ArrowUpDown, colorClass: 'text-blue-600', hex: '#2563eb', label: 'Elevator' },
  washroom: { icon: ToiletIcon, colorClass: 'text-violet-600', hex: '#7c3aed', label: 'Washroom' },
  outdoor: { icon: MapPin, colorClass: 'text-charcoal/70 dark:text-light-grey/70', hex: '#6b7280', label: 'Outdoor path' },
}
