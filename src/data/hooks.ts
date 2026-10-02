import { useEffect, useEffectEvent, useState } from 'react'
import { computeTripBudget } from '../domain/budget'
import type { Expense, Trip } from '../domain/types'
import { todayISO } from '../lib/date'
import type { DataStore } from './DataStore'
import { useDataStore } from './DataStoreContext'

interface QueryState<T> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
}

/**
 * Runs `query` against the store and re-runs it whenever data changes.
 * `key` identifies the query: change it to refetch with new parameters.
 */
export function useStoreQuery<T>(key: string, query: (store: DataStore) => Promise<T>): QueryState<T> {
  const store = useDataStore()
  const [result, setResult] = useState<{ key?: string; data?: T; error?: Error }>({})
  const runQuery = useEffectEvent(() => query(store))

  useEffect(() => {
    let cancelled = false
    const run = () =>
      runQuery().then(
        (data) => !cancelled && setResult({ key, data }),
        (error: Error) => !cancelled && setResult({ key, error }),
      )
    run()
    const unsubscribe = store.subscribe(run)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [store, key])

  // Results for a previous key are stale: report loading until the new ones arrive.
  const fresh = result.key === key
  return { data: fresh ? result.data : undefined, loading: !fresh, error: fresh ? result.error : undefined }
}

export function useTrips() {
  return useStoreQuery('trips', (s) => s.trips.list())
}

export function useTrip(id: string) {
  return useStoreQuery(`trip:${id}`, (s) => s.trips.get(id))
}

export function useExpenses(tripId: string) {
  return useStoreQuery(`expenses:${tripId}`, (s) => s.expenses.listByTrip(tripId))
}

/** Today's date, refreshed when the tab regains focus or the day rolls over. */
export function useToday() {
  const [today, setToday] = useState(todayISO)
  useEffect(() => {
    const refresh = () => setToday(todayISO())
    const timer = setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return today
}

export function useTripBudget(trip: Trip | undefined, expenses: Expense[] | undefined) {
  const today = useToday()
  return trip && expenses ? computeTripBudget(trip, expenses, today) : undefined
}

/** All trips with their expenses, for overview screens. */
export function useTripsWithExpenses() {
  return useStoreQuery('trips-with-expenses', async (s) => {
    const trips = await s.trips.list()
    return Promise.all(trips.map(async (trip) => ({ trip, expenses: await s.expenses.listByTrip(trip.id) })))
  })
}
