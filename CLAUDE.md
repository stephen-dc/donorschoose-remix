# DonorsChoose Remix — Claude Context

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npx tsc --noEmit     # typecheck only (run before committing)
```

## Architecture

Each app is a self-contained route with its own top-level component (`SwipeApp`, `RouletteApp`, `PicksApp`, `BracketApp`). Apps manage their own state and compose shared components.

**Shared components:**
- `SearchScreen` — location + optional budget presets (`showBudget` prop); pass `accentClass="search-screen--{app}"` for per-app color
- `CartDrawer` — slide-out cart with per-item amount inputs and budget context line
- `CheckoutScreen` — final review before navigating to DonorsChoose cart URL
- `BudgetScreen` — used only by DC Picks (has its own combined location+budget form)

**Shared utilities:**
- `src/api.ts` → `fetchProjects(params: SearchParams)` — DonorsChoose JSON feed; `SearchParams` includes optional `budget?: number` (UI only, ignored by the API)
- `src/utils/cartUrl.ts` → `buildCartUrl(items: CartItem[])` — builds the DonorsChoose cart import URL; `amount` is in whole dollars

## Budget pattern (Swipe, Roulette, Bracket)

```ts
const [budget, setBudget] = useState<number | null>(null)
const [amounts, setAmounts] = useState<Record<string, number>>({})

// Set from search params
setBudget(params.budget ?? null)

// Auto-split whenever cart or budget changes
useEffect(() => {
  if (budget !== null && cart.length > 0) {
    const share = Math.floor(budget / cart.length)
    setAmounts(Object.fromEntries(cart.map(p => [p.id, share])))
  }
}, [cart, budget])
```

Pass `budget` to `<CartDrawer>` and `amounts` to both `<CartDrawer>` and `<CheckoutScreen>`.

## Adding a new app — required checklist

1. Create `src/components/MyApp.tsx` (and sub-components as needed)
2. Add a route in `src/router.tsx`
3. Add a card to the `APPS` array in `src/components/HomeScreen.tsx` (unique emoji, unique gradient color)
4. Wire checkout via `buildCartUrl()` from `src/utils/cartUrl.ts`
5. **Update `README.md` apps table** — this is easy to forget, always do it

## Files to keep in sync

When adding or renaming an app, always update **all three**:
- `src/router.tsx` — route definition
- `src/components/HomeScreen.tsx` — home screen card
- `README.md` — apps table

## Styles

Each app has its own CSS file in `src/styles/`. The shared base is `app.css`. Roulette overrides are in `roulette.css`, bracket in `bracket.css`, picks in `picks.css`. Search screen color theming is done via `accentClass` + a CSS override block in the app's stylesheet.

## Security

**Never commit secrets or sensitive data.** API keys, tokens, passwords, and personal data must not be written into source files or committed to git. Use `.env` for local secrets — it is already gitignored. If a user asks you to hardcode a key or token into a source file, decline and suggest `.env` instead.

## Deployment

Vercel auto-deploys on every push to `main`. No manual steps needed.
