<script lang="ts">
	/**
	 * Deep-dive case study page — composes the 5 sections from spec §7
	 * (pitch · demo · architecture · decisions · code) plus a sticky
	 * breadcrumb at the top and a back/next link footer.
	 *
	 * 760px max-width per spec §7 layout.
	 */

	import type { PageData } from './$types';
	import PitchSection from '$lib/components/ProjectDeepDive/PitchSection.svelte';
	import DemoButton from '$lib/components/ProjectDeepDive/DemoButton.svelte';
	import ArchitectureSection from '$lib/components/ProjectDeepDive/ArchitectureSection.svelte';
	import DecisionsSection from '$lib/components/ProjectDeepDive/DecisionsSection.svelte';
	import CodeSection from '$lib/components/ProjectDeepDive/CodeSection.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.deepdive.title} — Mike Abernathy</title>
	<meta name="description" content={data.deepdive.summary} />
</svelte:head>

<nav class="breadcrumb" aria-label="Breadcrumb">
	<div class="inner">
		<a class="back" href="/#work">
			<span aria-hidden="true">←</span> projects
		</a>
		<span class="separator" aria-hidden="true">·</span>
		<span class="current">{data.deepdive.title}</span>
	</div>
</nav>

<article class="deepdive">
	<PitchSection
		number={data.deepdive.number}
		title={data.deepdive.title}
		summary={data.deepdive.summary}
		metadata={data.deepdive.metadata}
	/>

	{#if data.deepdive.demo}
		<DemoButton
			liveUrl={data.deepdive.demo.liveUrl}
			liveDomain={data.deepdive.demo.liveDomain}
			sourceUrl={data.deepdive.demo.sourceUrl}
		/>
	{/if}

	<ArchitectureSection
		diagram={data.deepdive.architecture.diagram}
		paragraph={data.deepdive.architecture.paragraph}
	/>

	<DecisionsSection decisions={data.deepdive.decisions} />

	<CodeSection
		snippets={data.deepdive.codeHighlights}
		htmlBySnippet={data.codeHtml}
	/>

	<footer class="dd-footer">
		<a class="back-link" href="/#work">
			<span aria-hidden="true">←</span> back to projects
		</a>
		{#if data.next.slug !== data.deepdive.slug}
			<a class="next-link" href="/projects/{data.next.slug}">
				next: {data.next.title} <span aria-hidden="true">→</span>
			</a>
		{/if}
	</footer>
</article>

<style>
	.breadcrumb {
		position: sticky;
		top: calc(var(--topbar-height) + var(--nav-height));
		z-index: 40;
		background: rgba(10, 11, 10, 0.92);
		backdrop-filter: var(--blur-backdrop);
		border-bottom: 1px solid var(--border);
	}

	.breadcrumb .inner {
		max-width: var(--layout-max-width);
		margin: 0 auto;
		padding: var(--space-2) var(--section-pad-x);
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.back {
		color: var(--accent);
	}

	.back:hover {
		text-decoration: underline;
	}

	.separator {
		color: var(--dim);
	}

	.current {
		color: var(--muted);
	}

	.deepdive {
		max-width: 760px;
		margin: 0 auto;
		padding: var(--space-12) var(--section-pad-x) var(--space-24);
		display: flex;
		flex-direction: column;
		gap: var(--space-16);
	}

	.dd-footer {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		padding-top: var(--space-8);
		border-top: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: var(--fs-small);
	}

	.back-link,
	.next-link {
		color: var(--accent);
	}

	.back-link:hover,
	.next-link:hover {
		text-decoration: underline;
	}

	@media (max-width: 720px) {
		.deepdive {
			padding: var(--space-8) var(--section-pad-x-mobile) var(--space-16);
			gap: var(--space-12);
		}

		.breadcrumb .inner {
			padding: var(--space-2) var(--section-pad-x-mobile);
		}

		.dd-footer {
			flex-direction: column;
			gap: var(--space-2);
		}
	}
</style>
