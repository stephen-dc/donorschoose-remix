# DonorsChoose Remix

> Good ideas, bad ideas, and everything in between.

Alternate frontends for [DonorsChoose](https://www.donorschoose.org/) — a collection of weird and fun ways to discover and fund classroom projects.

---

## Adding a new app

You don't need to know how to code. All you need is [Claude Code](https://claude.ai/code) open in this project.

**Getting set up (first time only)**

1. Install Claude Code if you haven't: [claude.ai/code](https://claude.ai/code)
2. Clone this repo to your computer — in Claude Code, press **Enter** to start a new conversation and say:
   > *"Can you clone the DonorsChoose Remix repo from GitHub and open it?"*
3. Once it's cloned, open a new Claude Code session in that folder. On a Mac, you can drag the folder onto the Claude Code icon, or open Terminal, `cd` into the folder, and type `claude`.

From then on, just open Claude Code in that folder whenever you want to work on it.

---

**Step 1: Describe your idea**

Tell Claude what you want to build in plain English. For example:

> *"I want to add a new app called DC Mood. The user picks an emotion — happy, inspired, nostalgic — and we show them classroom projects that match that vibe. They can add favorites and check out."*

**Step 2: Ask Claude to build it**

> *"Can you build this as a new app in the DonorsChoose Remix project? Follow the checklist in CLAUDE.md for adding a new app."*

Claude will handle all the code — the component, the route, the home screen card, everything.

**Step 3: Review and refine**

Ask Claude to show you what it looks like, or describe changes you want:

> *"Can you show me a preview?"*
> *"Make the button bigger and change the color to green."*
> *"Add a back button to the top left."*

**Step 4: Ship it**

> *"Looks good — can you commit and push this?"*

That's it. Vercel will deploy it to production automatically within a minute or two.

---

**Tips:**
- You can paste a screenshot into Claude and say "make it look more like this"
- If something looks broken, just describe what's wrong — Claude can fix it
- Don't worry about breaking things. Every change is tracked, so nothing is permanent

---

## Technical reference

### Adding a new app (manual steps)

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

> **Never commit secrets.** API keys, passwords, and tokens must only live in your local `.env` file — never in source code or committed files. The `.env` file is already listed in `.gitignore` so git won't track it automatically, but be careful not to copy values into source files or paste them into Claude conversations. If you accidentally commit a secret, treat it as compromised and rotate it immediately.

---

## Deployment

The project deploys automatically to Vercel on every push to `main`. No manual steps needed — just merge and it ships.
