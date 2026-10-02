import { createHashRouter, RouterProvider } from 'react-router'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TripPage } from './pages/TripPage'

// Hash routing works on GitHub Pages (no server rewrites needed) and with the
// PWA's offline cache.
const router = createHashRouter([
  { path: '/', element: <HomePage /> },
  { path: '/trips/:tripId', element: <TripPage /> },
  { path: '*', element: <NotFoundPage /> },
])

export function App() {
  return <RouterProvider router={router} />
}
