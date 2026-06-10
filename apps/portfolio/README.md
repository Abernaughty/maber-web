# portfolio

Developer portfolio, live at [dev.maber.io](https://dev.maber.io). SvelteKit site with project deep-dives and a server-rendered GitHub activity dashboard (`src/lib/server/github.ts`), plus generated OG cards and a sitemap route for sharing/SEO.

## Development

```bash
pnpm install
pnpm dev
```

The GitHub dashboard reads public repo data server-side; set `GITHUB_PAT` (read-only, public repos) to raise rate limits in production.

Other scripts: `pnpm build`, `pnpm check`, `pnpm lint`. Image asset pipeline docs live in [scripts/README.md](scripts/README.md).
