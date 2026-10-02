import { useSyncExternalStore } from 'react'
import { getLocale, setLocale, subscribeLocale, type Locale } from './locale'
import { en, type Messages } from './locales/en'
import { es } from './locales/es'
import { pt } from './locales/pt'

export { getIntlLocale, LOCALES, type Locale } from './locale'
export type { Messages } from './locales/en'

const MESSAGES: Record<Locale, Messages> = { en, pt, es }

/** Each language's name in itself, so people can find their own. */
export const LANGUAGE_NAMES: Record<Locale, string> = { en: 'English', pt: 'Português', es: 'Español' }

/** Current messages (`t`) and locale; re-renders when the language changes. */
export function useI18n() {
  const locale = useSyncExternalStore(subscribeLocale, getLocale)
  return { t: MESSAGES[locale], locale, setLocale }
}
