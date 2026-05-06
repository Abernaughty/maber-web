# maber-web

Personal web projects monorepo — pnpm workspaces + Turbo, all apps SvelteKit on Vercel.

## Apps

| App | Path | Domain | What |
|---|---|---|---|
| **landing** | [apps/landing](apps/landing/) | maber.io *(planned)* | Main landing page |
| **blackjack** | [apps/blackjack](apps/blackjack/) | blackjack.maber.io | Browser blackjack |
| **portfolio** | [apps/portfolio](apps/portfolio/) | dev.maber.io | Portfolio site |

> **Looking for the Pokémon Card Price Checker (PCPC)?** Its source has moved to its own repository: **[`Abernaughty/PCPC`](https://github.com/Abernaughty/PCPC)**. PCPC is now deployed three ways from a single consolidated codebase (Vercel BFF / APIM+Functions / Container Apps). Earlier history is preserved in that repo via `git filter-repo`. Why the move: see [`docs/PORTFOLIO_PLAN.md`](docs/PORTFOLIO_PLAN.md).

## Shared packages

- [`@maber/config`](packages/config/) — shared ESLint flat config + Tailwind v4 preset + TS configs
- [`@maber/ui`](packages/ui/) — placeholder for shared Svelte primitives (currently empty by convention; see Portfolio_Redesign_Spec §11)
- [`@maber/utils`](packages/utils/) — small shared helpers (`formatDate`, `formatRelativeDate`)

## Commands

```bash
pnpm install                   # at the repo root
pnpm dev                       # turbo run dev (all apps in parallel)
pnpm --filter @maber/blackjack dev      # one app
pnpm --filter @maber/portfolio dev
pnpm --filter @maber/landing dev
pnpm build                     # build everything
pnpm lint                      # ESLint across the workspace
pnpm check                     # svelte-check across the workspace
pnpm format                    # prettier
```

## Deployment

Each app has its own `vercel.json` and is wired to a separate Vercel project. Pushes to `main` deploy automatically; PRs get preview deployments.

## CI

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs install / lint / typecheck / build / test on every PR.
