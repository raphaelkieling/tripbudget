import type { ReactNode } from 'react'
import type { DataStore } from './DataStore'
import { DataStoreContext } from './DataStoreContext'

export function DataStoreProvider({ store, children }: { store: DataStore; children: ReactNode }) {
  return <DataStoreContext value={store}>{children}</DataStoreContext>
}
