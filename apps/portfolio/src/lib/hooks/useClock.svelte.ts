/**
 * Live wall clock for the Footer, formatted as `HH:MM:SS MST`.
 *
 * Ticks once per second on the client only (SSR returns the initial render
 * timestamp; the first client tick replaces it). Cleans up its interval on
 * component unmount.
 *
 * Returns Svelte 5 reactive state — destructure `time` and read it in the
 * template. Updates flow through automatically.
 */

import { browser } from '$app/environment';
import { onMount } from 'svelte';

export interface ClockStore {
	readonly time: string;
}

const TIMEZONE = 'America/Denver';
const FORMATTER = new Intl.DateTimeFormat('en-US', {
	timeZone: TIMEZONE,
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false
});

function formatNow(): string {
	return `${FORMATTER.format(new Date())} MST`;
}

export function useClock(): ClockStore {
	let time = $state(formatNow());

	onMount(() => {
		if (!browser) return;
		// Sync to the next whole second so the clock changes on the tick edge,
		// not at random sub-second offsets.
		const msUntilNextSecond = 1000 - (Date.now() % 1000);
		let interval: ReturnType<typeof setInterval> | undefined;
		const initial = setTimeout(() => {
			time = formatNow();
			interval = setInterval(() => {
				time = formatNow();
			}, 1000);
		}, msUntilNextSecond);

		return () => {
			clearTimeout(initial);
			if (interval) clearInterval(interval);
		};
	});

	return {
		get time() {
			return time;
		}
	};
}
