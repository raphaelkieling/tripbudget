import type { ISODate } from '../lib/date'
import type { Cents, CurrencyCode } from '../lib/money'
import type { CategoryKey } from './categories'
import type { ToneKey, TripIconKey } from './appearance'

export interface Trip {
  id: string
  name: string
  startDate: ISODate
  endDate: ISODate
  budget: Cents
  currency: CurrencyCode
  icon: TripIconKey
  tone: ToneKey
  createdAt: string
  updatedAt: string
}

export type TripInput = Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>

export interface Expense {
  id: string
  tripId: string
  amount: Cents
  description: string
  category: CategoryKey
  date: ISODate
  /** Big purchase split equally over every day from `date` to the end of the trip. */
  spread?: boolean
  createdAt: string
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>
