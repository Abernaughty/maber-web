/**
 * Track which section is currently in view for the Nav scroll-spy.
 *
 * Uses a single IntersectionObserver against all section elements at once.
 * The "active" section is the one whose top edge is closest to (but past) the
 * sticky-header bottom — i.e., the section the user is reading right now.
 *
 * Returns reactive Svelte 5 state. Components destructure `active` and bind it
 * directly into their templates; updates flow through automatically.
 *
 * Convention: every section element renders with `id="<section.id>"` and
 * data-section attribute matches one of the SECTION_IDS strings.
 */

import { browser } from '$app/environment';
import { onMount } from 'svelte';

export interface ActiveSectionStore {
	/** The id of the section currently in view, or null before first paint. */
	readonly active: string | null;
}

export function useActiveSection(sectionIds: readonly string[]): ActiveSectionStore {
	let active = $state<string | null>(null);

	onMount(() => {
		if (!browser) return;

		// Trigger the spy when a section's top edge crosses ~25% from the top
		// of the viewport. rootMargin pushes the trigger line down past the
		// sticky shell (~89px) so headings register as "active" right when
		// they reach the readable area, not when they enter the viewport.
		const observer = new IntersectionObserver(
			(entries) => {
				// Multiple sections can overlap during scroll; pick the one
				// closest to the trigger line.
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort(
						(a, b) =>
							Math.abs(a.boundingClientRect.top) -
							Math.abs(b.boundingClientRect.top)
					);
				if (visible.length > 0) {
					active = visible[0].target.id;
				}
			},
			{
				rootMargin: '-89px 0px -60% 0px',
				threshold: [0, 0.25, 0.5, 0.75, 1]
			}
		);

		const targets = sectionIds
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);
		targets.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	});

	return {
		get active() {
			return active;
		}
	};
}
