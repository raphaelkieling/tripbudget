import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useTheme } from '../../lib/theme'
import { Button } from './Button'

export function ThemeToggle() {
  const [theme, setTheme] = useTheme()
  const dark = theme === 'dark'

  return (
    <Button variant="surface" icon={dark ? SunIcon : MoonIcon} iconOnly onClick={() => setTheme(dark ? 'light' : 'dark')}>
      {dark ? 'Switch to light mode' : 'Switch to dark mode'}
    </Button>
  )
}
