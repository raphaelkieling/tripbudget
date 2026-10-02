import { GearSixIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { LANGUAGE_NAMES, LOCALES, useI18n } from '../../i18n'
import { Button } from './Button'
import { ChoiceGroup } from './ChoiceGroup'
import { Sheet } from './Sheet'

const languageOptions = LOCALES.map((locale) => ({ value: locale, label: LANGUAGE_NAMES[locale] }))

/** Top bar button that opens the app settings (currently: language). */
export function SettingsButton() {
  const { t, locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="surface" icon={GearSixIcon} iconOnly onClick={() => setOpen(true)}>
        {t.settings.open}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t.settings.title}>
        <ChoiceGroup label={t.settings.language} options={languageOptions} value={locale} onChange={setLocale} />
      </Sheet>
    </>
  )
}
