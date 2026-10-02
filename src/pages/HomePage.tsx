import { AirplaneTiltIcon, CalendarCheckIcon, CoinsIcon, FlagCheckeredIcon, IslandIcon, PlusIcon, SuitcaseRollingIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TripCard, TripFormSheet } from '../components/trip'
import { Button, EmptyState, Fab, Page, Section, TopBar } from '../components/ui'
import { useToday, useTripsWithExpenses } from '../data/hooks'
import type { Expense, Trip } from '../domain/types'
import { useI18n } from '../i18n'
import styles from './HomePage.module.css'

type TripEntry = { trip: Trip; expenses: Expense[] }

export function HomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const today = useToday()
  const { data, loading } = useTripsWithExpenses()
  const [creating, setCreating] = useState(false)

  const entries = data ?? []
  const active = entries.filter(({ trip }) => trip.startDate <= today && trip.endDate >= today)
  const upcoming = entries.filter(({ trip }) => trip.startDate > today).reverse()
  const past = entries.filter(({ trip }) => trip.endDate < today)

  const renderGrid = (list: TripEntry[]) => (
    <div className={styles.grid}>
      {list.map(({ trip, expenses }) => (
        <TripCard key={trip.id} trip={trip} expenses={expenses} today={today} />
      ))}
    </div>
  )

  return (
    <Page>
      <TopBar
        leading={
          <div className={styles.brand}>
            <img className={styles.logo} src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
            <span className={styles.brandName}>
              Trip<span>Budget</span>
            </span>
          </div>
        }
      />

      {!loading && entries.length === 0 ? (
        <EmptyState
          icons={[
            { icon: SuitcaseRollingIcon, tone: 'violet' },
            { icon: IslandIcon, tone: 'mint' },
            { icon: CoinsIcon, tone: 'sun' },
          ]}
          title={t.home.emptyTitle}
          text={t.home.emptyText}
          action={
            <Button size="lg" icon={PlusIcon} onClick={() => setCreating(true)}>
              {t.home.planFirst}
            </Button>
          }
        />
      ) : (
        <>
          <div className={styles.greeting}>
            <h1>{active.length > 0 ? t.home.activeTitle : t.home.idleTitle}</h1>
            <p>{active.length > 0 ? t.home.activeText : t.home.idleText}</p>
          </div>

          {active.length > 0 && (
            <Section title={t.home.onTheRoad} icon={AirplaneTiltIcon}>
              {renderGrid(active)}
            </Section>
          )}
          {upcoming.length > 0 && (
            <Section title={t.home.comingUp} icon={CalendarCheckIcon}>
              {renderGrid(upcoming)}
            </Section>
          )}
          {past.length > 0 && (
            <Section title={t.home.past} icon={FlagCheckeredIcon}>
              {renderGrid(past)}
            </Section>
          )}

          <Fab>
            <Button size="lg" icon={PlusIcon} onClick={() => setCreating(true)}>
              {t.home.newTrip}
            </Button>
          </Fab>
        </>
      )}

      <TripFormSheet open={creating} onClose={() => setCreating(false)} onSaved={(trip) => navigate(`/trips/${trip.id}`)} />
    </Page>
  )
}
