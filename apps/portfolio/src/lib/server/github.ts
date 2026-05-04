/**
 * Server-side GitHub data fetcher for the GhDashboard.
 *
 * Strategy (spec §4 Data layer):
 * - Single GraphQL request to api.github.com against the public-repo-metadata
 *   PAT in `GITHUB_PAT`. Token never leaves the server.
 * - Separate REST call to /users/:login/events/public for recent activity —
 *   the GraphQL contributions shape doesn't carry commit messages cleanly,
 *   and the events endpoint is what the GitHub UI itself uses for the
 *   "Recent activity" feed.
 * - All errors degrade gracefully — the page must always render. Caller
 *   inspects the `ok` discriminator and falls back to skeleton modules.
 *
 * Languages aggregation: walk top repos' language edges, sum bytes per
 * language, keep top 5, compute pct to one decimal.
 */

import { env } from '$env/dynamic/private';

const GITHUB_LOGIN = 'Abernaughty';
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_REST_BASE = 'https://api.github.com';
const USER_AGENT = 'maber-web-portfolio/1.0 (+https://dev.maber.io)';

// Curated featured repos for the Top Repos card. Order is preserved in the
// rendered list. Update this array to swap, add, or remove repos — query
// builder + response shape adapt automatically.
const FEATURED_REPOS = [
	'PCPC',
	'maber-web',
	'agent-dev',
	'code-vector-sync',
	'mom-cloud'
] as const;

export interface GhUser {
	login: string;
	repoCount: number;
	followerCount: number;
}

export interface GhContribDay {
	date: string;
	count: number;
	color: string;
}

export interface GhRepo {
	name: string;
	description: string | null;
	url: string;
	language: { name: string; color: string } | null;
}

export interface GhActivityEvent {
	type: 'PushEvent' | 'PullRequestEvent' | 'IssuesEvent' | 'CreateEvent';
	repo: string;
	message: string;
	createdAt: string;
}

export interface GhLanguage {
	name: string;
	color: string;
	bytes: number;
	pct: number;
}

export interface GhDashboardData {
	user: GhUser;
	contribDays: GhContribDay[];
	topRepos: GhRepo[];
	recentActivity: GhActivityEvent[];
	languages: GhLanguage[];
	fetchedAt: string;
}

export type GhFetchResult =
	| { ok: true; data: GhDashboardData }
	| { ok: false; error: string };

const REPO_FIELDS_FRAGMENT = /* GraphQL */ `
	fragment RepoFields on Repository {
		name
		description
		url
		primaryLanguage {
			name
			color
		}
		languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
			edges {
				size
				node {
					name
					color
				}
			}
		}
	}
`;

const FEATURED_REPO_LOOKUPS = FEATURED_REPOS.map(
	(name, i) =>
		`repo${i}: repository(owner: "${GITHUB_LOGIN}", name: "${name}") { ...RepoFields }`
).join('\n\t\t');

const QUERY = /* GraphQL */ `
	query GhDashboard($login: String!) {
		user(login: $login) {
			login
			followers {
				totalCount
			}
			repositories(privacy: PUBLIC) {
				totalCount
			}
			contributionsCollection {
				contributionCalendar {
					weeks {
						contributionDays {
							date
							contributionCount
							color
						}
					}
				}
			}
		}
		${FEATURED_REPO_LOOKUPS}
	}
	${REPO_FIELDS_FRAGMENT}
`;

interface RepoNode {
	name: string;
	description: string | null;
	url: string;
	primaryLanguage: { name: string; color: string } | null;
	languages: {
		edges: { size: number; node: { name: string; color: string | null } }[];
	};
}

type FeaturedReposResponse = Record<`repo${number}`, RepoNode | null>;

interface GraphqlResponse {
	data?: {
		user: {
			login: string;
			followers: { totalCount: number };
			repositories: { totalCount: number };
			contributionsCollection: {
				contributionCalendar: {
					weeks: {
						contributionDays: {
							date: string;
							contributionCount: number;
							color: string;
						}[];
					}[];
				};
			};
		};
	} & FeaturedReposResponse;
	errors?: { message: string }[];
}

interface RestEvent {
	type: string;
	created_at: string;
	repo: { name: string };
	payload: {
		commits?: { message: string }[];
		ref_type?: string;
		ref?: string | null;
		pull_request?: { title?: string; number: number };
		issue?: { title?: string; number: number };
		action?: string;
	};
}

export async function fetchGithubData(
	fetchImpl: typeof fetch = fetch
): Promise<GhFetchResult> {
	const token = env.GITHUB_PAT;
	if (!token) {
		return { ok: false, error: 'GITHUB_PAT env var not set' };
	}

	try {
		const [graphqlRes, eventsRes] = await Promise.all([
			fetchImpl(GITHUB_GRAPHQL_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					'User-Agent': USER_AGENT
				},
				body: JSON.stringify({
					query: QUERY,
					variables: { login: GITHUB_LOGIN }
				})
			}),
			fetchImpl(
				`${GITHUB_REST_BASE}/users/${GITHUB_LOGIN}/events/public?per_page=20`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/vnd.github+json',
						'X-GitHub-Api-Version': '2022-11-28',
						'User-Agent': USER_AGENT
					}
				}
			)
		]);

		if (!graphqlRes.ok) {
			return {
				ok: false,
				error: `GraphQL HTTP ${graphqlRes.status}: ${graphqlRes.statusText}`
			};
		}

		const json = (await graphqlRes.json()) as GraphqlResponse;
		if (json.errors?.length || !json.data) {
			return {
				ok: false,
				error: `GraphQL errors: ${json.errors?.map((e) => e.message).join('; ') ?? 'no data'}`
			};
		}

		const events = eventsRes.ok ? ((await eventsRes.json()) as RestEvent[]) : [];

		return {
			ok: true,
			data: shapeData(json.data, events)
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}

function shapeData(
	gql: NonNullable<GraphqlResponse['data']>,
	events: RestEvent[]
): GhDashboardData {
	const contribDays: GhContribDay[] = gql.user.contributionsCollection.contributionCalendar.weeks.flatMap(
		(week) =>
			week.contributionDays.map((day) => ({
				date: day.date,
				count: day.contributionCount,
				color: day.color
			}))
	);

	const repoNodes: RepoNode[] = FEATURED_REPOS.map((_, i) => gql[`repo${i}`]).filter(
		(node): node is RepoNode => node !== null && node !== undefined
	);

	const topRepos: GhRepo[] = repoNodes.map((repo) => ({
		name: repo.name,
		description: repo.description,
		url: repo.url,
		language: repo.primaryLanguage
	}));

	const languages = aggregateLanguages(repoNodes);
	const recentActivity = filterEvents(events);

	return {
		user: {
			login: gql.user.login,
			repoCount: gql.user.repositories.totalCount,
			followerCount: gql.user.followers.totalCount
		},
		contribDays,
		topRepos,
		recentActivity,
		languages,
		fetchedAt: new Date().toISOString()
	};
}

function aggregateLanguages(repos: RepoNode[]): GhLanguage[] {
	const totals = new Map<string, { bytes: number; color: string }>();

	for (const repo of repos) {
		for (const edge of repo.languages.edges) {
			const existing = totals.get(edge.node.name);
			if (existing) {
				existing.bytes += edge.size;
			} else {
				// Fall back to a neutral grey if GitHub doesn't have a color for
				// the language (rare — only some niche languages).
				totals.set(edge.node.name, {
					bytes: edge.size,
					color: edge.node.color ?? '#6e7681'
				});
			}
		}
	}

	const sumBytes = [...totals.values()].reduce((acc, l) => acc + l.bytes, 0);
	if (sumBytes === 0) return [];

	const top5 = [...totals.entries()]
		.sort((a, b) => b[1].bytes - a[1].bytes)
		.slice(0, 5);

	return top5.map(([name, { bytes, color }]) => ({
		name,
		color,
		bytes,
		pct: Math.round((bytes / sumBytes) * 1000) / 10
	}));
}

const ALLOWED_EVENT_TYPES = new Set([
	'PushEvent',
	'PullRequestEvent',
	'IssuesEvent',
	'CreateEvent'
]);

function filterEvents(events: RestEvent[]): GhActivityEvent[] {
	const out: GhActivityEvent[] = [];
	for (const ev of events) {
		if (!ALLOWED_EVENT_TYPES.has(ev.type)) continue;
		out.push({
			type: ev.type as GhActivityEvent['type'],
			repo: ev.repo.name,
			message: messageFor(ev),
			createdAt: ev.created_at
		});
		if (out.length >= 5) break;
	}
	return out;
}

function messageFor(ev: RestEvent): string {
	switch (ev.type) {
		case 'PushEvent': {
			const commit = ev.payload.commits?.[0]?.message ?? '';
			// Commits often have multi-line bodies; keep the subject only.
			return commit.split('\n', 1)[0];
		}
		case 'PullRequestEvent': {
			const pr = ev.payload.pull_request;
			if (!pr) return '';
			return pr.title ? `#${pr.number} ${pr.title}` : `#${pr.number}`;
		}
		case 'IssuesEvent': {
			const issue = ev.payload.issue;
			if (!issue) return '';
			return issue.title ? `#${issue.number} ${issue.title}` : `#${issue.number}`;
		}
		case 'CreateEvent':
			return ev.payload.ref_type === 'repository'
				? 'created repository'
				: `${ev.payload.ref_type ?? ''} ${ev.payload.ref ?? ''}`.trim();
		default:
			return '';
	}
}
