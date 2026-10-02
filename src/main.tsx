import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './App'
import { DataStoreProvider } from './data/DataStoreProvider'
import { createIndexedDbStore } from './data/indexedDbStore'
import './lib/theme'
import './styles/global.css'

registerSW({ immediate: true })

// Swap this for a Firebase/remote implementation of DataStore later.
const store = createIndexedDbStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataStoreProvider store={store}>
      <App />
    </DataStoreProvider>
  </StrictMode>,
)
