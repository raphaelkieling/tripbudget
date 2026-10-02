import {
  AirplaneTiltIcon,
  CityIcon,
  IslandIcon,
  MountainsIcon,
  SailboatIcon,
  TentIcon,
  TrainIcon,
  CameraIcon,
  type Icon,
} from '@phosphor-icons/react'

/** Color tones map to CSS tokens: --tone-<key> and --tone-<key>-soft. */
export const TONES = ['violet', 'pink', 'mint', 'sun', 'sky', 'coral'] as const
export type ToneKey = (typeof TONES)[number]

export const TRIP_ICONS = {
  plane: AirplaneTiltIcon,
  beach: IslandIcon,
  mountain: MountainsIcon,
  city: CityIcon,
  camping: TentIcon,
  cruise: SailboatIcon,
  train: TrainIcon,
  sightseeing: CameraIcon,
} satisfies Record<string, Icon>

export type TripIconKey = keyof typeof TRIP_ICONS
