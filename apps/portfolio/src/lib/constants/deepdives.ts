/**
 * Deep-dive case study content, one entry per slug in projects.ts.
 *
 * Spec §7 lays out the 5-section template:
 *   1. 30-second pitch (title + summary | metadata block)
 *   2. Live demo button
 *   3. Architecture (Mermaid diagram + paragraph)
 *   4. Decisions worth reading (3–5 expandable Q/A cards)
 *   5. Code highlights (2–3 annotated snippets)
 *
 * PCPC is the flagship — real Q/A and real code snippets that demonstrate
 * judgment. Blackjack and portfolio are kept lighter on purpose so the
 * shape is reusable but readers immediately know which one is the heavy
 * one to read.
 *
 * Mermaid source is a string the client renders lazily; Shiki renders the
 * code blocks server-side for zero client highlighting cost.
 */

import { PROJECTS } from './projects';

export interface DeepDiveMetadata {
	type: string;
	year: string;
	stack: string;
	status: string;
	role: string;
}

export interface CodeSnippet {
	/** Short title naming what the snippet does. */
	title: string;
	/** One-sentence "why this is interesting" caption. */
	caption: string;
	/** Shiki language identifier — `typescript`, `terraform`, `jsonc`, etc. */
	language: string;
	/** Raw source text. Do not pre-highlight — Shiki runs server-side. */
	code: string;
	/** Optional "view full file on github →" link. */
	sourceUrl?: string;
}

export interface DecisionEntry {
	question: string;
	answer: string;
}

export interface DeepDive {
	slug: string;
	number: string;
	title: string;
	/** ~3-sentence pitch paragraph for §1 left column. */
	summary: string;
	metadata: DeepDiveMetadata;
	demo: {
		liveUrl: string;
		liveDomain: string;
		sourceUrl: string;
	} | null;
	architecture: {
		/** Mermaid source, rendered lazily on the client. */
		diagram: string;
		paragraph: string;
	};
	decisions: DecisionEntry[];
	codeHighlights: CodeSnippet[];
}

const PCPC: DeepDive = {
	slug: 'pcpc',
	number: '01.',
	title: 'Pokémon Card Price Checker',
	summary:
		'A full-stack Pokémon card pricing app built on Azure with a layered cache spanning three storage tiers — IndexedDB on the client, Cosmos DB Serverless on the server, and Scrydex as the origin. Each tier has independent staleness detection and refresh logic. Infrastructure is managed as 7 Terraform modules so a typo in one concern can\'t blow up another.',
	metadata: {
		type: 'Full-stack · Cloud',
		year: '2026',
		stack:
			'SvelteKit · TypeScript · Azure Functions · Cosmos DB · API Management · Terraform',
		status: 'Live · Active development',
		role: 'Solo · Architecture, IaC, frontend, ops'
	},
	demo: {
		liveUrl: 'https://pcpc.maber.io',
		liveDomain: 'pcpc.maber.io',
		sourceUrl: 'https://github.com/Abernaughty/PCPC'
	},
	architecture: {
		diagram: `flowchart LR
  C["Browser<br/>IndexedDB cache"]
  APIM["Azure API Management<br/>rate limit · edge cache"]
  F["Azure Functions<br/>SvelteKit endpoints"]
  CDB[("Cosmos DB Serverless<br/>warm tier")]
  SDX["Scrydex API<br/>origin"]

  C -->|hot| C
  C -->|miss| APIM
  APIM --> F
  F -->|warm| CDB
  F -->|cold| SDX
  SDX --> F
  F --> APIM
  APIM --> C`,
		paragraph:
			'A request for a price first hits the browser\'s IndexedDB cache. On miss, it goes to API Management, which enforces per-consumer rate limits and serves an edge-cached response when available. Cache miss falls through to a SvelteKit-on-Azure-Functions handler that reads warm data from Cosmos DB Serverless. A cold miss reaches Scrydex; the response writes back through every tier on its way home. Each tier\'s TTL is independently tunable so the hot/warm boundary moves with traffic shape rather than being locked at deploy time.'
	},
	decisions: [
		{
			question: 'Why Cosmos DB Serverless over standard?',
			answer:
				'Read traffic is bursty and unpredictable. Standard\'s RU/s provisioning was overpaying for idle. Serverless is pay-per-RU, scales to zero between traffic spikes, and the cold-start overhead is acceptable for a non-realtime app.'
		},
		{
			question: 'Why API Management instead of direct Function calls?',
			answer:
				'Three reasons — rate limiting per consumer, response caching at the edge, and a stable contract surface that decouples client versioning from backend. APIM also gives me a single point for adding auth later without touching every Function.'
		},
		{
			question: 'Why Terraform with 7 modules instead of one big config?',
			answer:
				'Blast radius. A typo in a monolithic config can wipe production. Modules let me scope `terraform plan` to a single concern (networking, data, compute) and review changes in isolation. They\'re also reusable across environments — the same module powers dev and prod with different variable inputs.'
		},
		{
			question: 'Why a DevContainer with a pre-built ACR image?',
			answer:
				'Onboarding. New machine setup went from "install Node, pnpm, Azure CLI, Terraform, Bicep, configure tokens" to "open in DevContainer." Fifteen minutes to sixty seconds. The image is versioned alongside the code so old branches always have the toolchain they were built against.'
		},
		{
			question: 'Why Svelte runes instead of stores for state?',
			answer:
				'Runes are component-scoped reactive state that survives across renders without store-subscription boilerplate. For a small app with localized state, runes have lower ceremony than the store pattern. Stores stay appropriate for cross-component shared state — see `pricing.svelte.ts` for that case.'
		}
	],
	codeHighlights: [
		{
			title: 'Boundary normalization for the Scrydex API',
			caption:
				'snake_case → camelCase happens at exactly one place — every layer above this works in the app\'s native shape, eliminating an entire class of casing bugs.',
			language: 'typescript',
			code: `export function mapPaginatedResponse<T, U>(
  raw: ScrydexPaginated<T>,
  mapItem: (item: T) => U
): Paginated<U> {
  return {
    items: raw.data.map(mapItem),
    pageInfo: {
      hasNextPage: raw.has_more,
      nextCursor: raw.next_cursor ?? null,
      totalCount: raw.total_count
    }
  };
}`,
			sourceUrl:
				'https://github.com/Abernaughty/PCPC/blob/main/src/lib/api/scrydex/normalize.ts'
		},
		{
			title: 'Modular Terraform composition',
			caption:
				'Seven modules wired with explicit `depends_on` so blast radius is scoped per concern. Network changes don\'t need to think about Cosmos DB; data changes don\'t need to think about APIM.',
			language: 'terraform',
			code: `module "network" {
  source = "./modules/network"
  prefix = local.prefix
  tags   = local.tags
}

module "data" {
  source        = "./modules/data"
  prefix        = local.prefix
  subnet_id     = module.network.private_subnet_id
  tags          = local.tags
  depends_on    = [module.network]
}

module "compute" {
  source           = "./modules/compute"
  prefix           = local.prefix
  cosmos_endpoint  = module.data.cosmos_endpoint
  subnet_id        = module.network.compute_subnet_id
  tags             = local.tags
  depends_on       = [module.data]
}

module "apim" {
  source         = "./modules/apim"
  prefix         = local.prefix
  function_url   = module.compute.function_url
  tags           = local.tags
}`,
			sourceUrl:
				'https://github.com/Abernaughty/PCPC/blob/main/infra/main.tf'
		},
		{
			title: 'DevContainer with pre-built ACR image',
			caption:
				'The toolchain is versioned alongside the code. Checking out a branch from six months ago still gets the exact Terraform/Bicep/CLI versions it was built against.',
			language: 'jsonc',
			code: `{
  "name": "pcpc",
  "image": "maberacr.azurecr.io/devcontainers/pcpc:1.4.0",
  "features": {
    "ghcr.io/devcontainers/features/docker-outside-of-docker:1": {}
  },
  "postCreateCommand": "pnpm install --frozen-lockfile && pnpm prepare",
  "remoteEnv": {
    "AZURE_CONFIG_DIR": "\${containerWorkspaceFolder}/.azure"
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-azurefunctions",
        "hashicorp.terraform",
        "svelte.svelte-vscode"
      ]
    }
  }
}`,
			sourceUrl:
				'https://github.com/Abernaughty/PCPC/blob/main/.devcontainer/devcontainer.json'
		}
	]
};

const BLACKJACK: DeepDive = {
	slug: 'blackjack',
	number: '02.',
	title: 'Blackjack',
	summary:
		'Vegas-rules Blackjack with persistent balance tracking, built twice in two different stacks. The Python/Tkinter version was a forcing function for learning a stateful GUI primitive; the browser port is plain DOM + CSS to prove the same gameplay loop without a framework.',
	metadata: {
		type: 'Game · Two stacks',
		year: '2025',
		stack: 'Python · Tkinter · JavaScript · HTML · CSS',
		status: 'Live · Maintained',
		role: 'Solo · Game logic, UI, persistence'
	},
	demo: {
		liveUrl: 'https://blackjack.maber.io',
		liveDomain: 'blackjack.maber.io',
		sourceUrl: 'https://github.com/Abernaughty/blackjack'
	},
	architecture: {
		diagram: `flowchart TB
  Engine["Game engine<br/>shoe · hand · settle"]
  PyUI["Tkinter UI<br/>desktop"]
  WebUI["DOM + CSS UI<br/>browser"]
  LS[("Local persistence<br/>balance + settings")]

  Engine --> PyUI
  Engine --> WebUI
  PyUI --> LS
  WebUI --> LS`,
		paragraph:
			'Both implementations share the same core engine shape — a shoe of N decks, a hand evaluator that handles soft 17, and a settlement function. The UI layer is the only thing that changes between desktop and browser. Balance and settings persist locally per implementation (file on Tkinter, localStorage in the browser) so neither version needs a backend.'
	},
	decisions: [
		{
			question: 'Why build it twice instead of porting once?',
			answer:
				'The point was to learn two GUI primitives, not just to ship one game. Building it cold in Tkinter and again in plain JS forced me to keep the engine engine and the UI UI — the parts that didn\'t need to change between stacks didn\'t change.'
		},
		{
			question: 'Why no framework for the browser version?',
			answer:
				'The whole game state fits in one object. Reaching for a framework would have added more ceremony than logic. Plain `addEventListener` + a single render function makes every state transition explicit, which is also nicer for a learning artifact.'
		},
		{
			question: 'Why dealer-stands-on-soft-17?',
			answer:
				'It\'s the player-friendlier rule (S17), which keeps the game beatable for casual sessions. Was tempted by H17 for a marginally more interesting decision tree on the dealer side, but ultimately picked S17 because it\'s the one most casinos still use on the strip.'
		}
	],
	codeHighlights: [
		{
			title: 'Hand value handling soft aces',
			caption:
				'Treats aces as 11 by default, then demotes them to 1 only as needed to keep the hand under 22. Same logic powers both the player and dealer evaluators.',
			language: 'javascript',
			code: `function handValue(cards) {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}`,
			sourceUrl:
				'https://github.com/Abernaughty/blackjack/blob/main/web/src/engine.js'
		}
	]
};

const PORTFOLIO_DEEPDIVE: DeepDive = {
	slug: 'portfolio',
	number: '03.',
	title: 'This portfolio',
	summary:
		'A redesign of dev.maber.io into the Engineer\'s Desk — terminal-forward, dark-only, cyan-accented. The GhDashboard replaces the usual static "stats strip" with live GitHub data fetched server-side, eliminating client-side rate limits and keeping the token off the page. Self-hosted variable fonts, A+ security headers target.',
	metadata: {
		type: 'Static site · Cloud-hosted',
		year: '2026',
		stack: 'SvelteKit 2 · Svelte 5 · TypeScript · Tailwind 4 · Vercel',
		status: 'Active redesign on feature branch',
		role: 'Solo · Design, build, deploy'
	},
	demo: {
		liveUrl: 'https://dev.maber.io',
		liveDomain: 'dev.maber.io',
		sourceUrl: 'https://github.com/Abernaughty/maber-web'
	},
	architecture: {
		diagram: `flowchart LR
  Visitor["Browser"]
  Vercel["Vercel Edge<br/>1h cache"]
  SK["SvelteKit load<br/>+page.server.ts"]
  GH["GitHub GraphQL"]
  GHE["GitHub Events REST"]

  Visitor --> Vercel
  Vercel -->|miss| SK
  SK --> GH
  SK --> GHE
  GH --> SK
  GHE --> SK
  SK --> Vercel
  Vercel --> Visitor`,
		paragraph:
			'A request for the homepage hits Vercel\'s edge first; on hit the cached HTML returns immediately. Cache miss runs `+page.server.ts`, which issues one GraphQL query for user/repo/contribution data and one REST call for the public events feed in parallel. The PAT lives in Vercel env vars and never reaches the client. Edge cache holds the response for an hour so traffic is decoupled from GitHub\'s rate limit.'
	},
	decisions: [
		{
			question: 'Why server-side GitHub data instead of a client widget?',
			answer:
				'Three reasons: client-side hits the unauthenticated 60-req/hour limit fast, the third-party `jogruber.de` heatmap service was a supply-chain risk for a defense-sector audience, and a token in client code is a token leaked. Server-side keeps the token in Vercel env, the response is edge-cached, and the visible markup is fully indexable.'
		},
		{
			question: 'Why dark-mode-only?',
			answer:
				'Engineer\'s Desk is built around the cyan accent on near-black, which loses contrast in light mode. A two-mode build was twice the work for a brand that wouldn\'t be as strong. PCPC made the same call. Light mode stays parked in spec §11 — revisit only if there\'s a real reason.'
		},
		{
			question: 'Why Pattern B styling (CSS vars + scoped <style>) over Tailwind utilities?',
			answer:
				'Matches PCPC. Tokens in `tokens.css` are explicit; component styling lives next to the markup that uses it. Tailwind handles structural utilities (flex, grid, spacing) so the visual tokens stay in one place rather than spreading across magic class names.'
		}
	],
	codeHighlights: [
		{
			title: 'Discriminated GitHub fetch result',
			caption:
				'Page must always render. `fetchGithubData()` returns `{ ok: true, data }` or `{ ok: false, error }` — never throws. Components fall back to the existing skeleton render path on `null` data.',
			language: 'typescript',
			code: `export type GhFetchResult =
  | { ok: true; data: GhDashboardData }
  | { ok: false; error: string };

export async function fetchGithubData(): Promise<GhFetchResult> {
  const token = env.GITHUB_PAT;
  if (!token) return { ok: false, error: 'GITHUB_PAT not set' };

  try {
    const [graphqlRes, eventsRes] = await Promise.all([
      fetchGraphql(token),
      fetchEvents(token)
    ]);
    if (!graphqlRes.ok) {
      return { ok: false, error: \`HTTP \${graphqlRes.status}\` };
    }
    return { ok: true, data: shapeData(graphqlRes.body, eventsRes.body) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}`,
			sourceUrl:
				'https://github.com/Abernaughty/maber-web/blob/feature/portfolio-redesign/apps/portfolio/src/lib/server/github.ts'
		}
	]
};

const ENTRIES: readonly DeepDive[] = [PCPC, BLACKJACK, PORTFOLIO_DEEPDIVE];

export const DEEPDIVES_BY_SLUG: Readonly<Record<string, DeepDive>> =
	Object.fromEntries(ENTRIES.map((entry) => [entry.slug, entry]));

export const DEEPDIVE_SLUGS: readonly string[] = ENTRIES.map((entry) => entry.slug);

/**
 * Find the next deep-dive after `slug`, falling back to the first entry so
 * the "next →" footer link in spec §7 always has a target. Order matches
 * `PROJECTS` so the "next" sequence reads as the user expects.
 */
export function nextDeepDive(slug: string): DeepDive {
	const order = PROJECTS.map((p) => p.slug);
	const index = order.indexOf(slug);
	const nextSlug = order[(index + 1) % order.length];
	return DEEPDIVES_BY_SLUG[nextSlug];
}
