/**
 * The active language. Kept free of React and message imports so lib/ code
 * (money and date formatting) can read it without pulling in the dictionaries.
 */
export const LOCALES = ['en', 'pt', 'es'] as const
export type Locale = (typeof LOCALES)[number]

/** BCP 47 tag used for Intl number/date formatting and <html lang>. */
const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', pt: 'pt-BR', es: 'es-ES' }

const STORAGE_KEY = 'tripbudget-locale'
const listeners = new Set<() => void>()

function storedLocale(): Locale | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return LOCALES.includes(value as Locale) ? (value as Locale) : null
  } catch {
    return null
  }
}

let current: Locale = storedLocale() ?? 'en'

function syncDocument() {
  if (typeof document !== 'undefined') document.documentElement.lang = INTL_LOCALE[current]
}

export function getLocale(): Locale {
  return current
}

export function getIntlLocale(): string {
  return INTL_LOCALE[current]
}

export function setLocale(locale: Locale) {
  current = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Private mode etc.: the choice just won't survive a reload.
  }
  syncDocument()
  listeners.forEach((listener) => listener())
}

export function subscribeLocale(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

syncDocument()
