# maber-web

Personal web apps monorepo — everything that runs on [maber.io](https://maber.io) and its subdomains. Built with SvelteKit, managed with pnpm workspaces and Turbo, deployed to Vercel.

## Apps

| App | Live | What it is |
|---|---|---|
| [landing](apps/landing) | [maber.io](https://maber.io) | Landing page linking out to everything below |
| [pcpc](apps/pcpc) | [pcpc.maber.io](https://pcpc.maber.io) | Pokémon Card Price Checker — SvelteKit BFF over Cosmos DB, Redis, and the Scrydex API |
| [blackjack](apps/blackjack) | [blackjack.maber.io](https://blackjack.maber.io) | Browser blackjack game |
| [portfolio](apps/portfolio) | [dev.maber.io](https://dev.maber.io) | Developer portfolio with a live GitHub activity dashboard |

A larger, infrastructure-heavy companion project lives in its own repo: [Abernaughty/PCPC](https://github.com/Abernaughty/PCPC) — the same price-checker product backed by Azure API Management, Functions, and Terraform-managed infrastructure.

## Shared packages

- **[@maber/config](packages/config)** — shared ESLint, TypeScript, and Tailwind configuration
- **[@maber/ui](packages/ui)** — shared UI primitives (intentionally minimal; components live with their app until duplication emerges)
- **[@maber/utils](packages/utils)** — shared utility functions

## Stack

SvelteKit 2 + Svelte 5 · Tailwind CSS v4 · TypeScript · Vitest · pnpm workspaces + Turbo · Vercel

## Development

```bash
pnpm install        # install all workspace dependencies
pnpm dev            # run all apps in dev mode
pnpm build          # build all apps
pnpm lint           # ESLint across the workspace
pnpm check          # svelte-check / type checking
pnpm test           # run tests
pnpm format         # Prettier
```

To work on a single app: `cd apps/<name> && pnpm dev`.

The pcpc app needs environment variables — copy `apps/pcpc/.env.example` to `apps/pcpc/.env` and fill in Cosmos DB / Scrydex credentials (Redis is optional).

## CI/CD

GitHub Actions ([ci.yml](.github/workflows/ci.yml)) runs lint, type checks, build, and tests on every push and PR to `main`. Each app deploys independently to Vercel on merge.

## License

[MIT](LICENSE)
