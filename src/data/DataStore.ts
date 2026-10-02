import type { Expense, ExpenseInput, Trip, TripInput } from '../domain/types'

/**
 * Storage contract for the whole app. UI code only talks to this interface,
 * so swapping IndexedDB for Firebase/Supabase/an API means writing one new
 * implementation and passing it to <DataStoreProvider>.
 */
export interface DataStore {
  trips: {
    list(): Promise<Trip[]>
    get(id: string): Promise<Trip | undefined>
    create(input: TripInput): Promise<Trip>
    update(id: string, patch: Partial<TripInput>): Promise<Trip>
    /** Also removes the trip's expenses. */
    remove(id: string): Promise<void>
  }
  expenses: {
    listByTrip(tripId: string): Promise<Expense[]>
    create(input: ExpenseInput): Promise<Expense>
    update(id: string, patch: Partial<ExpenseInput>): Promise<Expense>
    remove(id: string): Promise<void>
  }
  /**
   * Called whenever any data changes (including from other tabs/devices).
   * Maps naturally onto Firestore's onSnapshot. Returns an unsubscribe fn.
   */
  subscribe(listener: () => void): () => void
}
