import { getIntlLocale } from '../i18n/locale'

/** A calendar day in the user's local time, formatted as YYYY-MM-DD. */
export type ISODate = string

const DAY_MS = 86_400_000

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(date: Date): ISODate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayISO(): ISODate {
  return toISODate(new Date())
}

/** Parses YYYY-MM-DD as local midnight (new Date('YYYY-MM-DD') would be UTC). */
export function parseISODate(value: ISODate): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toUTCDay(value: ISODate): number {
  const [y, m, d] = value.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / DAY_MS
}

/** Whole days from `from` to `to` (negative if `to` is earlier). DST-safe. */
export function diffDays(from: ISODate, to: ISODate): number {
  return toUTCDay(to) - toUTCDay(from)
}

export function addDays(value: ISODate, days: number): ISODate {
  const date = parseISODate(value)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** Every day from start to end, inclusive. */
export function eachDay(start: ISODate, end: ISODate): ISODate[] {
  const total = diffDays(start, end) + 1
  return Array.from({ length: Math.max(total, 0) }, (_, i) => addDays(start, i))
}

export function clampDate(value: ISODate, min: ISODate, max: ISODate): ISODate {
  if (value < min) return min
  if (value > max) return max
  return value
}

export function formatDate(value: ISODate, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return parseISODate(value).toLocaleDateString(getIntlLocale(), options)
}

export function formatDateRange(start: ISODate, end: ISODate): string {
  const sameYear = start.slice(0, 4) === end.slice(0, 4)
  const startLabel = formatDate(start, sameYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startLabel} – ${formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' })}`
}
