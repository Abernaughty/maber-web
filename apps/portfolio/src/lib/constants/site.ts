/**
 * Site-wide meta — single source of truth for absolute URLs, the canonical
 * description, and the OG card asset. Consumed by +layout.svelte's global
 * sharing meta + the sitemap.xml route.
 *
 * Keep `SITE_URL` aligned with the locked production URL (spec §0.5).
 */

import { NAME, TAGLINE } from './identity';

/** Canonical production origin. Used for absolute URLs in OG/sitemap/JSON-LD. */
export const SITE_URL = 'https://dev.maber.io';

/** Title used as `og:site_name` and the suffix of every page's <title>. */
export const SITE_NAME = `${NAME} — ${TAGLINE}`;

/**
 * Default description — used when a page hasn't supplied its own. Long enough
 * to fill the typical 155–160 char SERP snippet without trailing off.
 */
export const SITE_DESCRIPTION =
	'Mike Abernathy — Cloud & Platform Engineer. Azure, Terraform, Kubernetes, SvelteKit. Building cloud infrastructure end to end from Colorado Springs.';

/** OG card path; resolved to an absolute URL in the head. 1200×630 PNG. */
export const OG_IMAGE_PATH = '/images/og-card.png';
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** External profile URLs — the JSON-LD Person schema's `sameAs` array. */
export const SAME_AS = [
	'https://github.com/Abernaughty',
	'https://www.linkedin.com/in/michael-abernathy-674a96217/'
] as const;

/**
 * Resolve a possibly-relative path to an absolute URL on this site.
 * Pass-throughs already-absolute URLs unchanged.
 */
export function absoluteUrl(pathOrUrl: string): string {
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
	return `${SITE_URL}${path}`;
}
