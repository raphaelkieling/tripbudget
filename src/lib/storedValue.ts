import { useSyncExternalStore } from 'react'

/**
 * A small user preference persisted in localStorage that React components can
 * subscribe to. `parse` turns the stored string back into a value, or null
 * when it's missing or no longer valid.
 */
export function createStoredValue<T extends string>(key: string, parse: (raw: string | null) => T | null, fallback: T) {
  const listeners = new Set<() => void>()

  function read(): T {
    try {
      return parse(localStorage.getItem(key)) ?? fallback
    } catch {
      return fallback
    }
  }

  let current = read()

  function set(value: T) {
    current = value
    try {
      localStorage.setItem(key, value)
    } catch {
      // Private mode etc.: the choice just won't survive a reload.
    }
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const get = () => current

  return {
    get,
    set,
    subscribe,
    use: (): [T, (value: T) => void] => [useSyncExternalStore(subscribe, get), set],
  }
}
