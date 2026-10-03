import { GearSixIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { LANGUAGE_NAMES, LOCALES, useI18n } from '../../i18n'
import { useHomeCurrency, type HomeCurrency } from '../../lib/exchange'
import { CURRENCIES } from '../../lib/money'
import { PALETTE_COLORS, PALETTES, usePalette } from '../../lib/theme'
import { Button } from './Button'
import { ChoiceGroup } from './ChoiceGroup'
import { SelectField } from './Field'
import { Sheet } from './Sheet'
import styles from './SettingsButton.module.css'

const languageOptions = LOCALES.map((locale) => ({ value: locale, label: LANGUAGE_NAMES[locale] }))

/** Top bar button that opens the app settings: language, theme and main currency. */
export function SettingsButton() {
  const { t, locale, setLocale } = useI18n()
  const [palette, setPalette] = usePalette()
  const [homeCurrency, setHomeCurrency] = useHomeCurrency()
  const [open, setOpen] = useState(false)

  const paletteOptions = PALETTES.map((value) => ({ value, label: t.palettes[value], color: PALETTE_COLORS[value] }))
  const currencyOptions = [
    { value: 'none', label: t.settings.noHomeCurrency },
    ...CURRENCIES.map((code) => ({ value: code, label: code })),
  ]

  return (
    <>
      <Button variant="surface" icon={GearSixIcon} iconOnly onClick={() => setOpen(true)}>
        {t.settings.open}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t.settings.title}>
        <div className={styles.content}>
          <ChoiceGroup label={t.settings.language} options={languageOptions} value={locale} onChange={setLocale} />
          <ChoiceGroup label={t.settings.palette} variant="swatch" options={paletteOptions} value={palette} onChange={setPalette} />
          <SelectField
            label={t.settings.homeCurrency}
            hint={t.settings.homeCurrencyHint}
            options={currencyOptions}
            value={homeCurrency}
            onChange={(e) => setHomeCurrency(e.target.value as HomeCurrency)}
          />
        </div>
      </Sheet>
    </>
  )
}
