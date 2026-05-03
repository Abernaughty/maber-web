/**
 * Slug-based loader for `/projects/[slug]` deep-dive pages.
 *
 * Looks up the deep-dive entry by slug, 404s on miss, and pre-renders
 * each code snippet via Shiki so the page ships zero highlighting JS.
 * Mermaid diagrams stay client-side (lazy-loaded by ArchitectureSection).
 *
 * Spec §6 (deep-dive routes), §7 §5 (Shiki SSR).
 */

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	DEEPDIVES_BY_SLUG,
	DEEPDIVE_SLUGS,
	nextDeepDive
} from '$lib/constants/deepdives';
import { highlight } from '$lib/server/shiki';

export const prerender = 'auto';

export const entries = () => DEEPDIVE_SLUGS.map((slug) => ({ slug }));

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const deepdive = DEEPDIVES_BY_SLUG[params.slug];
	if (!deepdive) {
		throw error(404, `No deep-dive for project '${params.slug}'`);
	}

	const codeHtml = await Promise.all(
		deepdive.codeHighlights.map((snippet) =>
			highlight(snippet.code, snippet.language)
		)
	);

	setHeaders({
		'cache-control': 'public, max-age=3600, s-maxage=3600'
	});

	return {
		deepdive,
		next: nextDeepDive(deepdive.slug),
		codeHtml
	};
};
