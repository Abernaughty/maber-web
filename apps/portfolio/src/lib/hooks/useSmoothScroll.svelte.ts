/**
 * Smooth-scroll to a section by id.
 *
 * Computes the offset so the target section's top lands just below the sticky
 * TopBar + Nav (33 + 56 = 89 px by default). Reads the values off CSS custom
 * properties so token tweaks stay in one place.
 *
 * Respects prefers-reduced-motion automatically because we delegate to
 * window.scrollTo with `behavior: 'smooth'`, and that's the contract the
 * browser already honors against the user's motion preference.
 */

import { browser } from '$app/environment';

function readPx(varName: string, fallback: number): number {
	if (!browser) return fallback;
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(varName)
		.trim();
	const parsed = Number.parseFloat(raw);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function smoothScrollTo(id: string): void {
	if (!browser) return;
	const target = document.getElementById(id);
	if (!target) return;

	const topbar = readPx('--topbar-height', 33);
	const nav = readPx('--nav-height', 56);
	// 8px breathing room so headings don't crowd the nav bottom edge.
	const offset = topbar + nav + 8;

	const top = target.getBoundingClientRect().top + window.scrollY - offset;
	window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Return a click handler that smooth-scrolls to the given anchor and
 * preventDefaults to keep the URL hash from jumping the scroll mid-flight.
 * Use as: `<a href="#work" onclick={smoothScrollHandler('work')}>`.
 */
export function smoothScrollHandler(id: string) {
	return (event: Event) => {
		event.preventDefault();
		smoothScrollTo(id);
		// Update URL hash without triggering browser scroll.
		if (browser && history.replaceState) {
			history.replaceState(null, '', `#${id}`);
		}
	};
}
