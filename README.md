# TripBudget

Know exactly how much you can spend each day of your trip.

**Open the app:** https://raphaelkieling.github.io/tripbudget/

Create a trip with a start date, an end date and a total budget. TripBudget
splits the budget into a daily allowance. Each bill you add comes out of the
day it happened on. At the end of a day:

- **money left over** is spread across the remaining days, and
- **overspending** is taken from the remaining days.

That is, for every day `d` up to today:

```
allowance(d) = (budget − spent before d) / days remaining from d (inclusive)
```

Days after today share whatever is left equally. The logic lives in
[`src/domain/budget.ts`](src/domain/budget.ts) and is covered by tests.

## Stack

- React 19 + Vite + TypeScript
- [Phosphor Icons](https://phosphoricons.com) (duotone)
- IndexedDB (via `idb`) for local storage, behind a swappable `DataStore` interface
- `vite-plugin-pwa`: installable and works offline
- Hash routing, so it runs on GitHub Pages with no server config

## Scripts

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (vitest)
npm run build      # production build in dist/
npm run preview    # serve the production build (test the PWA here)
```

## Deploying to GitHub Pages

1. Push to a GitHub repo on the `main` branch.
2. In the repo, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds with
   `BASE_PATH=/<repo-name>/` and publishes the result.

To build for a custom domain or a `<user>.github.io` repo, set `BASE_PATH=/`.

## Project layout

```
src/
  components/ui/     Reusable design-system parts (Button, Card, Sheet, fields, ...)
  components/trip/   Trip-specific components built from the UI kit
  data/              DataStore interface, IndexedDB implementation, React hooks
  domain/            Types, categories, budget engine (pure, tested)
  lib/               Date and money helpers
  pages/             Routes
  styles/tokens.css  Design tokens: colors, radius, shadows, fonts
```

### Theming

All colors, fonts, radii and shadows are CSS variables in
[`src/styles/tokens.css`](src/styles/tokens.css). Dark mode overrides are in the same file.

### Switching to Firebase (or any backend)

UI code only uses the `DataStore` interface in
[`src/data/DataStore.ts`](src/data/DataStore.ts). To move to Firebase, write a
`createFirestoreStore()` that implements it (`subscribe` maps onto
`onSnapshot`) and pass it to `<DataStoreProvider>` in `src/main.tsx`.

Money is stored as integer cents and dates as `YYYY-MM-DD` strings, so the
records map directly onto Firestore documents.
