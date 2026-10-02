import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Expense, Trip } from '../domain/types'
import { createId } from '../lib/id'
import type { DataStore } from './DataStore'

interface TripBudgetDB extends DBSchema {
  trips: { key: string; value: Trip }
  expenses: { key: string; value: Expense; indexes: { byTrip: string } }
}

const DB_NAME = 'tripbudget'
const DB_VERSION = 1

/** Local-only DataStore backed by the browser's IndexedDB. */
export function createIndexedDbStore(): DataStore {
  const dbPromise: Promise<IDBPDatabase<TripBudgetDB>> = openDB<TripBudgetDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('trips', { keyPath: 'id' })
      const expenses = db.createObjectStore('expenses', { keyPath: 'id' })
      expenses.createIndex('byTrip', 'tripId')
    },
  })

  // Notify this tab directly and other open tabs via BroadcastChannel.
  const listeners = new Set<() => void>()
  const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(DB_NAME) : undefined
  const emit = () => listeners.forEach((l) => l())
  channel?.addEventListener('message', emit)
  const changed = () => {
    emit()
    channel?.postMessage('changed')
  }

  const now = () => new Date().toISOString()

  return {
    trips: {
      async list() {
        const trips = await (await dbPromise).getAll('trips')
        return trips.sort((a, b) => b.startDate.localeCompare(a.startDate))
      },
      async get(id) {
        return (await dbPromise).get('trips', id)
      },
      async create(input) {
        const trip: Trip = { ...input, id: createId(), createdAt: now(), updatedAt: now() }
        await (await dbPromise).add('trips', trip)
        changed()
        return trip
      },
      async update(id, patch) {
        const db = await dbPromise
        const current = await db.get('trips', id)
        if (!current) throw new Error(`Trip ${id} not found`)
        const trip: Trip = { ...current, ...patch, id, updatedAt: now() }
        await db.put('trips', trip)
        changed()
        return trip
      },
      async remove(id) {
        const db = await dbPromise
        const tx = db.transaction(['trips', 'expenses'], 'readwrite')
        const expenseKeys = await tx.objectStore('expenses').index('byTrip').getAllKeys(id)
        await Promise.all([
          tx.objectStore('trips').delete(id),
          ...expenseKeys.map((key) => tx.objectStore('expenses').delete(key)),
          tx.done,
        ])
        changed()
      },
    },
    expenses: {
      async listByTrip(tripId) {
        return (await dbPromise).getAllFromIndex('expenses', 'byTrip', tripId)
      },
      async create(input) {
        const expense: Expense = { ...input, id: createId(), createdAt: now() }
        await (await dbPromise).add('expenses', expense)
        changed()
        return expense
      },
      async update(id, patch) {
        const db = await dbPromise
        const current = await db.get('expenses', id)
        if (!current) throw new Error(`Expense ${id} not found`)
        const expense: Expense = { ...current, ...patch, id }
        await db.put('expenses', expense)
        changed()
        return expense
      },
      async remove(id) {
        await (await dbPromise).delete('expenses', id)
        changed()
      },
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
