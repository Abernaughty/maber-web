/**
 * Featured projects for the Work section.
 *
 * The lineup decision (whether to keep Blackjack or replace with one of
 * agent-dev / code-vector-sync / langchain-price-agent) is deferred to
 * Phase 2 per spec §11. The current three are baseline content from v1
 * with refreshed copy for the Engineer's Desk identity.
 *
 * Each entry includes both a short blurb (collapsed-row state) and a longer
 * description (expanded state). `slug` matches the deep-dive route at
 * `/projects/[slug]` — Phase 3 builds those pages.
 */

export interface Project {
	/** Two-digit number prefix shown in the row, e.g. "01.". */
	number: string;
	/** Stable slug; matches deep-dive route. */
	slug: string;
	/** Display title. */
	title: string;
	/** Year primary work happened. */
	year: string;
	/** One-line collapsed-state blurb. */
	blurb: string;
	/** Multi-sentence expanded-state description. */
	description: string;
	/** Stack pill labels — keep short, lowercase. */
	stack: readonly string[];
	/** Live demo URL (omit if no public demo). */
	liveUrl?: string;
	/** Source repo URL. */
	sourceUrl?: string;
	/** Optional thumbnail at /images/projects/{slug}.png. */
	thumbnail?: string;
}

export const PROJECTS: readonly Project[] = [
	{
		number: '01.',
		slug: 'pcpc',
		title: 'Pokémon Card Price Checker',
		year: '2026',
		blurb:
			'Layered-cache price lookup for Pokémon cards across three storage tiers.',
		description:
			'Full-stack pricing app on Azure. Scrydex is the origin; Cosmos DB Serverless holds warm data; the client caches hot data in IndexedDB. Each tier has independent staleness detection. Routed through Azure API Management for rate limiting and edge caching. Infrastructure managed as 7 Terraform modules to keep blast radius scoped.',
		stack: [
			'sveltekit',
			'typescript',
			'azure functions',
			'cosmos db',
			'redis',
			'apim',
			'terraform',
			'azure devops'
		],
		liveUrl: 'https://pcpc.maber.io',
		sourceUrl: 'https://github.com/Abernaughty/PCPC',
		thumbnail: '/images/projects/pcpc.png'
	},
	{
		number: '02.',
		slug: 'blackjack',
		title: 'Blackjack',
		year: '2025',
		blurb: 'Vegas-rules Blackjack — Python desktop and browser implementations.',
		description:
			'Cross-platform Blackjack with persistent balance tracking and authentic Vegas rules (split, double-down, dealer-stands-on-soft-17). Built twice — once in Python with Tkinter to learn the GUI primitives, then ported to vanilla JS for the browser version. No frameworks on the web side, just clean DOM + CSS.',
		stack: ['python', 'tkinter', 'javascript', 'html', 'css'],
		liveUrl: 'https://blackjack.maber.io',
		sourceUrl: 'https://github.com/Abernaughty/blackjack',
		thumbnail: '/images/projects/blackjack.png'
	},
	{
		number: '03.',
		slug: 'portfolio',
		title: 'This portfolio',
		year: '2026',
		blurb: 'Engineer\'s Desk redesign — terminal aesthetic, server-side GitHub data.',
		description:
			'A redesign of dev.maber.io with terminal-forward visuals and a server-side GhDashboard that replaces the usual static "stats strip" with live GitHub data via GraphQL. Self-hosted variable fonts, dark-only by design, A+ security headers target. Built with SvelteKit 2 + Svelte 5 runes + TailwindCSS 4.',
		stack: [
			'sveltekit',
			'svelte 5',
			'typescript',
			'tailwindcss 4',
			'vercel',
			'github graphql'
		],
		liveUrl: 'https://dev.maber.io',
		sourceUrl: 'https://github.com/Abernaughty/maber-web',
		thumbnail: '/images/projects/portfolio.png'
	}
] as const;
