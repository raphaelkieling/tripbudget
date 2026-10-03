import { GearSixIcon, MoonIcon, SunIcon, type Icon } from '@phosphor-icons/react'
import { useState } from 'react'
import { LANGUAGE_NAMES, LOCALES, useI18n } from '../../i18n'
import { useHomeCurrency, type HomeCurrency } from '../../lib/exchange'
import { CURRENCIES } from '../../lib/money'
import { useTheme, type Theme } from '../../lib/theme'
import { Button } from './Button'
import { ChoiceGroup } from './ChoiceGroup'
import { SelectField } from './Field'
import { Sheet } from './Sheet'
import styles from './SettingsButton.module.css'

const languageOptions = LOCALES.map((locale) => ({ value: locale, label: LANGUAGE_NAMES[locale] }))

/** Top bar button that opens the app settings: language, light/dark and main currency. */
export function SettingsButton() {
  const { t, locale, setLocale } = useI18n()
  const [theme, setTheme] = useTheme()
  const [homeCurrency, setHomeCurrency] = useHomeCurrency()
  const [open, setOpen] = useState(false)

  const themeOptions: Array<{ value: Theme; label: string; icon: Icon }> = [
    { value: 'light', label: t.theme.light, icon: SunIcon },
    { value: 'dark', label: t.theme.dark, icon: MoonIcon },
  ]
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
          <ChoiceGroup label={t.theme.label} options={themeOptions} value={theme} onChange={setTheme} />
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
