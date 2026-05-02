<script lang="ts">
	/**
	 * Main page composition.
	 *
	 * Composes the 5 sections in the order from spec §3:
	 *   Hero (#about) → Work → Now → Skills → Contact
	 *
	 * Spec: §3 Page structure.
	 */

	import { NAME, TAGLINE } from '$lib/constants/identity';
	import Hero from '$lib/components/Hero.svelte';
	import WorkSection from '$lib/components/WorkSection.svelte';
	import NowSection from '$lib/components/NowSection.svelte';
	import SkillsSection from '$lib/components/SkillsSection.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
</script>

<svelte:head>
	<title>{NAME} — {TAGLINE}</title>
	<meta name="description" content={TAGLINE} />
</svelte:head>

<Hero />
<WorkSection />
<NowSection />
<SkillsSection />
<ContactSection />
