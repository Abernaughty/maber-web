/**
 * Typewriter effect — reveals a target string one character at a time.
 *
 * Returns reactive state for the currently visible substring and a `done`
 * flag. Components compose this with the Caret primitive to render a
 * blinking cursor that follows the type position and parks at the end.
 *
 * Honors `prefers-reduced-motion`: if the user has it set, the full string
 * is revealed instantly with `done = true`.
 *
 * Usage:
 *   const t = useTyping('hello world', { charDelay: 24, startDelay: 200 });
 *   // ...
 *   <span>{t.text}</span><Caret blinking={t.done} />
 */

import { browser } from '$app/environment';
import { onMount } from 'svelte';

export interface TypingOptions {
	/** Milliseconds between character reveals. Default 24ms (~40 cps). */
	charDelay?: number;
	/** Milliseconds to wait before starting. Default 0. Useful for staggering. */
	startDelay?: number;
	/** Called once the full string is revealed. */
	onComplete?: () => void;
}

export interface TypingStore {
	readonly text: string;
	readonly done: boolean;
}

function prefersReducedMotion(): boolean {
	if (!browser) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTyping(target: string, options: TypingOptions = {}): TypingStore {
	const { charDelay = 24, startDelay = 0, onComplete } = options;

	let text = $state('');
	let done = $state(false);

	onMount(() => {
		if (!browser) return;

		// Reduced-motion users get the full string instantly. Don't waste
		// their time on character-by-character animation.
		if (prefersReducedMotion()) {
			text = target;
			done = true;
			onComplete?.();
			return;
		}

		let i = 0;
		let interval: ReturnType<typeof setInterval> | undefined;
		const startTimeout = setTimeout(() => {
			interval = setInterval(() => {
				i += 1;
				text = target.slice(0, i);
				if (i >= target.length) {
					if (interval) clearInterval(interval);
					done = true;
					onComplete?.();
				}
			}, charDelay);
		}, startDelay);

		return () => {
			clearTimeout(startTimeout);
			if (interval) clearInterval(interval);
		};
	});

	return {
		get text() {
			return text;
		},
		get done() {
			return done;
		}
	};
}
