import type { ReactNode } from 'react'
import type { ToneKey, TripIconKey } from '../../domain/appearance'
import type { CategoryKey } from '../../domain/categories'
import type { PurchaseVerdict } from '../../domain/simulation'

/**
 * English is the source dictionary: its shape is the `Messages` type, so the
 * other languages fail to compile if they miss a key. Messages that wrap a
 * highlighted value take it as a ReactNode (e.g. <strong>$10</strong>).
 */
const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`
const bills = (n: number) => `${n} ${n === 1 ? 'bill' : 'bills'}`

export const en = {
  common: {
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    delete: 'Delete',
    moneyPlaceholder: '0.00',
  },
  units: { days, bills },
  theme: {
    toDark: 'Switch to dark mode',
    toLight: 'Switch to light mode',
  },
  settings: {
    open: 'Settings',
    title: 'Settings',
    language: 'Language',
    homeCurrency: 'Main currency',
    homeCurrencyHint: 'Trips in other currencies also show amounts converted to it.',
    noHomeCurrency: 'None',
  },
  currency: {
    label: 'Show amounts in',
    rate: (from: string, rate: string, to: string, date: string) => `1 ${from} = ${rate} ${to} · ${date}`,
  },
  phase: {
    tomorrow: 'Tomorrow',
    inDays: (n: number) => `In ${days(n)}`,
    dayOf: (day: number, total: number) => `Day ${day} of ${total}`,
    onTheRoad: 'On the road',
    finished: 'Finished',
  },
  home: {
    emptyTitle: 'Where to next?',
    emptyText: "Create a trip, set your budget and we'll tell you how much you can spend each day.",
    planFirst: 'Plan my first trip',
    activeTitle: 'Enjoy the trip!',
    activeText: "Here's what you can spend today.",
    idleTitle: 'Where to next?',
    idleText: 'Plan a trip and keep your daily spending on track.',
    onTheRoad: 'On the road',
    comingUp: 'Coming up',
    past: 'Past trips',
    newTrip: 'New trip',
  },
  notFound: {
    title: 'Lost on the way?',
    text: "This page doesn't exist.",
    back: 'Back home',
  },
  trip: {
    back: 'Back to trips',
    notFoundTitle: 'Trip not found',
    notFoundText: 'It may have been deleted.',
    goHome: 'Go home',
    edit: 'Edit trip',
    delete: 'Delete trip',
    simulate: 'Simulate',
    addBill: 'Add bill',
    startsIn: (n: number) => `Starts in ${days(n)}`,
    dayByDay: 'Day by day',
    deleteTitle: 'Delete this trip?',
    deleteMessage: (name: string) => `“${name}” and all of its bills will be removed from this device.`,
  },
  tripCard: {
    leftToday: 'Left for today',
    spentToday: 'Spent today',
    dailyBudget: 'Daily budget',
    spentOf: (spent: string, total: string) => `Spent ${spent} of ${total}`,
    budgetUsed: 'Budget used',
  },
  hero: {
    willSpend: "You'll be able to spend",
    perDayFor: (n: number) => `per day, for ${days(n)}`,
    cameBackWith: 'You came back with',
    wentOverBy: 'You went over by',
    spentOf: (spent: string, total: string) => `Spent ${spent} of ${total}`,
    ringLabel: "Today's budget used",
    used: 'used',
    overToday: 'Over today by',
    canSpendToday: 'You can still spend today',
    spentOfToday: (spent: string, total: string) => `${spent} of ${total} spent`,
    budgetGone: (amount: string) => `Budget is gone — you're ${amount} over for the trip`,
  },
  stats: {
    title: 'Budget summary',
    budgetUsed: (percent: number) => `${percent}% of the budget used`,
    budget: 'Budget',
    spent: 'Spent',
    left: 'Left',
    daysLeft: 'Days left',
    nextDays: 'Next days',
    perDay: '/day',
    editLeft: 'Update what’s left',
  },
  timeline: {
    yourDays: 'Your days',
    daysToGo: (n: number) => `${days(n)} to go`,
    day: 'Day',
    dayLine: (n: number, date: string) => `Day ${n} · ${date}`,
    today: 'Today',
    left: (amount: string) => `${amount} left`,
    saved: (amount: string) => `${amount} saved`,
    over: (amount: string) => `${amount} over`,
    daySpending: (n: number) => `Day ${n} spending`,
    noBillsToday: 'No bills yet today',
    noSpending: 'No spending — nice!',
    expectedNote: "What each day gets if you spend exactly today's budget. The badge shows how today's spending so far changes it.",
  },
  expenseRow: {
    spreadOver: (n: number) => `Spread over ${days(n)}`,
  },
  tripForm: {
    editTitle: 'Edit trip',
    newTitle: 'New trip',
    create: 'Create trip',
    nameRequired: 'Give your trip a name',
    endBeforeStart: 'End date must be on or after the start date',
    budgetRequired: 'How much can you spend?',
    nameLabel: 'Where are you going?',
    namePlaceholder: 'e.g. Tokyo with friends',
    icon: 'Icon',
    color: 'Color',
    start: 'Start',
    end: 'End',
    totalBudget: 'Total budget',
    currency: 'Currency',
    perDayPreview: (amount: ReactNode, n: number) => (
      <>
        That&apos;s {amount} per day for {days(n)}
      </>
    ),
    icons: {
      plane: 'Flight',
      beach: 'Beach',
      mountain: 'Mountains',
      city: 'City',
      camping: 'Camping',
      cruise: 'Cruise',
      train: 'Train',
      sightseeing: 'Sightseeing',
    } satisfies Record<TripIconKey, string>,
    tones: {
      violet: 'Violet',
      pink: 'Pink',
      mint: 'Mint',
      sun: 'Yellow',
      sky: 'Blue',
      coral: 'Coral',
    } satisfies Record<ToneKey, string>,
  },
  expenseForm: {
    editTitle: 'Edit bill',
    addTitle: 'Add a bill',
    add: 'Add bill',
    amountRequired: 'Enter how much you paid',
    amount: 'Amount',
    stillHave: (amount: ReactNode) => <>You&apos;ll still have {amount} for today</>,
    overToday: (amount: ReactNode) => <>That&apos;s {amount} over today — it&apos;ll come out of the next days</>,
    spreadImpact: (n: number, amount: ReactNode) => (
      <>
        Each of the {days(n)} gets {amount} less
      </>
    ),
    category: 'Category',
    whatWasIt: 'What was it?',
    example: (text: string) => `e.g. ${text}`,
    day: 'Day',
    hintSpread: 'Split from this day to the end of the trip',
    hintDay: 'Bills count against the day they happened',
    spreadLabel: 'Spread over the remaining days',
    spreadDescription: (n: number) => `For big purchases: split it equally over ${days(n)} instead of taking it all from this day.`,
    examples: {
      food: 'Ramen for lunch',
      transport: 'Metro card',
      stay: 'Hostel night',
      fun: 'Museum tickets',
      shopping: 'Souvenirs',
      other: 'SIM card',
    } satisfies Record<CategoryKey, string>,
  },
  categories: {
    food: 'Food',
    transport: 'Transport',
    stay: 'Stay',
    fun: 'Fun',
    shopping: 'Shopping',
    other: 'Other',
  } satisfies Record<CategoryKey, string>,
  balance: {
    title: 'Update what’s left',
    amountLabel: 'How much do you have left?',
    amountRequired: 'Enter how much you have left',
    unchanged: 'That’s already what’s left',
    went: (amount: ReactNode) => <>{amount} went out without a bill — it’ll be logged as an adjustment</>,
    came: (amount: ReactNode) => <>{amount} more than expected — it’ll be added back as an adjustment</>,
    day: 'Day',
    dayHint: 'The adjustment is split from this day to the end of the trip',
    save: 'Update',
    name: 'Balance adjustment',
    removeTitle: 'Remove this adjustment?',
    removeMessage: (amount: string) => `What’s left goes back to ${amount}.`,
  },
  simulate: {
    title: 'What if I buy it?',
    addAsBill: 'Add as bill',
    howMuch: 'How much is it?',
    whatIsIt: 'What is it? (optional)',
    placeholder: 'e.g. Leather jacket',
    hint: 'Nothing is saved — just try an amount and see how it affects your days.',
    verdicts: {
      easy: 'Go for it!',
      manageable: 'You’ll barely notice',
      'big-hit': 'That’s a big hit',
      'over-budget': 'Over your trip budget',
    } satisfies Record<PurchaseVerdict, string>,
    overBudget: (amount: string) => `You’d end the trip ${amount} over budget.`,
    allToday: 'It all comes out of today.',
    splitOver: (n: number, includesToday: boolean, cut: string, percent: number) =>
      `Split over ${days(n)}${includesToday ? ', today included' : ''}: each day gets ${cut} less (−${percent}%).`,
    leftToday: 'Left for today',
    nextDaysPerDay: (n: number) => `Next ${days(n)}, per day`,
    perDay: 'Per day',
    tripLeft: 'Trip budget left',
    becomes: 'becomes',
  },
}

export type Messages = typeof en
