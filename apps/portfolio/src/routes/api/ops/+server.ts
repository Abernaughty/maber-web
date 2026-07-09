// src/routes/api/ops/+server.ts
//
// Server-side proxy for the "OPS" panel on the portfolio.
// Runs on Vercel (SvelteKit endpoint), holds VERCEL_TOKEN server-side, and
// returns a trimmed per-project deploy roster the browser can fetch same-origin.
//
// SETUP
//   1. Create a Vercel token: https://vercel.com/account/tokens (scope: read-only is fine)
//   2. Add it as an env var in your Vercel project:  VERCEL_TOKEN=xxxxx
//      (and VERCEL_TEAM_ID=team_xxx only if these projects live under a team)
//   3. Fill in the PROJECTS map below with your real Vercel project IDs.
//      Find an id at: Project → Settings → General → "Project ID".
//
// Response shape:
//   { projects: [{ key, label, provider, state, ageMs, branch, sha }], ts }

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// The roster shown in the panel, in display order.
// `id` is the Vercel Project ID. `provider` is just a display tag.
const PROJECTS = [
	{ key: 'pcpc',      label: 'pcpc',      provider: 'AZURE + VERCEL', id: 'prj_k26pGexXyOzihAIlIWPYsBL67vXT' },
	{ key: 'portfolio', label: 'portfolio', provider: 'VERCEL',         id: 'prj_jrbxL2gizog7PfzsJnMCicvpvlw0' },
	{ key: 'blackjack', label: 'blackjack', provider: 'VERCEL',         id: 'prj_hZJklupA6QW8I6g9XAitJ924Ariu' },
    { key: 'landing',   label: 'landing',   provider: 'VERCEL',         id: 'prj_oNvaivo6P0631CVuM5jgH72gAqhQ' },
];

const VERCEL_API = 'https://api.vercel.com';

type OpsProject = {
	key: string;
	label: string;
	provider: string;
	state: 'READY' | 'BUILDING' | 'ERROR' | 'QUEUED' | 'CANCELED' | 'UNKNOWN';
	ageMs: number | null;
	branch: string | null;
	sha: string | null;
};

async function latestDeployment(projectId: string, token: string, teamId?: string) {
	const qs = new URLSearchParams({ projectId, limit: '1' });
	if (teamId) qs.set('teamId', teamId);

	const res = await fetch(`${VERCEL_API}/v6/deployments?${qs}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error(`vercel ${res.status}`);
	const data = await res.json();
	return data?.deployments?.[0] ?? null;
}

export const GET: RequestHandler = async () => {
	const token = process.env.VERCEL_TOKEN;
	const teamId = process.env.VERCEL_TEAM_ID || undefined;

	if (!token) {
		return json({ projects: [], ts: Date.now(), error: 'no-token' }, { status: 200 });
	}

	const projects: OpsProject[] = await Promise.all(
		PROJECTS.map(async (p): Promise<OpsProject> => {
			try {
				const d = await latestDeployment(p.id, token, teamId);
				const created = d?.created ?? d?.createdAt ?? null;
				return {
					key: p.key,
					label: p.label,
					provider: p.provider,
					state: (d?.state ?? d?.readyState ?? 'UNKNOWN') as OpsProject['state'],
					ageMs: created ? Date.now() - created : null,
					branch: d?.meta?.githubCommitRef ?? null,
					sha: (d?.meta?.githubCommitSha ?? '').slice(0, 6) || null,
				};
			} catch {
				return {
					key: p.key,
					label: p.label,
					provider: p.provider,
					state: 'UNKNOWN',
					ageMs: null,
					branch: null,
					sha: null,
				};
			}
		}),
	);

	// Cache at the edge for 5 min so we don't hammer the Vercel API.
	return json(
		{ projects, ts: Date.now() },
		{ headers: { 'cache-control': 'public, max-age=0, s-maxage=300' } },
	);
};