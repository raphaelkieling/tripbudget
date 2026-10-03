import { useSyncExternalStore } from 'react'
import { createStoredValue } from './storedValue'

export type Theme = 'light' | 'dark'

/** Must match the inline script in index.html that applies the theme before first paint. */
const STORAGE_KEY = 'tripbudget-theme'
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/** The user's explicit choice, falling back to the OS preference. */
function currentTheme(): Theme {
  return storedTheme() ?? (systemDark.matches ? 'dark' : 'light')
}

function apply() {
  document.documentElement.dataset.theme = currentTheme()
  listeners.forEach((listener) => listener())
}

// Follow OS changes until the user picks a theme themselves.
systemDark.addEventListener('change', () => {
  if (!storedTheme()) apply()
})

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Private mode etc.: the choice just won't survive a reload.
  }
  document.documentElement.dataset.theme = theme
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, () => (document.documentElement.dataset.theme as Theme) ?? currentTheme())
  return [theme, setTheme]
}

apply()

/** Color palettes, combined with light/dark. Colors live in tokens.css. */
export const PALETTES = ['violet', 'ocean', 'teal', 'forest', 'sunset', 'rose', 'cherry', 'amber', 'graphite', 'cocoa'] as const
export type Palette = (typeof PALETTES)[number]

/** Each palette's primary color, for the picker swatches. Keep in sync with tokens.css. */
export const PALETTE_COLORS: Record<Palette, string> = {
  violet: '#7c5cff',
  ocean: '#2563eb',
  teal: '#0e8f9a',
  forest: '#24884d',
  sunset: '#e8590c',
  rose: '#e0317a',
  cherry: '#d6293e',
  amber: '#b7791f',
  graphite: '#4b5563',
  cocoa: '#8b5e3c',
}

/** Must match the inline script in index.html. */
const palette = createStoredValue<Palette>(
  'tripbudget-palette',
  (raw) => (PALETTES.includes(raw as Palette) ? (raw as Palette) : null),
  'violet',
)

const applyPalette = () => {
  document.documentElement.dataset.palette = palette.get()
}
palette.subscribe(applyPalette)
applyPalette()

export const usePalette = palette.use
