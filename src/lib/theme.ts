import { useSyncExternalStore } from 'react'

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

/** Browser chrome (status/address bar) takes the page background, resolved from the tokens. */
function syncThemeColor() {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = getComputedStyle(document.documentElement).backgroundColor
}

function apply() {
  document.documentElement.dataset.theme = currentTheme()
  syncThemeColor()
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
  syncThemeColor()
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
// Stylesheets may not be applied yet while modules load; resolve the color once they are.
requestAnimationFrame(syncThemeColor)

