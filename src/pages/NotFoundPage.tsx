import { CompassIcon } from '@phosphor-icons/react'
import { ButtonLink, EmptyState, Page } from '../components/ui'
import { useI18n } from '../i18n'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <Page>
      <EmptyState
        icons={[{ icon: CompassIcon, tone: 'pink' }]}
        title={t.notFound.title}
        text={t.notFound.text}
        action={<ButtonLink to="/">{t.notFound.back}</ButtonLink>}
      />
    </Page>
  )
}
