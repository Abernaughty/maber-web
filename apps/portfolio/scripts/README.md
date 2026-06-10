# apps/portfolio/scripts

One-off asset pipelines for the portfolio. Not part of the build — invoked manually when source assets change.

## `gen-bear-variants.mjs`

Generates `bear-coding.webp` and `bear-coding.avif` beside the source PNG at `apps/portfolio/static/images/`. The Hero component uses these via `<picture>` with format fallbacks for best mobile performance.

### When to run

Whenever `apps/portfolio/static/images/bear-coding.png` is updated.

### How to run

```bash
# From repo root, install sharp temporarily
pnpm --filter @maber/portfolio add -D sharp

# Run the script
node apps/portfolio/scripts/gen-bear-variants.mjs

# Remove sharp from devDeps (it's not needed at build time)
pnpm --filter @maber/portfolio remove sharp
```

### Why sharp isn't a permanent devDep

Asset variants change once every several months at most. Adding a 10 MB+ native dep to the install just for that is poor cost/value. The script docstring explains the parameters; trust the diff and re-run on demand.

### Reference: typical output

| Format | Size  | Ratio  |
|--------|-------|--------|
| PNG    | ~2 MB | 100%   |
| WebP   | ~100 KB | ~5%  |
| AVIF   | ~57 KB  | ~3%  |

Settings: WebP quality 85 + effort 6, AVIF quality 55 + effort 6.
