<script lang="ts">
	/**
	 * Reveal-on-scroll wrapper. Children render hidden + offset, then animate
	 * to visible when the wrapper enters the viewport. Used by sections and
	 * row groups for a subtle "page is alive as you scroll" feel without the
	 * gimmickiness of full parallax.
	 *
	 * Honors prefers-reduced-motion: skips the offset entirely and renders
	 * children visible from the start.
	 *
	 * Once revealed, the wrapper does not re-hide on scroll-up — content
	 * stays visible. This matches user expectations and avoids flicker.
	 */

	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Delay before transitioning, in ms. Useful for staggering siblings. */
		delay?: number;
		/** Offset distance children start from, in px. Default 16. */
		offset?: number;
	}

	const { children, delay = 0, offset = 16 }: Props = $props();

	let el: HTMLDivElement | undefined = $state(undefined);
	let visible = $state(false);

	onMount(() => {
		if (!browser || !el) return;

		// Reduced-motion users see content immediately; no observer needed.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			visible = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					if (delay > 0) {
						setTimeout(() => (visible = true), delay);
					} else {
						visible = true;
					}
					observer.disconnect();
				}
			},
			{
				rootMargin: '0px 0px -10% 0px',
				threshold: 0.1
			}
		);
		observer.observe(el);

		return () => observer.disconnect();
	});
</script>

<div
	bind:this={el}
	class="reveal"
	class:visible
	style:--reveal-offset="{offset}px"
>
	{@render children()}
</div>

<style>
	.reveal {
		opacity: 0;
		transform: translateY(var(--reveal-offset));
		transition:
			opacity var(--transition-normal),
			transform var(--transition-normal);
		will-change: opacity, transform;
	}

	.reveal.visible {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.reveal {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
