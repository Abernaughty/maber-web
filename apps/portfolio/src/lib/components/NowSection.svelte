<script lang="ts">
	/**
	 * Now section — what I'm currently building / learning / reading / listening.
	 *
	 * Subtitle includes a `last updated [date]` stamp so readers can tell at
	 * a glance whether the content is fresh. Refresh cadence is monthly per
	 * spec §3 Now.
	 *
	 * Spec: §3 Now.
	 */

	import { NOW_ITEMS, LAST_UPDATED } from '$lib/constants/now';
	import SectionHeader from './SectionHeader.svelte';

	function formatDate(iso: string): string {
		// Render `2026-05-02` as `May 2026` for the subtitle.
		const year = iso.split('-')[0];
		const monthName = new Date(`${iso}T00:00:00`).toLocaleString('en-US', {
			month: 'long'
		});
		return `${monthName} ${year}`;
	}
</script>

<section id="now" class="now">
	<div class="inner">
		<SectionHeader
			path="/now"
			title="Currently"
			subtitle={`updated ${formatDate(LAST_UPDATED)}`}
		/>

		<dl class="rows">
			{#each NOW_ITEMS as item (item.label)}
				<div class="row">
					<dt class="label">{item.label}</dt>
					<dd class="value">{item.value}</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

<style>
	.now {
		padding: var(--section-pad-y) var(--section-pad-x);
		background: var(--bg);
		position: relative;
		z-index: var(--z-content);
	}

	.inner {
		max-width: var(--layout-max-width);
		margin: 0 auto;
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	.row {
		display: grid;
		grid-template-columns: 160px 1fr;
		gap: var(--space-6);
		padding: var(--space-4) 0;
		border-top: 1px solid var(--border);
		align-items: baseline;
	}

	.row:last-child {
		border-bottom: 1px solid var(--border);
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--dim);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}

	.value {
		font-family: var(--font-sans);
		font-size: var(--fs-base);
		color: var(--text);
		line-height: var(--lh-relaxed);
	}

	@media (max-width: 720px) {
		.now {
			padding: var(--section-pad-y-mobile) var(--section-pad-x-mobile);
		}
		.row {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
