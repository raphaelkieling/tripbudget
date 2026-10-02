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

/** Labels live in the i18n dictionaries (`t.categories`). */
export interface Category {
  icon: Icon
  tone: ToneKey
}

export const CATEGORIES = {
  food: { icon: ForkKnifeIcon, tone: 'coral' },
  transport: { icon: BusIcon, tone: 'sky' },
  stay: { icon: BedIcon, tone: 'violet' },
  fun: { icon: TicketIcon, tone: 'pink' },
  shopping: { icon: ShoppingBagIcon, tone: 'sun' },
  other: { icon: SparkleIcon, tone: 'mint' },
} as const satisfies Record<string, Category>

export type CategoryKey = keyof typeof CATEGORIES

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[]
