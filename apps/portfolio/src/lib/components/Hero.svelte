<script lang="ts">
	/**
	 * Hero section — the visual centerpiece of the page.
	 *
	 * Layers (back to front):
	 *   1. <picture> with AVIF → WebP → PNG fallback for the bear image.
	 *      Uses fixed positioning + transform-based "fixed" effect so iOS
	 *      Safari (which ignores `background-attachment: fixed`) still
	 *      renders the parallax-style stay-put behavior.
	 *   2. Vertical gradient veil for legibility.
	 *   3. Subtle horizontal scanlines for retro-terminal feel.
	 *   4. Content stack — terminal-style typed lines, name, CTAs, and the
	 *      GhDashboard skeleton.
	 *
	 * Typed sequence runs once on mount, staggered. Reduced-motion users get
	 * the full text instantly via useTyping's built-in handling.
	 *
	 * Spec: §3 Hero.
	 */

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import {
		NAME_FIRST,
		NAME_LAST,
		TAGLINE,
		STACK_LINE,
		STORY_LINE
	} from '$lib/constants/identity';
	import { useTyping } from '$lib/hooks/useTyping.svelte';
	import { smoothScrollHandler } from '$lib/hooks/useSmoothScroll.svelte';
	import Caret from './Caret.svelte';
	import TerminalPrompt from './TerminalPrompt.svelte';
	import GhDashboard from './GhDashboard/GhDashboard.svelte';
	import type { GhFetchResult } from '$lib/server/github';

	interface Props {
		/** Result of the server-side GitHub fetch — null is treated as failure. */
		gh?: GhFetchResult;
	}

	const { gh }: Props = $props();

	// Typed lines stagger so the sequence reads as a terminal session rather
	// than parallel streams. Story uses a slightly slower charDelay so the
	// narrative beat lands with weight rather than racing past.
	const tagline = useTyping(TAGLINE, { startDelay: 400, charDelay: 22 });
	const stack = useTyping(STACK_LINE, { startDelay: 1800, charDelay: 18 });
	const story = useTyping(STORY_LINE, { startDelay: 3400, charDelay: 20 });

	// Name reveal is not character-typed — it pops in cleanly at load. The
	// "$ whoami" prompt above it is part of the static layout.
	let nameVisible = $state(false);
	onMount(() => {
		if (!browser) return;
		// Sync the name fade-in with the start of the first typed line so the
		// hero feels like a coordinated reveal rather than independent pieces.
		const t = setTimeout(() => (nameVisible = true), 200);
		return () => clearTimeout(t);
	});
</script>

<section id="about" class="hero">
	<picture class="bg" aria-hidden="true">
		<source srcset="/images/bear-coding.avif" type="image/avif" />
		<source srcset="/images/bear-coding.webp" type="image/webp" />
		<img src="/images/bear-coding.png" alt="" />
	</picture>

	<div class="veil" aria-hidden="true"></div>
	<div class="scanlines" aria-hidden="true"></div>

	<div class="content">
		<div class="line whoami">
			<TerminalPrompt cmd="whoami" />
		</div>
		<h1 class="name" class:visible={nameVisible}>
			<span class="first">{NAME_FIRST}</span>
			<span class="last">{NAME_LAST}</span>
		</h1>

		<div class="line tagline-line">
			<TerminalPrompt cmd="cat /etc/about" />
			<span class="tagline">{tagline.text}</span>
			{#if !tagline.done}<Caret color="var(--text)" solid />{/if}
		</div>

		<div class="line stack-line">
			<TerminalPrompt cmd="ls ~/stack" />
			<span class="stack">{stack.text}</span>
			{#if stack.text.length > 0 && !stack.done}<Caret color="var(--text)" solid />{/if}
		</div>

		<div class="line story-line">
			<TerminalPrompt cmd="cat /etc/story" />
			<span class="story">{story.text}</span>
			{#if story.text.length > 0 && !story.done}<Caret color="var(--text)" solid />{/if}
		</div>

		<div class="ctas">
			<a class="cta primary" href="#work" onclick={smoothScrollHandler('work')}>
				./view_work.sh
			</a>
			<a class="cta ghost" href="#contact" onclick={smoothScrollHandler('contact')}>
				./contact.sh
			</a>
		</div>

		<div class="dashboard-wrap">
			<GhDashboard data={gh?.ok ? gh.data : null} status={gh?.ok ? 'live' : 'error'} />
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100vh;
		padding: calc(var(--topbar-height) + var(--nav-height) + var(--space-12))
			var(--section-pad-x) var(--section-pad-y);
		overflow: hidden;
		isolation: isolate;
	}

	/* The bear image stays fixed via position: fixed so the effect works on
	 * iOS Safari (which silently breaks background-attachment: fixed).
	 * Sized to cover the viewport, sits behind everything in the section. */
	.bg {
		position: fixed;
		inset: 0;
		z-index: -2;
		pointer-events: none;
	}

	.bg img,
	.bg :global(source) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.bg img {
		display: block;
	}

	/* Vertical dark gradient — lighter at top, much darker at bottom — gives
	 * legibility for the typed terminal text against the bear image. */
	.veil {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(
			180deg,
			rgba(10, 11, 10, 0.35) 0%,
			rgba(10, 11, 10, 0.85) 100%
		);
		pointer-events: none;
	}

	/* Horizontal scanlines — alternating 1px dark / 2px transparent rows at
	 * very low opacity. Adds CRT-terminal flavor without obscuring content. */
	.scanlines {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.18) 0px,
			rgba(0, 0, 0, 0.18) 1px,
			transparent 1px,
			transparent 3px
		);
		mix-blend-mode: multiply;
	}

	.content {
		position: relative;
		max-width: var(--layout-max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.line {
		font-family: var(--font-mono);
		font-size: var(--fs-base);
		line-height: var(--lh-snug);
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: var(--space-2);
		min-height: 1.5em;
	}

	.whoami {
		margin-bottom: calc(-1 * var(--space-2));
	}

	.name {
		font-family: var(--font-sans);
		font-size: var(--fs-hero-fluid);
		font-weight: var(--fw-black);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-tight);
		opacity: 0;
		transform: translateY(8px);
		transition: opacity var(--transition-normal),
			transform var(--transition-normal);
	}

	.name.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.first {
		color: var(--text);
	}

	.last {
		color: var(--accent);
		text-shadow: 0 0 24px rgba(34, 211, 238, 0.25);
		margin-left: 0.2em;
	}

	.tagline {
		color: var(--text);
		font-family: var(--font-mono);
	}

	.stack {
		color: var(--muted);
		font-family: var(--font-mono);
	}

	.story {
		color: var(--muted);
		font-family: var(--font-mono);
	}

	.ctas {
		display: inline-flex;
		gap: var(--space-3);
		flex-wrap: wrap;
		margin-top: var(--space-2);
	}

	.cta {
		font-family: var(--font-mono);
		font-size: var(--fs-base);
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		border: 1px solid var(--accent);
		transition: background-color var(--transition-fast),
			color var(--transition-fast),
			transform var(--transition-fast);
	}

	.cta.primary {
		background: var(--accent);
		color: var(--bg);
		font-weight: var(--fw-semibold);
	}

	.cta.primary:hover {
		background: transparent;
		color: var(--accent);
	}

	.cta.ghost {
		background: transparent;
		color: var(--accent);
	}

	.cta.ghost:hover {
		background: var(--accent-glow);
	}

	.dashboard-wrap {
		margin-top: var(--space-8);
	}

	@media (max-width: 720px) {
		.hero {
			padding: calc(var(--topbar-height) + var(--nav-height) + var(--space-8))
				var(--section-pad-x-mobile) var(--section-pad-y-mobile);
			gap: var(--space-4);
		}

		.last {
			display: block;
			margin-left: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.name {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
