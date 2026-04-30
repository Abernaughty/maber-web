# Portfolio Site Redesign — Design Spec

**Date:** April 30, 2026
**Branch:** `feature/portfolio-redesign`
**Repo:** `Abernaughty/maber-web` → `apps/portfolio`
**Stack:** SvelteKit 2 · Svelte 5 · TailwindCSS 4 · TypeScript 5 · adapter-vercel
**Theme:** Dark-mode-only ("Engineer's Desk" — terminal aesthetic, cyan accent)
**Source design:** Engineer's Desk prototype from Claude Design canvas

---

## 0. Pre-Phase 1 cleanup checklist

These tasks happen **before** opening the `feature/portfolio-redesign` branch. Each is small (5–30 minutes) and addresses cruft, ambiguity, or tooling gaps that would otherwise compound during the rebuild. Total estimated time: 2–3 hours.

Treat this as a forcing function. Do not start Phase 1 with any of these unresolved.

### 0.1 Delete orphaned `@maber/ui` files (critical)

`packages/ui/src/` currently contains four files: `Button.svelte`, `SiteHeader.svelte`, `SiteFooter.svelte`, `index.ts`. Confirmed: zero apps in the monorepo import from `@maber/ui`. These are scaffolding from the original Turborepo bootstrap that was never wired up.

**Action:** delete the three component files. Update `index.ts` to export nothing (empty barrel, ready for future use). Keep the `packages/ui` package itself — it's fine as a future home for shared primitives once portfolio + PCPC reveal real duplication.

```bash
cd packages/ui/src
rm Button.svelte SiteHeader.svelte SiteFooter.svelte
echo "// Reserved for future shared primitives. See Portfolio_Redesign_Spec.md §11." > index.ts
```

Commit as a single small PR: `chore(ui): remove orphaned scaffolding components`.

### 0.2 Clean up stale branches (critical)

The repo has 7 stale branches from prior PCPC work that should be deleted:
- `feature/pcpc-redesign`
- `feature/scrydex-migration`
- `fix/effect-loop`
- `feature/redesign`
- `feature/api-optimization`
- `fix/pagination-field-mapping`
- `fix/indexeddb-batch-writes`

**Why this matters now:** Vercel auto-builds preview deployments for every branch, and the free tier caps at 100 deploys/day. Stale branches that get accidentally pushed to (or that have open auto-deploys) waste quota. A clean branch list also makes it obvious which work is active.

```bash
# Delete locally
git branch -D feature/pcpc-redesign feature/scrydex-migration fix/effect-loop feature/redesign feature/api-optimization fix/pagination-field-mapping fix/indexeddb-batch-writes

# Delete remote refs
git push origin --delete feature/pcpc-redesign feature/scrydex-migration fix/effect-loop feature/redesign feature/api-optimization fix/pagination-field-mapping fix/indexeddb-batch-writes
```

### 0.3 Generate two GitHub PATs (critical)

Two distinct fine-grained tokens are needed before Phase 2:

**Token 1 — Claude Desktop MCP (write access):**
- Repository access: `Abernaughty/maber-web`
- Permissions: Contents (read+write), Issues (read+write), Pull requests (read+write)
- Used for: pushing commits, opening PRs, managing issues during build

**Token 2 — Vercel runtime (read-only):**
- Repository access: All public repos under `Abernaughty` (the GhDashboard reads multiple repos for the dashboard)
- Permissions: Contents (read), Metadata (read)
- Used for: GhDashboard server-side fetch in `+page.server.ts`
- Stored as `GITHUB_PAT` Vercel env var (Production + Preview environments)

Generate both at https://github.com/settings/personal-access-tokens. Set expiration to 1 year. Save the values immediately — GitHub only displays them once.

### 0.4 Resolve dev.maber.io 403 issue (high value)

`dev.maber.io` currently returns 403 to automated crawlers (LinkedIn unfurl, OpenGraph tools). Likely cause: Cloudflare bot fight mode is too aggressive.

**Why this matters now, not Phase 4:** as long as the 403 persists, Phase 5 (SEO + sharing) can't be properly tested with OpenGraph preview tools. Resolve early.

**Investigation path:**
1. Cloudflare dashboard → `maber.io` zone → Security → Bots
2. Check Bot Fight Mode setting — likely needs to be Off or set to "Verified Bots Only"
3. Allowlist known crawlers: LinkedIn (`LinkedInBot`), Slack, Twitter, OpenGraph debug tools
4. Verify fix:
   - https://opengraph.xyz/url/https%3A%2F%2Fdev.maber.io
   - https://www.linkedin.com/post-inspector/inspect/https%3A%2F%2Fdev.maber.io

### 0.5 Lock the production URL (high value)

Decide before Phase 1: what's the final URL for the redesigned portfolio?

**Options:**
- `dev.maber.io` (current — keep as-is)
- `maber.io` apex (promote portfolio to root)
- `mike.maber.io` or similar named subdomain

**Why this matters now:** affects sitemap.xml URLs, OpenGraph `og:url`, JSON-LD schema, robots.txt sitemap path, CNAME records, and Vercel domain configuration. Getting it wrong in Phase 1 means every later phase has wrong absolute URLs to fix.

**Recommendation:** stick with `dev.maber.io` for now. If you eventually want to promote to apex, do it as a separate concern after the redesign ships. Don't conflate "rebuild" with "rebrand".

### 0.6 Rename Vercel projects for predictable preview URLs (high value)

Current Vercel project names appear to be auto-generated:
- `pcpc.vercel.app` ✓ (already clean)
- `portfolio-ten-sepia-12.vercel.app` ✗ (needs rename)
- `blackjack-zeta-murex.vercel.app` ✗
- `landing-five-lake.vercel.app` ✗

**Action:** in Vercel dashboard, rename portfolio project to `portfolio` (and the others while you're at it). This makes preview URLs predictable: `portfolio-git-{branch}-abernaughtys-projects.vercel.app`.

**Verify:** the §10 testing gates URL in this spec assumes the project is named `portfolio`. If you rename it differently, update §10 accordingly.

### 0.7 Audit `apps/portfolio` for Turborepo template cruft (medium)

Before Phase 1 begins, do an inventory of what exists in `apps/portfolio` today:

```bash
ls apps/portfolio/src/routes/
ls apps/portfolio/src/lib/
ls apps/portfolio/static/
cat apps/portfolio/src/app.html
```

Document any of:
- Existing styles you want to preserve (custom theme.css, etc.)
- Existing favicon or static assets
- Customizations to `app.html`
- Legitimate routes already in production at `dev.maber.io`

Anything that survives the rebuild gets called out in Phase 1 as "preserve, don't clobber". Anything that's clearly Turborepo template cruft (default `+page.svelte` with "Welcome to SvelteKit", `Counter.svelte` example, etc.) gets flagged for deletion in Phase 1.

### 0.8 Confirm Tailwind 4 strategy (medium)

The spec uses CSS variables for tokens. Tailwind is in the stack. Three patterns are possible — pick one for consistency.

**Pattern A:** Tokens in CSS vars, components use Tailwind utility classes referencing vars (`class="bg-[var(--bg-panel)]"`)
**Pattern B:** Tokens in CSS vars, components use scoped `<style>` with `var(--token)` directly. Tailwind only for layout utilities (flex, grid, spacing).
**Pattern C:** Tokens *in* Tailwind config (`theme.extend.colors`), components use named utility classes (`class="bg-panel"`)

**Decision: Pattern B**, matching PCPC convention. Components get their visual styling from scoped `<style>` blocks consuming CSS vars; Tailwind handles only structural concerns.

**Rationale:** consistency with PCPC reduces context-switching cost. Pattern B also keeps token usage explicit in component source — no magic class names that obscure the underlying token. Worth noting as a §1 Convention so Phase 1 implements it correctly from the start.

### 0.9 Extract bear image as a real asset (medium)

The bear image is currently embedded as a base64 string inside the Engineer's Desk HTML mockup (~1.6MB). Before Phase 1:

1. Extract `bear-coding.png` as a standalone file
2. Generate WebP and AVIF variants for performance:
   ```bash
   # using cwebp + avifenc, or imagemin, or ImageMagick
   cwebp -q 85 bear-coding.png -o bear-coding.webp
   avifenc --min 30 --max 35 bear-coding.png bear-coding.avif
   ```
3. Place all three at `apps/portfolio/static/images/bear-coding.{png,webp,avif}`
4. In Hero component, use `<picture>` with format fallbacks for best mobile performance

**Why this matters:** a hi-res PNG used as `background-image` will hurt mobile Lighthouse scores. WebP at 85% quality is typically 30–50% smaller than PNG at visual parity. AVIF is even smaller for browsers that support it.

### 0.10 Create the docs directory structure (low)

Create the documentation directory upfront so future deep-dive content has a home:

```bash
mkdir -p apps/portfolio/docs/{specs,assets,architecture}
```

- `docs/specs/` — this spec, future spec revisions, ADRs
- `docs/assets/` — screenshots, OG image source files, deep-dive thumbnails
- `docs/architecture/` — Mermaid source files for deep-dive Section 3 diagrams

Drop this spec into `docs/specs/Portfolio_Redesign_Spec.md` as the first commit on the cleanup branch.

### Cleanup PR strategy

These are housekeeping items. They go on `main` directly (not on `feature/portfolio-redesign`) so the redesign branch starts from a clean baseline. Suggested PR sequence:

1. `chore(ui): remove orphaned scaffolding components` (item 0.1)
2. `chore(repo): clean up stale branches` (item 0.2 — branch deletes only, no PR needed)
3. `docs(portfolio): add redesign spec` (item 0.10 — drops this spec into the repo)
4. Skip PRs for items 0.3–0.9 (token generation, URL decisions, Cloudflare, Vercel renames, asset extraction — these are config/manual work, not code)

Once 1, 2, and 3 are merged, open `feature/portfolio-redesign` from the new clean `main` and start Phase 1.

---

## 1. Direction & decisions

### Direction chosen

**Engineer's Desk** — terminal-forward, monospace-heavy, off-black background with cyan accent `#22d3ee`. Direction selected from Claude Design canvas exploration that compared three variants (Brand Evolution, Editorial, Engineer). Engineer's Desk won on technical-credibility signal for cloud/platform/DevOps roles.

### Identity

**Tagline:** `Cloud & Platform Engineer · Azure · IaC · DevOps`

This identity must be unified across:
- Portfolio site (this spec)
- GitHub bio (currently says "Full-stack developer" — change)
- LinkedIn headline
- Resume header

### Audience priority

In order of weight:
1. Defense-sector recruiters and hiring managers (Colorado Springs market — Parsons, Leidos, SAIC, Peraton, Chenega)
2. Generalist cloud/platform/DevOps recruiters
3. Engineering leads doing technical due diligence

The site must satisfy all three but is *optimized* for the first.

### Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Site mode** | Hybrid (single-page main + deep-dive routes) | Recruiters skim the main page; hiring managers click through to depth |
| **Project hierarchy** | Flat — all featured projects equal weight | User preference; lets each project show different muscle group |
| **Hero asset** | Bear coding image (`bear-coding.png`) | On-brand, charming, technically credible |
| **Component library** | Stack-pure in `apps/portfolio/src/lib/components/` | `@maber/ui` (`packages/ui`) confirmed as orphaned scaffolding — 4 files, zero apps import from it. PCPC follows the same stack-pure convention. Promote later when shared primitives emerge from real usage. See §11. |
| **Light mode** | Deferred | Match PCPC pattern — dark-only ships faster |
| **GhDashboard data layer** | Server-side fetch with GitHub token | Avoid rate limits, eliminate `jogruber.de` third-party dep, defense-sector supply-chain hygiene |
| **Bear monitor animation** | Deferred | Code is in the canvas but commented out; positioning is finicky |
| **Ops tile** | Removed | Mocked uptime data is a credibility risk for hiring managers |
| **Extra routes** | None for now | Keep spec lean; `/blog`, `/uses`, etc. are future enhancements |

### Conventions

These conventions apply across the rebuild. Match them in every commit.

**Commit messages:** Conventional Commits format, matching PCPC's pattern.
- `feat(portfolio): add CommandPalette component`
- `fix(portfolio): correct TopBar height calculation`
- `docs(portfolio): expand decisions section in PCPC deep-dive`
- `chore(portfolio): bump mermaid to 11.x`
- Scope is always `portfolio` for changes to `apps/portfolio/`. Use `ui`, `repo`, etc. for cross-cutting changes.

**Branch naming:** `feature/portfolio-*` for feature branches, `fix/portfolio-*` for bug fix branches against an open feature. The redesign itself lives on `feature/portfolio-redesign`. Sub-branches off the redesign aren't recommended — keep work linear on the redesign branch and rely on commits, not branches, for incremental progress.

**Styling pattern:** Pattern B per §0.8 — CSS variables for design tokens, scoped `<style>` blocks consuming `var(--token)`, Tailwind only for structural utilities (flex, grid, spacing, typography helpers).

**File naming:** PascalCase for Svelte components (`TopBar.svelte`), camelCase for hooks and utilities (`useClock.svelte.ts`), kebab-case for routes per SvelteKit convention (`projects/[slug]/+page.svelte`).

**Import paths:** Use `$lib/...` SvelteKit alias for cross-component imports (`import TopBar from '$lib/components/TopBar.svelte'`). Never use relative paths that traverse upward (`../../...`).

**TypeScript:** Strict mode on. `any` is forbidden — use `unknown` and narrow when needed. Component props always typed via `$props()` destructure.

---

## 2. Design tokens

All tokens live in `apps/portfolio/src/lib/styles/tokens.css` as CSS custom properties. Component styles consume tokens — never hardcode values.

### Colors

```
ACCENT          #22d3ee   (cyan — primary accent for highlights, CTAs, active states)
ACCENT_DIM      rgba(34,211,238,0.4)   (subdued accent for borders, backgrounds)
ACCENT_GLOW     rgba(34,211,238,0.04)  (very subtle hover backgrounds)

BG              #0a0b0a   (page background, deepest)
BG2             #0e0f0d   (alternate section background)
PANEL           #121310   (elevated panels, cards)
PANEL2          #16181446 (translucent panel for layered surfaces)

BORDER          rgba(255,255,255,0.08)   (subtle dividers)
BORDER_STRONG   rgba(255,255,255,0.14)   (emphasized dividers, focused borders)

TEXT            #e6e7e3   (primary text)
MUTED           rgba(230,231,227,0.56)   (secondary text)
DIM             rgba(230,231,227,0.36)   (tertiary text, labels)

STATUS_LIVE     #22c55e   (green — for "open to work" pulsing dot, live indicators)
```

### Typography

```
MONO            "JetBrains Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace
SANS            "Inter", system-ui, sans-serif
```

Font loading strategy:
- Preload `JetBrains Mono` and `Inter` Latin subsets via `<link rel="preload">` in `app.html`
- Use `font-display: swap` to avoid invisible text during load
- Self-host both fonts under `static/fonts/` to eliminate Google Fonts third-party request (defense-sector hygiene)

### Type scale

| Token | Size | Usage |
|---|---|---|
| `--fs-micro` | 11px | Uppercase labels, metadata |
| `--fs-small` | 13px | Body text, secondary info |
| `--fs-base` | 15px | Primary body text |
| `--fs-lg` | 18px | Subheadings |
| `--fs-xl` | 28px | Section labels |
| `--fs-2xl` | 56px | Section heading |
| `--fs-hero` | 132px | Hero name (responsive — scales down on mobile) |

### Spacing

Standard 8px grid. Components use multiples of 4px when finer control is needed.

```
--space-0.5   2px
--space-1     4px
--space-2     8px
--space-3     12px
--space-4     16px
--space-6     24px
--space-8     32px
--space-12    48px
--space-16    64px
--space-24    96px
--space-32    128px
```

### Layout

```
--layout-max-width    1240px   (main content max width)
--topbar-height       33px     (sticky TopBar)
--nav-height          56px     (sticky Nav, sits flush below TopBar)
--section-pad-y       100px    (vertical padding inside sections)
--section-pad-x       32px     (horizontal padding, reduces on mobile)
```

### Effects

```
--radius-sm     4px
--radius-md     8px
--radius-lg     14px
--blur-backdrop blur(8px)
--transition-fast    160ms ease
--transition-normal  240ms ease
```

---

## 3. Page structure

The main page is a single scroll with 5 sections (canvas order; deviates from PCPC spec which had a separate proof strip). The order is intentional:

1. **Hero (`#about`)** — visual hook + identity + CTAs + GhDashboard
2. **Work (`#work`)** — projects with expandable detail rows
3. **Now (`#now`)** — current focus, signals "actively building"
4. **Skills (`#skills`)** — grouped technical inventory
5. **Contact (`#contact`)** — closing CTA + contact rows

Above the sections, two sticky elements:
- **TopBar** (height 33px) — status strip
- **Nav** (height 56px) — section navigation

### TopBar

Sticky at `top: 0`, `z-index: 60`. Layout:
- **Left:** `~/maber.io` · `main` (mono, dim color, suggests git branch indicator)
- **Right:** Pulsing green dot · `open to work` · `remote · colorado springs, co`

No other links. Email/CTAs live in Contact.

### Nav

Sticky at `top: 33px` (flush below TopBar), `z-index: 50`. Layout:
- **Left:** Logo button — `❯ mike_abernathy.portfolio` (mono, white text, cyan caret)
- **Right:** Section links — `[about] [work] [now] [skills] [contact]` (mono, brackets dim, label active when in viewport)
- **Far right:** `⌘K` button — opens command palette

Nav transparency: solid background `rgba(10,11,10,0.92)` with `backdrop-filter: var(--blur-backdrop)` for legibility over scrolling content.

### Hero (`#about`)

The most visually rich section. Structure top to bottom:

1. **Background** — `static/images/bear-coding.png` full-bleed, `background-attachment: fixed` so it stays put on scroll, `background-size: cover`, `background-position: center`
2. **Overlays** (layered above background):
   - Gradient veil — vertical dark gradient for legibility (`linear-gradient(180deg, rgba(10,11,10,0.35) 0%, rgba(10,11,10,0.85) 100%)`)
   - Scanline texture — subtle horizontal scanlines at low opacity for retro-terminal feel
3. **Content stack** (centered, `max-width: 1240px`):
   - **Name line:** `$ whoami` (cyan `$`, mono dim text) → reveals on load → `Mike Abernathy` at 132px, sans-serif, weight 800. Last name `Abernathy` rendered in cyan `#22d3ee` with subtle text-shadow glow.
   - **Tagline line:** `$ cat /etc/about` (cyan `$`, dim) → typed reveal → `Cloud & Platform Engineer · Azure · IaC · DevOps` (mono, white)
   - **Stack line:** `$ ls ~/stack` (cyan `$`, dim) → reveal → `azure · terraform · kubernetes · sveltekit · python · typescript` (mono, muted)
   - **CTAs** — two buttons side by side:
     - Primary: `./view_work.sh` (cyan filled, dark text) → smooth-scrolls to `#work`
     - Ghost: `./contact.sh` (cyan border, cyan text, transparent bg) → smooth-scrolls to `#contact`
   - **GhDashboard** — see Section 4

### Work (`#work`)

Section header pattern (used across all sections):
- Top row: dim label `/work` (mono) + decorative count `[ N projects ]`
- Section title — sans-serif, large, weight 800, cyan ampersand or punctuation accent

Project list — vertical stack of expandable rows. Each row default state:
- Number `01.` (cyan, mono, large)
- Title `Project Name` (sans, weight 600, large)
- Year `2025` (dim, mono, small, right-aligned)
- One-line blurb (muted)
- Stack pills — small mono badges with cyan accent borders

Click on row → expands to reveal:
- Longer description
- `live →` and `source →` links
- `read deep-dive →` link to `/projects/[slug]` route
- Project thumbnail or screenshot if available

Animation: smooth height transition (`max-height` from `0` to `auto` won't animate — use `grid-template-rows` trick or measured pixel height).

### Now (`#now`)

Section header `/now`. Subtitle: `currently — last updated [date]` (dim, mono).

Body: terminal-style row list. Each row:
- Label (dim, mono, uppercase, letter-spacing 1.8px) `BUILDING` / `LEARNING` / `READING` / `LISTENING`
- Value (white, sans) — current focus

Refresh cadence: monthly. Stale `/now` is worse than no `/now` — set a calendar reminder.

### Skills (`#skills`)

Section header `/skills`. Subtitle: `dropping the buzzword soup`.

Layout: 6-column grid (responsive — collapses to 2 columns on mobile). Each column is a category. Within each category:
- Category name (cyan, mono, uppercase)
- Skill list (one per line, mono, muted)

Categories (in order):
1. **CLOUD** — Azure (Functions, Static Web Apps, Cosmos DB, API Management, Lighthouse, Blueprint, Batch, Cloud Services)
2. **IAC** — Terraform, Bicep, ARM, Azure Policy, Resource Graph
3. **CI/CD** — Azure DevOps Pipelines, GitHub Actions, tfsec, Checkov
4. **OBSERVABILITY** — Azure Monitor, Log Analytics, Application Gateway diagnostics, KQL
5. **SECURITY** — RBAC, governance, private endpoints, VNet/subnetting, ExpressRoute
6. **LANGUAGES** — PowerShell, Python, TypeScript, SQL (MySQL, KQL), Bash

Optional 7th column for `FRONT-END` if it fits without crowding: SvelteKit, TailwindCSS, WebGL.

Filter UI: optional row of category pills above the grid. Click to filter visible categories. Default is "all".

### Contact (`#contact`)

Section header pattern `/contact` (cyan `$`, dim, mono): `$ curl -X POST mike@maber.io`.

Title: `let's ship` (sans, white, 88px) + line break + `something_good` (cyan, same size).

Subtitle: `open to senior cloud, platform, and devops roles. also up for a chat about azure weirdness, sveltekit, or pokémon tcg market data.` (mono, muted, max-width 560px).

Contact rows — each row has uniform layout: `[label] [value] [arrow]`:
- `EMAIL` — `mike@maber.io` → `mailto:mike@maber.io`
- `SCHEDULE` — `cal.com/mike-abernathy` → real Cal.com URL (replace placeholder)
- `GITHUB` — `github.com/Abernaughty` → `https://github.com/Abernaughty`
- `LINKEDIN` — `linkedin.com/in/michael-abernathy` → existing LinkedIn URL
- `RESUME` — `Michael_Abernathy_Resume.pdf` → real Azure blob URL (replace placeholder)
- `CLEARANCE` — `US Citizen, eligible for SECRET` → no link, plain text row

Hover state: row background flashes to `var(--accent-glow)` over `var(--transition-fast)`.

### Footer

Sticky-bottom-feel but not actually sticky. Single row with three groups:
- Left: live clock (mono, dim) — displays `[HH:MM:SS MST]`
- Center: `built with sveltekit · hosted on vercel · A+ securityheaders.com →` (link badge added in Phase 4)
- Right: `© 2026 mike abernathy · v1.0.0` (mono, dim)

---

## 4. GhDashboard component

Replaces the static "stats strip" pattern (`7+ years / 3 apps / 12 certs / 99.9% uptime`) with live GitHub data. The dashboard *is* the proof, eliminating the need for a separate proof strip.

### Data layer

**Source:** GitHub GraphQL API v4. Authenticated with a fine-grained PAT scoped to public repo metadata only (read-only, no push). Token stored as `GITHUB_PAT` in Vercel environment variables.

**Endpoint:** `+page.server.ts` for the homepage. SvelteKit's load function fetches GitHub data at request time, returns to the page. Edge-cached for 1 hour via `setHeaders({ 'cache-control': 'public, max-age=3600, s-maxage=3600' })`.

**Why server-side:** Eliminates client-side rate limits (60 req/hour unauthenticated), keeps the token off the client, removes third-party `jogruber.de` dependency, protects against supply-chain risk.

**Fallback:** If the fetch fails, the page renders skeleton placeholders for each module. Never blocks page load.

### GraphQL query

Single query fetches:
- User stats (followers, public repo count)
- Top 4 repos by stargazers (name, description, primaryLanguage, stargazerCount, url)
- Recent 5 events from `user.contributionsCollection.commitContributionsByRepository[].contributions.nodes`
- Contribution calendar — `contributionsCollection.contributionCalendar.weeks[].contributionDays[]` (date, contributionCount, color)
- Language breakdown — derived from top repos' `languages.edges[]` weighted by size

### Modules (top to bottom)

**Header row**
```
$ gh status ── @Abernaughty · N repos · M followers · ● live
```
- `$` cyan, `gh status` mono dim, separator `──` dim
- Username with `@` cyan
- Live dot — green if data is fresh (cached < 1h), amber if stale-but-served (cached > 1h, fresh fetch failed), grey if fully fallback

**Contribution heatmap**
- 53 columns × 7 rows grid
- Cyan-tinted color scale (5 levels — based on contribution count quartiles)
- Hover tooltip: `N contributions on YYYY-MM-DD`
- Full width of dashboard panel

**Three-up grid (responsive — stacks on mobile)**

*Top repos card:*
- Title: `top repos` (cyan, mono, uppercase)
- 4 repo rows, each: name (white, weight 500), description (muted, truncated), primary language dot + name, star count `★ N`
- Each row links to repo on GitHub (new tab)

*Recent activity card:*
- Title: `recent activity` (cyan, mono, uppercase)
- 5 event rows, each: time-ago (`Nh`), verb (`pushed to`, `opened`, etc.), target (`repo · "commit msg"`)
- Truncate long messages with ellipsis

*(Third tile removed — Ops tile dropped from spec; consider replacing with stack visualization or dropping to two-up grid)*

**Languages bar**
- Stacked horizontal bar showing top 5 languages by total bytes across top repos
- GitHub-standard language colors (TypeScript blue, Python yellow, etc.)
- Legend below: `● TypeScript 42% · ● Python 28% · ...`

### Skeleton fallback

Per-module skeletons (not a single blanket spinner). Each module independently shows skeleton while loading or on fetch failure. Skeletons match real layout dimensions to prevent layout shift.

### Caching

| Layer | TTL | Purpose |
|---|---|---|
| Vercel edge cache | 1h | Reduce origin requests |
| SvelteKit `load` | Per-request | Fresh data when cache misses |
| GraphQL response cache | None | Origin fetch is the source of truth |

No localStorage cache (server-side approach makes it redundant).

---

## 5. Component architecture

All components live in `apps/portfolio/src/lib/components/`. Stack-pure — no `packages/ui` consumption. Promote to `packages/ui` later if real duplication emerges with PCPC (see Section 11 — Open / parked items).

### Component inventory

| Component | Responsibility |
|---|---|
| `TopBar.svelte` | Sticky status strip — branch + open-to-work + location |
| `Nav.svelte` | Sticky section nav with active-section tracking |
| `CommandPalette.svelte` | ⌘K fuzzy-jump modal |
| `Hero.svelte` | Hero section with bear background, overlays, typed text, CTAs |
| `WorkSection.svelte` | `/work` section wrapper |
| `ProjectRow.svelte` | Single expandable project row (consumed by WorkSection) |
| `NowSection.svelte` | `/now` section with current-focus rows |
| `SkillsSection.svelte` | `/skills` section with grouped category grid |
| `ContactSection.svelte` | `/contact` section with rows + closing CTA |
| `Footer.svelte` | Footer with clock, badges, copyright |
| `GhDashboard.svelte` | GitHub dashboard composition |
| `GhDashboard/HeaderRow.svelte` | Status header line |
| `GhDashboard/ContribHeatmap.svelte` | 53×7 contribution grid |
| `GhDashboard/TopRepos.svelte` | Top 4 repos card |
| `GhDashboard/RecentActivity.svelte` | Recent events card |
| `GhDashboard/LanguagesBar.svelte` | Stacked language bar |
| `GhDashboard/Skeleton.svelte` | Per-module skeleton fallback |
| `Reveal.svelte` | Intersection-observer reveal-on-scroll wrapper |
| `Caret.svelte` | Blinking cursor primitive |
| `TerminalPrompt.svelte` | `$ cmd` prompt primitive used in section headers |

### Hooks / utilities

In `apps/portfolio/src/lib/hooks/`:

| File | Responsibility |
|---|---|
| `useClock.svelte.ts` | Live clock state for footer |
| `useTyping.svelte.ts` | Typewriter effect for hero text |
| `useActiveSection.svelte.ts` | IntersectionObserver-based active section tracking |
| `useSmoothScroll.svelte.ts` | Smooth-scroll to section ID |

### Constants

In `apps/portfolio/src/lib/constants/`:

| File | Contains |
|---|---|
| `identity.ts` | `NAME`, `TAGLINE`, `STACK_LINE`, `LOCATION` |
| `projects.ts` | Featured projects array (filled in after design phase per project lineup decision) |
| `skills.ts` | Grouped skills object — see Section 3 Skills |
| `now.ts` | NOW_ITEMS array — `building`, `learning`, `reading`, `listening` |
| `contact.ts` | Contact entries — label, display, href tuples |

### Styles

In `apps/portfolio/src/lib/styles/`:

| File | Purpose |
|---|---|
| `tokens.css` | All design tokens (colors, type, spacing, layout, effects) |
| `app.css` | Global reset + base typography + Tailwind directives |
| `fonts.css` | `@font-face` declarations for self-hosted JetBrains Mono and Inter |

---

## 6. Routes

### Single-page main

`apps/portfolio/src/routes/+page.svelte` — assembles the 5 sections in order. Loads data via `+page.server.ts` (GhDashboard data fetched server-side, passed as props).

### Deep-dive routes

Pattern: `apps/portfolio/src/routes/projects/[slug]/+page.svelte`

Each project gets its own `[slug]/+page.svelte` plus optional `+page.server.ts` if dynamic data is needed (e.g., live GitHub stats for that project).

Slugs match project IDs in `constants/projects.ts`. Linked from `ProjectRow` expanded state via `read deep-dive →`.

### Resume route

`apps/portfolio/src/routes/resume/+page.svelte` — HTML rendering of resume content. Plus `+server.ts` route that 302-redirects to the Azure blob PDF for direct downloads. Both live under `/resume`:
- Visiting `/resume` in browser → HTML view
- `/resume.pdf` → redirect to PDF blob

(Note: original spec had no extra routes — `/resume` is part of the planned scope, just being explicit about the implementation.)

### Sitemap

`apps/portfolio/src/routes/sitemap.xml/+server.ts` — generates sitemap dynamically from known routes. Includes `/`, `/projects/[slug]` for each project, `/resume`.

### robots.txt

`apps/portfolio/static/robots.txt` — allows crawling, points to sitemap. Standard:

```
User-agent: *
Allow: /
Sitemap: https://dev.maber.io/sitemap.xml
```

---

## 7. Deep-dive page template

Each `/projects/[slug]` page follows a 5-section structure. The point is to *demonstrate aptitude* through curated artifacts, not re-host the GitHub repo. Keep each section tight.

### Layout

Main content area, 760px max-width centered, generous vertical rhythm. Sticky breadcrumb at top: `← projects · [project name]`.

### Section 1 — The 30-second pitch

**Format:** Two-column block (`grid-template-columns: 1fr 1fr` on desktop, stacks on mobile).

**Left column:**
- Project number `01.` (cyan, mono, large)
- Title (sans, weight 800, 56px)
- One-paragraph summary (~3 sentences, mono, base size)

**Right column — metadata block:**
```
TYPE      Full-stack · Cloud
YEAR      2025
STACK     SvelteKit · TypeScript · Azure Functions · Cosmos DB · Terraform
STATUS    Live · Active development
ROLE      Solo · Architecture, IaC, frontend, ops
```

### Section 2 — Live demo button

**Format:** Single full-width call-to-action panel.

```
┌─────────────────────────────────────────────────┐
│  [LIVE DEMO]   See it running                   │
│  pcpc.maber.io                          ↗       │
└─────────────────────────────────────────────────┘
```

Cyan-bordered panel, hover lights up. Opens demo in new tab. Below: small `view source on github →` text link.

### Section 3 — Architecture

**Heading:** `architecture` (`/architecture` mono dim above)

**Content:**
- Mermaid diagram rendered live (use `mermaid` package, not pre-rendered SVG, so diagrams stay in sync with source)
- Brief paragraph below diagram explaining the high-level data flow

**Stub content for PCPC:**

> The system is a layered cache architecture across three storage tiers. The client maintains an IndexedDB cache for hot data, the server uses Cosmos DB for warm data, and Scrydex is the origin. Each tier has independent staleness detection and refresh logic.

### Section 4 — "Decisions worth reading"

**Heading:** `decisions` (`/decisions` mono dim above)

**Format:** Stack of expandable callout cards. Default state shows the question; click to expand the answer.

**Stub content for PCPC:**

```
Q: Why Cosmos DB Serverless over standard?
A: Read traffic is bursty and unpredictable. Standard's RU/s
   provisioning was overpaying for idle. Serverless is pay-per-RU,
   scales to zero between traffic spikes, and the cold-start
   overhead is acceptable for a non-realtime app.

Q: Why API Management instead of direct Function calls?
A: Three reasons — rate limiting per consumer, response caching at
   the edge, and a stable contract surface that decouples client
   versioning from backend. APIM also gives me a single point for
   adding auth later without touching every Function.

Q: Why Terraform with 7 modules instead of one big config?
A: Blast radius. A typo in a monolithic config can wipe production.
   Modules let me scope `terraform plan` to a single concern (e.g.,
   networking, data, compute) and review changes in isolation.
   They're also reusable across environments.

Q: Why a DevContainer with a pre-built ACR image?
A: Onboarding. New machine setup went from "install Node, pnpm,
   Azure CLI, Terraform, Bicep, configure tokens" to "open in
   DevContainer." 15 minutes to 60 seconds. Plus the image is
   versioned alongside the code so old branches always have the
   right toolchain.

Q: Why Svelte runes instead of stores for state?
A: Runes are component-scoped state that survives across renders
   without store-subscription boilerplate. For a small app with
   localized state, runes have lower ceremony than the store
   pattern. Stores still appropriate for cross-component shared
   state — see pricing.svelte.ts for that case.
```

Each Q/A pair is its own card. Aim for 3–5 per project. These prove engineering judgment, not just typing skill.

### Section 5 — Code highlights

**Heading:** `code` (`/code` mono dim above)

**Format:** 2–3 annotated code snippets. Each snippet has:
- A title explaining what the code does
- A 1-sentence "why this is interesting" caption
- Syntax-highlighted code block (use Shiki for SSR-safe highlighting)
- `view full file on github →` link below

**Stub content for PCPC:**

```
"Boundary normalization for the Scrydex API"
Snippet of mapPaginatedResponse showing how the
snake_case → camelCase transformation lives at exactly
one place in the codebase, eliminating a class of bugs.

"Modular Terraform composition"
Snippet of root main.tf showing the 7 modules
composed with explicit dependency wiring, demonstrating
how blast radius is contained per module.

"DevContainer with pre-built ACR image"
Snippet of devcontainer.json showing the image
reference and post-create hooks for instant onboarding.
```

Choose snippets that show *judgment* — boundary handling, error cases, separation of concerns — not boilerplate.

### Footer of deep-dive

End each deep-dive with two links:
- `← back to projects` — returns to main page `#work`
- `next: [project name] →` — links to the next project's deep-dive

---

## 8. Files to create / modify

This section is exhaustive. Every file Claude Code (or you) will create lives here.

### New files — Routes

```
apps/portfolio/src/routes/
├── +layout.svelte                      # Root layout — TopBar, Nav, slot, Footer
├── +layout.server.ts                   # Inject GitHub PAT env, no-op load
├── +page.svelte                        # Main page — composes 5 sections
├── +page.server.ts                     # Server-side GhDashboard data fetch
├── projects/
│   └── [slug]/
│       ├── +page.svelte                # Deep-dive page (template-driven)
│       └── +page.ts                    # Loads project data by slug
├── resume/
│   ├── +page.svelte                    # HTML resume view
│   └── +server.ts                      # /resume.pdf redirect
└── sitemap.xml/
    └── +server.ts                      # Dynamic sitemap generator
```

### New files — Components (apps/portfolio/src/lib/components/)

```
TopBar.svelte
Nav.svelte
CommandPalette.svelte
Hero.svelte
WorkSection.svelte
ProjectRow.svelte
NowSection.svelte
SkillsSection.svelte
ContactSection.svelte
Footer.svelte
Reveal.svelte
Caret.svelte
TerminalPrompt.svelte
ProjectDeepDive/
  ├── PitchSection.svelte
  ├── DemoButton.svelte
  ├── ArchitectureSection.svelte
  ├── DecisionsSection.svelte
  ├── DecisionCard.svelte
  ├── CodeSection.svelte
  └── CodeSnippet.svelte
GhDashboard/
  ├── GhDashboard.svelte
  ├── HeaderRow.svelte
  ├── ContribHeatmap.svelte
  ├── TopRepos.svelte
  ├── RecentActivity.svelte
  ├── LanguagesBar.svelte
  └── Skeleton.svelte
```

### New files — Hooks (apps/portfolio/src/lib/hooks/)

```
useClock.svelte.ts
useTyping.svelte.ts
useActiveSection.svelte.ts
useSmoothScroll.svelte.ts
```

### New files — Constants (apps/portfolio/src/lib/constants/)

```
identity.ts
projects.ts
skills.ts
now.ts
contact.ts
```

### New files — Styles (apps/portfolio/src/lib/styles/)

```
tokens.css
app.css
fonts.css
```

### New files — Data layer (apps/portfolio/src/lib/server/)

```
github.ts          # GraphQL query + fetch utility
mermaid.ts         # Server-side Mermaid rendering helper if needed
```

### New files — Static assets (apps/portfolio/static/)

```
images/bear-coding.png             # Hero background
images/projects/[slug]-thumb.png   # Project thumbnails
fonts/JetBrainsMono-*.woff2        # Self-hosted font files
fonts/Inter-*.woff2                # Self-hosted font files
robots.txt
favicon.svg
.well-known/security.txt           # Phase 4
```

### New files — Config

```
apps/portfolio/staticwebapp.config.json   # If serving via Azure SWA
                                            # (Vercel uses vercel.json)
apps/portfolio/vercel.json                # Headers config — see Phase 4
```

### Files to modify

```
apps/portfolio/src/app.html               # Add font preload, OG defaults
apps/portfolio/src/app.css                # Replace with new global CSS
apps/portfolio/src/lib/index.ts           # Update exports if applicable
apps/portfolio/svelte.config.js           # Verify adapter-vercel config
apps/portfolio/tailwind.config.ts         # Configure to consume tokens
apps/portfolio/package.json               # Add deps — see below
```

### Dependencies to add

```jsonc
{
  "dependencies": {
    "mermaid": "^11.x",          // Architecture diagrams in deep-dives
    "shiki": "^1.x"              // SSR code highlighting
  },
  "devDependencies": {
    // No new dev deps anticipated
  }
}
```

Avoid adding more — the canvas demonstrates that the dashboard can be built with zero deps. Stay minimal.

### Files to delete

If the current `apps/portfolio` has placeholder pages from the Turborepo template, delete them as part of Phase 1. List in the actual implementation PR.

---

## 9. Implementation order

5 phases. Ship after each phase — don't wait for completeness. Each phase should be a separate PR for clear review and easy rollback.

### Phase 1 — Port Engineer's Desk to SvelteKit (week 1)

**Goal:** Get the visual design ported from React/Babel to SvelteKit with feature parity to the canvas.

- Set up `apps/portfolio` to consume tokens.css, fonts.css, app.css
- Port React components to Svelte 5:
  - `useState` → `$state`
  - `useEffect` → `$effect` or `onMount`
  - `useRef` → `let el` + `bind:this={el}`
  - Inline styles → scoped `<style>` blocks (acceptable for now; refactor to Tailwind in Phase 2 if desired)
- Build TopBar, Nav, CommandPalette, Hero, WorkSection, ProjectRow, NowSection, SkillsSection, ContactSection, Footer
- Wire smooth scroll, active section tracking, command palette
- Fill placeholder constants from canvas data (PROJECTS, NOW_ITEMS, SKILLS, contact entries)
- Replace placeholder URLs:
  - Resume → real Azure blob URL
  - Schedule → real Cal.com URL (or remove if not set up)
- Build minimal GhDashboard with skeleton-only state (data layer comes Phase 2)
- Ship to Vercel preview, run Gate 1 + Gate 2

### Phase 2 — Content + identity refinements + GhDashboard data (week 1.5)

**Goal:** Lock identity, regroup skills, wire real GitHub data.

- Update GitHub bio + LinkedIn headline to match `Cloud & Platform Engineer · Azure · IaC · DevOps`
- Decide and update PROJECTS array with the 3 featured projects (this decision was deferred — make it now)
- Regroup SKILLS into Cloud / IaC / CI-CD / Observability / Security / Languages
- Add narrative beat to hero — extend typed sequence with one more line:
  - `$ cat /etc/story` → `built support muscle at microsoft. now shipping cloud infrastructure end to end.`
- Add CLEARANCE row to ContactSection: `US Citizen, eligible for SECRET`
- Implement GhDashboard data layer:
  - `+page.server.ts` fetches GraphQL query
  - GitHub PAT in Vercel env as `GITHUB_PAT`
  - Edge cache 1h
  - Skeleton fallback per module on fetch failure
- Run Gate 1 + Gate 2

### Phase 3 — Deep-dive routes (week 2)

**Goal:** Build the deep-dive case study pattern, replicate for top projects.

- Build `/projects/[slug]` route + `+page.ts` slug-based data loader
- Build deep-dive component family: `PitchSection`, `DemoButton`, `ArchitectureSection`, `DecisionsSection`, `DecisionCard`, `CodeSection`, `CodeSnippet`
- Wire Mermaid rendering with `mermaid` package (lazy-loaded — diagrams shouldn't block initial render)
- Wire Shiki for code highlighting (SSR-safe)
- Build PCPC deep-dive content using stub pattern from Section 7 — write 4–5 real Q/A decisions + 2–3 real code snippets
- Wire `read deep-dive →` link from each `ProjectRow`
- Replicate template for the other 2 featured projects (their content drafted but kept lighter than PCPC)
- Run Gate 1 + Gate 2 — extra verification for routing edge cases (direct URL load, back button, breadcrumb)

### Phase 4 — Security + supply chain hardening (week 3)

**Goal:** Defense-sector-grade hygiene. Visible A+ grade is the deliverable.

- Configure security headers in `vercel.json`:
  - `Content-Security-Policy` (strict, whitelist self + GitHub avatar CDN if needed)
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` — explicitly disable unused features
  - `X-Frame-Options: DENY`
- Verify A+ grade at securityheaders.com — capture screenshot for portfolio
- Add securityheaders.com badge link to footer
- Drop `static/.well-known/security.txt` per RFC 9116
- Audit third-party requests in browser DevTools Network tab — should be zero (fonts self-hosted, no analytics, GitHub data server-side)
- Investigate the dev.maber.io 403 issue blocking LinkedIn unfurl and OpenGraph tools — likely Cloudflare bot rules; relax for known crawlers
- Run Gate 1 + Gate 2

### Phase 5 — SEO, sharing, polish (week 3.5)

**Goal:** Make the site discoverable and shareable.

- Add OpenGraph meta tags in `+layout.svelte` `<svelte:head>`:
  - `og:title`, `og:description`, `og:image` (1200×630 PNG with name + tagline + bear), `og:url`, `og:type=website`
- Add Twitter Card variant tags
- Add JSON-LD Person schema in `<svelte:head>` — name, jobTitle, url, sameAs (LinkedIn, GitHub)
- Generate `sitemap.xml/+server.ts`
- Verify semantic heading hierarchy — exactly one `h1` (hero name), `h2` per section, `h3` per project row, etc.
- Test OpenGraph rendering at opengraph.xyz
- Test on real mobile device — iOS Safari + Android Chrome
- Run Gate 1 + Gate 2 — verify on mobile devices, not just DevTools emulator

---

## 10. Testing gates

Every phase must pass two gates before moving to the next. This pattern is borrowed from the PCPC redesign Section 10.1 and proved itself across 11 phases there.

### Vercel URLs

| Resource | URL |
|---|---|
| **Dashboard** | https://vercel.com/abernaughtys-projects/portfolio |
| **Production** | https://dev.maber.io |
| **Preview (feature/portfolio-redesign)** | `https://portfolio-git-feature-portfolio-redesign-abernaughtys-projects.vercel.app` |

Git integration is connected — pushes to any branch auto-trigger preview builds.

### Testing workflow

Use **Claude in Chrome** browser automation for both Gate 1 and Gate 2. Same workflow as PCPC redesign:

1. **Check build status** — Navigate to Vercel dashboard, confirm green status on the latest commit
2. **Navigate to preview** — Open the preview URL for `feature/portfolio-redesign`
3. **Gate 1 — Build check** — Refresh the page, verify zero console errors with `read_console_messages(onlyErrors=true)`
4. **Gate 2 — Smoke test** — Walk through the user flow per the checklist below
5. **Step-specific checks** — Verify the phase's unique requirements

### Gate 1: Build check

Vercel preview deploy must succeed (`pnpm build` for `apps/portfolio`). This catches TypeScript errors, missing imports, broken Svelte compilation. Confirm by loading the preview URL — no build error page.

### Gate 2: Smoke test — full user flow

Walk through the core flow on the Vercel preview:

1. Page loads without console errors
2. TopBar shows status correctly
3. Nav scroll-spy updates active section as you scroll
4. CommandPalette opens with `⌘K` (or `Ctrl+K`), filters sections, jumps on selection
5. Hero typed sequence completes
6. Hero CTAs scroll to correct sections
7. Each project row expands and collapses
8. `/projects/[slug]` deep-dive loads (Phase 3+)
9. Contact rows are clickable, hover state works
10. Footer clock ticks
11. No layout shift on font load
12. No visual regressions in areas not touched by the current phase

### Phase-specific checks

| Phase | Additional verification |
|---|---|
| 1. Port to SvelteKit | All canvas features work in Svelte. Bear background stays fixed on scroll. Typing animation runs once. CommandPalette traps focus. No console warnings about Svelte 5 deprecated patterns. |
| 2. Content + GhDashboard | Identity copy matches across hero, GitHub bio, LinkedIn. SKILLS grid groups correctly. GhDashboard shows real data on first load. Skeletons appear if you throttle network in DevTools. Cache header `s-maxage=3600` visible in response. |
| 3. Deep-dive routes | Direct URL load of `/projects/pcpc` works (test in incognito). Back button returns to main page at `#work`. Mermaid diagram renders (no flash of raw text). Shiki highlights code with correct theme colors. Decision cards expand/collapse. |
| 4. Security | securityheaders.com shows A+ grade. CSP doesn't break any feature (test all interactions). `/.well-known/security.txt` returns 200. DevTools Network tab shows zero third-party domain requests. |
| 5. SEO + polish | opengraph.xyz preview renders correctly with image. JSON-LD validates at validator.schema.org. Sitemap returns valid XML. Mobile Lighthouse score ≥90 in all categories. |

### Regression policy

If a phase introduces a regression caught by Gate 2:
- Fix before proceeding to the next phase
- Non-trivial fixes get their own `fix:` commit for clear git history
- Don't batch fixes across phases

---

## 11. Open / parked items

These are explicitly out of scope for v1 but tracked for future consideration.

### Bear monitor typing animation

**Status:** Built in canvas (`<BearMonitor />` + `BEAR_SNIPPETS` for `honey.ts`/`naptime.ts`/`scratch.ts`) but commented out because positioning over the bear's monitor in the PNG was finicky. Code remains in the canvas's `engineer-page.jsx` if revisiting.

**To revisit if:** A new bear image with predictable monitor positioning is created, OR a CSS-only fallback positioning strategy is found.

### Ops tile

**Status:** Removed from spec entirely. Mocked Azure + Vercel uptime data was a credibility risk.

**To revisit if:** Real status APIs are wired in. Azure status RSS or Vercel deployments API would be the data sources. Consider as a `/projects/portfolio` deep-dive feature first.

### packages/ui — current state and future plan

**Confirmed state (April 30, 2026):** `packages/ui` (named `@maber/ui` in the workspace) contains four files: `Button.svelte`, `SiteHeader.svelte`, `SiteFooter.svelte`, and `index.ts`. **Zero apps import from `@maber/ui` today** — the package is dead code from early monorepo scaffolding that was never wired up. PCPC built its own components in `apps/pcpc/src/lib/components/` rather than consuming from the shared package.

**Decision for portfolio v1:** Stack-pure. Build everything in `apps/portfolio/src/lib/components/` per the convention PCPC established. Don't touch `@maber/ui` as part of the portfolio rebuild — single concern per PR.

**Optional housekeeping (separate PR, low priority):** Either delete `@maber/ui` entirely, or repurpose it later. The four files inside are scaffolding that doesn't match either app's design language:
- `Button.svelte` — likely generic, could be a future shared primitive
- `SiteHeader.svelte` / `SiteFooter.svelte` — were probably intended as a shared site shell, but PCPC's elevated-dark aesthetic and portfolio's terminal aesthetic would each need different shells anyway

**To revisit when:** Portfolio + PCPC have both shipped and have ~4 weeks of real usage. Then identify shared primitives empirically:
- Tokens (colors, fonts, spacing) — could move to `packages/config` instead, since each app has a different palette
- `Reveal` / `Caret` / `TerminalPrompt` — only if PCPC adopts terminal aesthetics anywhere (currently doesn't)
- `CommandPalette` — only if PCPC adds one
- `GhDashboard` — portfolio-specific, unlikely to share

Promote as a deliberate refactor PR with both apps as consumers from the start. Document the migration as a portfolio-able win in the `/projects/portfolio` deep-dive.

### Light mode

**Status:** Deferred. Dark-only ships faster. Engineer's Desk aesthetic isn't well-suited to light mode anyway — the cyan accent loses contrast.

**To revisit if:** Strong reason emerges (accessibility complaint, target audience preference). Likely never.

### Blog / writing route

**Status:** Skipped per user preference for lean spec.

**To revisit when:** First substantive technical writeup is drafted. A blog with one post is worse than no blog. Wait for content before scaffolding the route.

### Project lineup

**Status:** Deferred to Phase 2 of implementation.

**Considerations when picking:**
- PCPC stays — it's the strongest signal
- Replace Blackjack slot with one of: agent-dev, code-vector-sync, langchain-price-agent
- Third slot: keep Blackjack OR pick a second AI/MCP project
- Each project should demonstrate a distinct muscle group (cloud architecture, AI tooling, DevOps automation, etc.)

### Cloudflare 403 issue

**Status:** Affects LinkedIn unfurl and OpenGraph preview tools.

**Investigation path:**
1. Check Cloudflare dashboard bot fight settings
2. Allowlist known crawlers — LinkedIn, Slack, Twitter, OpenGraph debug tools
3. Test in incognito browser to confirm the issue is bot-protection-only
4. Verify after fix at opengraph.xyz, https://www.linkedin.com/post-inspector/

---

## 12. Porting notes — React (canvas) → Svelte 5 (target)

The canvas is React with Babel transformation. Claude Code (or you) will port this to Svelte 5. Key transformations:

### State

```jsx
// React (canvas)
const [open, setOpen] = useState(false);
```

```svelte
<!-- Svelte 5 -->
<script>
  let open = $state(false);
</script>
```

For nullable/union types, use the generic form:
```svelte
let user = $state<User | null>(null);  // ✓ correct
let user: User | null = $state(null);    // ✗ inference loses null
```

### Effects

```jsx
// React
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

```svelte
<!-- Svelte 5 -->
<script>
  import { onMount } from 'svelte';
  onMount(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  });
</script>
```

For reactive effects (when state changes), prefer `$effect`:
```svelte
$effect(() => {
  if (open) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
});
```

### Refs

```jsx
// React
const ref = useRef(null);
return <div ref={ref}>...</div>;
```

```svelte
<!-- Svelte 5 -->
<script>
  let el: HTMLDivElement;
</script>
<div bind:this={el}>...</div>
```

### Props

```jsx
// React
function Caret({ color = ACCENT }) { ... }
```

```svelte
<!-- Svelte 5 -->
<script>
  let { color = ACCENT } = $props();
</script>
```

### Inline styles

The canvas uses heavy inline styles. For Svelte:
- **Acceptable for v1**: keep inline styles in scoped `<style>` blocks
- **Refactor target**: move repeated patterns to Tailwind classes consuming tokens via `theme.extend.colors` etc.
- **Don't**: try to convert all inline styles to Tailwind in Phase 1 — incremental is fine

### Conditional rendering

```jsx
// React
{open && <Modal />}
```

```svelte
<!-- Svelte 5 -->
{#if open}
  <Modal />
{/if}
```

### Lists

```jsx
// React
{items.map((item) => <li key={item.id}>{item.name}</li>)}
```

```svelte
<!-- Svelte 5 -->
{#each items as item (item.id)}
  <li>{item.name}</li>
{/each}
```

### Event handlers

```jsx
// React
<button onClick={handleClick}>...</button>
```

```svelte
<!-- Svelte 5 -->
<button onclick={handleClick}>...</button>
<!-- Note: lowercase `onclick`, not `onClick` -->
```

### Image paths

```jsx
// React (canvas — relative path)
<img src="images/bear-coding.png" />
```

```svelte
<!-- Svelte (static/ folder served at root) -->
<img src="/images/bear-coding.png" />
```

### Babel-scope constants

The canvas uses `Object.assign(window, { ... })` to share constants across files because Babel script tags don't share scope. **Drop this entirely** — Svelte modules handle this naturally with `import`/`export`.

### Document/window access

The canvas freely accesses `document` and `window`. SvelteKit SSRs by default, so guard browser-only code:

```svelte
<script>
  import { browser } from '$app/environment';

  function copyToClipboard(text: string) {
    if (!browser) return;
    navigator.clipboard.writeText(text);
  }
</script>
```

### Hooks → Svelte 5 equivalents

| React hook | Svelte 5 equivalent |
|---|---|
| `useState` | `$state` |
| `useEffect` | `$effect` or `onMount` |
| `useRef` | `let el; bind:this={el}` |
| `useMemo` | `$derived` |
| `useCallback` | Plain function (no memoization needed in Svelte) |
| Custom hook | `.svelte.ts` file with `$state`/`$derived` exports |

---

## 13. Decisions log

For future-self reference. Every choice with rationale.

| Decision | Choice | Why |
|---|---|---|
| Visual direction | Engineer's Desk (terminal, cyan) | Strongest fit for cloud/DevOps/platform identity |
| Site mode | Hybrid | Recruiters skim, hiring managers go deep |
| Project hierarchy | Flat | User preference; equal-weight projects show different muscle groups |
| Hero asset | Bear image (no fluid sim) | Charming + on-brand; fluid sim belongs to maber.io, not portfolio |
| Identity tagline | Cloud & Platform Engineer · Azure · IaC · DevOps | Unifies hybrid identity from canvas + plan + resume |
| Component library | Stack-pure | @maber/ui confirmed orphaned (4 files, 0 imports); promote later if real duplication emerges |
| Light mode | Deferred | Dark ships faster; cyan loses contrast in light mode |
| GhDashboard data | Server-side, GitHub PAT | Avoids rate limit, eliminates jogruber.de dep, supply-chain hygiene |
| Bear monitor anim | Deferred | Positioning over PNG monitor is finicky |
| Ops tile | Removed | Mocked uptime is credibility risk |
| Extra routes | None for v1 | Keep spec lean; add when content exists |
| Section order | about → work → now → skills → contact | Canvas wins; /now after /work signals "actively building" |
| Skills grouping | Cloud / IaC / CI-CD / Observability / Security / Languages | Matches resume strengths; keyword-rich for ATS |
| Mermaid rendering | Live, lazy-loaded | Diagrams stay in sync with source; don't block initial render |
| Code highlighting | Shiki, SSR-safe | No client JS needed; matches token system |
| Branch strategy | feature/portfolio-redesign → main | Mirrors PCPC redesign |
| Testing gates | Section 10.1 pattern | Proven across 11 phases on PCPC |

---

## 14. Out of scope (explicitly)

To prevent scope creep, these are explicitly *not* part of v1:

- Light mode toggle
- Blog or `/writing` route
- `/uses` page (tools, gear)
- 404 page with personality
- Analytics (any kind)
- Comment system
- RSS feed
- i18n / localization
- AMP variants
- PWA / service worker
- Print stylesheet
- Browser extension companion

Each can be its own future ticket. Resist the urge to scope-creep them in.

---

## 15. Glossary

For consistency in implementation chats:

| Term | Definition |
|---|---|
| **Hero** | The first section of the main page (`#about` anchor) — bear image, name, tagline, CTAs, GhDashboard |
| **Proof strip** | NOT a separate section in this spec — GhDashboard *is* the proof |
| **Deep-dive** | A `/projects/[slug]` page rendering the 5-section template |
| **Decision card** | An expandable Q/A card in deep-dive Section 4 |
| **Code highlight** | An annotated snippet in deep-dive Section 5 |
| **Token** | A CSS custom property in `tokens.css` |
| **Module** (in GhDashboard context) | One of the four GhDashboard sub-cards: HeaderRow, ContribHeatmap, TopRepos, RecentActivity, LanguagesBar |
| **Phase** | One of the 5 implementation chunks in Section 9 — each ships independently |
| **Gate** | A pre-merge check (build or smoke test) per Section 10 |

---

## 16. Quick start for future sessions

When opening a fresh chat to continue work, paste this snippet:

> Continuing the portfolio redesign from `Portfolio_Redesign_Spec.md`. Current state: Phase [N] [in progress / complete]. Next task: [specific item from Phase N+1]. Branch: `feature/portfolio-redesign`. Repo: `Abernaughty/maber-web` → `apps/portfolio`.

This anchors the next chat to the spec without re-litigating decisions.