import type { CSSProperties } from 'react'
import type { ToneKey } from '../../domain/appearance'

/** Exposes a tone as --tone / --tone-soft so component CSS can stay generic. */
export function toneVars(tone: ToneKey): CSSProperties {
  return { '--tone': `var(--tone-${tone})`, '--tone-soft': `var(--tone-${tone}-soft)` } as CSSProperties
}
