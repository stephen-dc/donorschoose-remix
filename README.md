# DonorsChoose Remix

> Good ideas, bad ideas, and everything in between.

Alternate frontends for [DonorsChoose](https://www.donorschoose.org/) — a collection of weird and fun ways to discover and fund classroom projects. Built with React + TypeScript + Vite, deployed on Vercel.

---

## Apps

| Route | Name | Description |
|---|---|---|
| `/tinder` | **DC Tinder** | Browse projects like a dating app. Swipe right to fund, left to skip. |
| `/roulette` | **DC Roulette** | Spin the wheel and let fate pick a classroom for you. |
| `/picks` | **DC Picks** | Set a budget, then vote dollar-by-dollar between competing projects. |
| `/bracket` | **DC Bracket** | 8 classrooms compete in a March Madness-style tournament. The champion gets your full budget. |
| `/feed` | **DC Feed** | TikTok-style vertical feed. Scroll through classroom projects, heart the ones you love, checkout in seconds. |

---

## Contributing

**Anyone with repo access is welcome to add a new app.** The bar is low — if it's a fun or interesting way to surface DonorsChoose projects, it belongs here.

### Adding a new app

1. Create your app component under `src/components/` (e.g. `MyApp.tsx`)
2. Add a route in `src/router.tsx`
3. Add a card for it on the home screen in `src/components/HomeScreen.tsx`
4. Wire up checkout using `buildCartUrl()` (see below)
5. Open a PR — that's it

### Project data

Projects are fetched from the DonorsChoose JSON feed via `src/api.ts`. The `fetchProjects()` function accepts a `state` (required) and optional `city` and returns an array of `Project` objects (see `src/types.ts` for the full shape).

---

## Cart transfer URL

When a user is ready to fund, send them to DonorsChoose with a pre-filled cart using `buildCartUrl()` from `src/utils/cartUrl.ts`.

```ts
import { buildCartUrl } from '../utils/cartUrl'

const url = buildCartUrl([
  { proposalId: '123456', amount: 10 },
  { proposalId: '789012', amount: 25 },
])
// => https://...donorschoose.org/donors/cart-import.html?proposalId1=123456&amount1=10&proposalId2=789012&amount2=25

window.location.href = url
```

**Format:** each item is a `{ proposalId, amount }` pair. `proposalId` comes from the `id` field on a `Project`. `amount` is in whole dollars (decimals are rounded). Items are indexed starting at `1`.

The base URL is controlled by the `VITE_DC_CART_URL` environment variable (useful for pointing at a test environment).

---

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` — a public API key is included so things work out of the box.

```bash
cp .env.example .env
```

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_DC_API_KEY` | DonorsChoose API key | `REDACTED` (public) |
| `VITE_DC_CART_URL` | Cart import base URL | Production DonorsChoose URL |

---

## Deployment

The project deploys automatically to Vercel on every push to `main`. No manual steps needed — just merge and it ships.
