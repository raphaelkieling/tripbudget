import { AirplaneTiltIcon, CalendarCheckIcon, CoinsIcon, FlagCheckeredIcon, IslandIcon, PlusIcon, SuitcaseRollingIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TripCard, TripFormSheet } from '../components/trip'
import { Button, EmptyState, Fab, Page, Section, TopBar } from '../components/ui'
import { useToday, useTripsWithExpenses } from '../data/hooks'
import type { Expense, Trip } from '../domain/types'
import styles from './HomePage.module.css'

type TripEntry = { trip: Trip; expenses: Expense[] }

export function HomePage() {
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
          title="Where to next?"
          text="Create a trip, set your budget and we'll tell you how much you can spend each day."
          action={
            <Button size="lg" icon={PlusIcon} onClick={() => setCreating(true)}>
              Plan my first trip
            </Button>
          }
        />
      ) : (
        <>
          <div className={styles.greeting}>
            <h1>{active.length > 0 ? 'Enjoy the trip!' : 'Where to next?'}</h1>
            <p>{active.length > 0 ? "Here's what you can spend today." : 'Plan a trip and keep your daily spending on track.'}</p>
          </div>

          {active.length > 0 && (
            <Section title="On the road" icon={AirplaneTiltIcon}>
              {renderGrid(active)}
            </Section>
          )}
          {upcoming.length > 0 && (
            <Section title="Coming up" icon={CalendarCheckIcon}>
              {renderGrid(upcoming)}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past trips" icon={FlagCheckeredIcon}>
              {renderGrid(past)}
            </Section>
          )}

          <Fab>
            <Button size="lg" icon={PlusIcon} onClick={() => setCreating(true)}>
              New trip
            </Button>
          </Fab>
        </>
      )}

      <TripFormSheet open={creating} onClose={() => setCreating(false)} onSaved={(trip) => navigate(`/trips/${trip.id}`)} />
    </Page>
  )
}
