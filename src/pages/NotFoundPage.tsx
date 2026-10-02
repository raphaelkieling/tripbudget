import { CompassIcon } from '@phosphor-icons/react'
import { ButtonLink, EmptyState, Page } from '../components/ui'

export function NotFoundPage() {
  return (
    <Page>
      <EmptyState
        icons={[{ icon: CompassIcon, tone: 'pink' }]}
        title="Lost on the way?"
        text="This page doesn't exist."
        action={<ButtonLink to="/">Back home</ButtonLink>}
      />
    </Page>
  )
}
