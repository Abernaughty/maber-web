<script lang="ts">
	/**
	 * Main page composition.
	 *
	 * Phase 1 §4: Hero is real; the other four sections are placeholder
	 * anchors so Nav scroll-spy + Hero CTAs resolve. Real Work / Now /
	 * Skills / Contact sections land in Phase 1 §5.
	 *
	 * Spec: §3 Page structure.
	 */

	import { NAME, TAGLINE } from '$lib/constants/identity';
	import Hero from '$lib/components/Hero.svelte';
</script>

<svelte:head>
	<title>{NAME} — {TAGLINE}</title>
	<meta name="description" content={TAGLINE} />
</svelte:head>

<Hero />

<!--
	Placeholder anchor sections for Phase 1 §5. Each renders just enough to
	satisfy the Nav scroll-spy IntersectionObserver and the Hero CTAs.
	Replaced with real WorkSection / NowSection / SkillsSection /
	ContactSection components in subsequent commits.
-->
<section id="work" class="placeholder">
	<div class="inner">
		<span class="label">/work</span>
		<p>Section coming next — Phase 1 §5.2</p>
	</div>
</section>

<section id="now" class="placeholder">
	<div class="inner">
		<span class="label">/now</span>
		<p>Section coming next — Phase 1 §5.3</p>
	</div>
</section>

<section id="skills" class="placeholder">
	<div class="inner">
		<span class="label">/skills</span>
		<p>Section coming next — Phase 1 §5.4</p>
	</div>
</section>

<section id="contact" class="placeholder">
	<div class="inner">
		<span class="label">/contact</span>
		<p>Section coming next — Phase 1 §5.5</p>
	</div>
</section>

<style>
	.placeholder {
		min-height: 60vh;
		padding: var(--section-pad-y) var(--section-pad-x);
		border-top: 1px solid var(--border);
		background: var(--bg-2);
		display: flex;
		align-items: center;
	}

	.inner {
		max-width: var(--layout-max-width);
		margin: 0 auto;
		width: 100%;
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--accent-dim);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}

	.placeholder p {
		margin-top: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--dim);
	}

	@media (max-width: 720px) {
		.placeholder {
			padding: var(--section-pad-y-mobile) var(--section-pad-x-mobile);
		}
	}
</style>
