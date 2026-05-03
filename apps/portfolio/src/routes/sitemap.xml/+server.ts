/**
 * Dynamic sitemap. Enumerates the homepage and every deep-dive route from
 * `DEEPDIVE_SLUGS` so adding a project automatically updates the sitemap.
 *
 * Spec §6 (sitemap) + §9 Phase 5.
 */

import type { RequestHandler } from './$types';
import { SITE_URL } from '$lib/constants/site';
import { DEEPDIVE_SLUGS } from '$lib/constants/deepdives';

const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
	loc: string;
	lastmod: string;
	changefreq: 'weekly' | 'monthly' | 'yearly';
	priority: string;
}

function buildEntries(): SitemapEntry[] {
	const entries: SitemapEntry[] = [
		{
			loc: `${SITE_URL}/`,
			lastmod: TODAY,
			changefreq: 'weekly',
			priority: '1.0'
		}
	];

	for (const slug of DEEPDIVE_SLUGS) {
		entries.push({
			loc: `${SITE_URL}/projects/${slug}`,
			lastmod: TODAY,
			changefreq: 'monthly',
			priority: '0.8'
		});
	}

	return entries;
}

function renderXml(entries: SitemapEntry[]): string {
	const urls = entries
		.map(
			(e) =>
				`  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const GET: RequestHandler = () => {
	return new Response(renderXml(buildEntries()), {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};

export const prerender = true;
