/**
 * Server load for the main page.
 *
 * Fetches GhDashboard data on the server and edge-caches the response for
 * one hour per spec §4 Caching. The page must always render — fetch
 * failures pass through as `gh.ok === false` and components fall back to
 * skeletons.
 */

import type { PageServerLoad } from './$types';
import { fetchGithubData, type GhFetchResult } from '$lib/server/github';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	const gh: GhFetchResult = await fetchGithubData(fetch);

	setHeaders({
		'cache-control': 'public, max-age=3600, s-maxage=3600'
	});

	return { gh };
};
