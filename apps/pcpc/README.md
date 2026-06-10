# PCPC — Pokémon Card Price Checker

Live at [pcpc.maber.io](https://pcpc.maber.io).

Look up current market prices for any Pokémon card. Search by set and card, filter English/Japanese releases, deep-link directly to a card, and revisit recent lookups.

## How it works

SvelteKit app using server routes (`src/routes/api`) as a backend-for-frontend:

- **Azure Cosmos DB** stores card and set data
- **Redis** provides optional response caching with configurable TTLs
- **[Scrydex API](https://scrydex.com)** supplies pricing data on cache misses

The same product also exists as an enterprise-style Azure deployment (API Management + Functions + Terraform) in [Abernaughty/PCPC](https://github.com/Abernaughty/PCPC).

## Development

```bash
cp .env.example .env   # fill in Cosmos DB + Scrydex credentials; Redis optional
pnpm install
pnpm dev
```

Other scripts: `pnpm build`, `pnpm check`, `pnpm lint`, `pnpm test` (Vitest).
