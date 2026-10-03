import type { CSSProperties } from 'react'
import type { ToneKey } from '../../domain/appearance'

/** A trip color, or "accent": the app's own primary color, used as the UI default. */
export type Tone = ToneKey | 'accent'

/** Exposes a tone as --tone / --tone-soft so component CSS can stay generic. */
export function toneVars(tone: Tone): CSSProperties {
  return { '--tone': `var(--tone-${tone})`, '--tone-soft': `var(--tone-${tone}-soft)` } as CSSProperties
}
