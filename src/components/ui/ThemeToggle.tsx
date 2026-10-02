import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useI18n } from '../../i18n'
import { useTheme } from '../../lib/theme'
import { Button } from './Button'

export function ThemeToggle() {
  const { t } = useI18n()
  const [theme, setTheme] = useTheme()
  const dark = theme === 'dark'

  return (
    <Button variant="surface" icon={dark ? SunIcon : MoonIcon} iconOnly onClick={() => setTheme(dark ? 'light' : 'dark')}>
      {dark ? t.theme.toLight : t.theme.toDark}
    </Button>
  )
}
