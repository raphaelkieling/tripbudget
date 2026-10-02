import {
  BedIcon,
  BusIcon,
  ForkKnifeIcon,
  ShoppingBagIcon,
  SparkleIcon,
  TicketIcon,
  type Icon,
} from '@phosphor-icons/react'
import type { ToneKey } from './appearance'

export interface Category {
  label: string
  icon: Icon
  tone: ToneKey
}

export const CATEGORIES = {
  food: { label: 'Food', icon: ForkKnifeIcon, tone: 'coral' },
  transport: { label: 'Transport', icon: BusIcon, tone: 'sky' },
  stay: { label: 'Stay', icon: BedIcon, tone: 'violet' },
  fun: { label: 'Fun', icon: TicketIcon, tone: 'pink' },
  shopping: { label: 'Shopping', icon: ShoppingBagIcon, tone: 'sun' },
  other: { label: 'Other', icon: SparkleIcon, tone: 'mint' },
} as const satisfies Record<string, Category>

export type CategoryKey = keyof typeof CATEGORIES

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[]
