import { createContext, use } from 'react'
import type { DataStore } from './DataStore'

export const DataStoreContext = createContext<DataStore | null>(null)

export function useDataStore(): DataStore {
  const store = use(DataStoreContext)
  if (!store) throw new Error('useDataStore must be used inside <DataStoreProvider>')
  return store
}
