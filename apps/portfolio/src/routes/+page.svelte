<script lang="ts">
	/**
	 * Main page composition.
	 *
	 * Composes the 5 sections in the order from spec §3:
	 *   Hero (#about) → Work → Now → Skills → Contact
	 *
	 * GhDashboard data is fetched server-side (see +page.server.ts) and
	 * threaded into the Hero, which renders the dashboard inline. Failed
	 * fetches pass through as `gh.ok === false` — every dashboard module
	 * shows its skeleton in that case.
	 *
	 * Spec: §3 Page structure, §4 GhDashboard.
	 */

	import { NAME, TAGLINE } from '$lib/constants/identity';
	import { SITE_DESCRIPTION, SITE_URL } from '$lib/constants/site';
	import Hero from '$lib/components/Hero.svelte';
	import WorkSection from '$lib/components/WorkSection.svelte';
	import NowSection from '$lib/components/NowSection.svelte';
	import SkillsSection from '$lib/components/SkillsSection.svelte';
	import ContactSection from '$lib/components/ContactSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const pageTitle = `${NAME} — ${TAGLINE}`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={SITE_DESCRIPTION} />
	<link rel="canonical" href={SITE_URL} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:url" content={SITE_URL} />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={SITE_DESCRIPTION} />
</svelte:head>

<Hero gh={data.gh} />
<WorkSection />
<NowSection />
<SkillsSection />
<ContactSection />
