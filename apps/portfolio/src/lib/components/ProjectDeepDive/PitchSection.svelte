<script lang="ts">
	/**
	 * Section 1 of the deep-dive — the 30-second pitch.
	 *
	 * Two-column on desktop (title/summary | metadata block). Stacks on
	 * mobile. Spec §7 §1.
	 */

	import type { DeepDiveMetadata } from '$lib/constants/deepdives';

	interface Props {
		number: string;
		title: string;
		summary: string;
		metadata: DeepDiveMetadata;
	}

	const { number, title, summary, metadata }: Props = $props();
</script>

<section class="pitch">
	<div class="left">
		<span class="number">{number}</span>
		<h1 class="title">{title}</h1>
		<p class="summary">{summary}</p>
	</div>
	<dl class="meta">
		<div class="row">
			<dt>TYPE</dt>
			<dd>{metadata.type}</dd>
		</div>
		<div class="row">
			<dt>YEAR</dt>
			<dd>{metadata.year}</dd>
		</div>
		<div class="row">
			<dt>STACK</dt>
			<dd>{metadata.stack}</dd>
		</div>
		<div class="row">
			<dt>STATUS</dt>
			<dd>{metadata.status}</dd>
		</div>
		<div class="row">
			<dt>ROLE</dt>
			<dd>{metadata.role}</dd>
		</div>
	</dl>
</section>

<style>
	.pitch {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		align-items: start;
	}

	.left {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.number {
		font-family: var(--font-mono);
		font-size: var(--fs-xl);
		color: var(--accent);
		line-height: 1;
		font-weight: var(--fw-bold);
	}

	.title {
		font-family: var(--font-sans);
		font-size: var(--fs-2xl);
		font-weight: var(--fw-black);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-tight);
		color: var(--text);
	}

	.summary {
		font-family: var(--font-mono);
		font-size: var(--fs-base);
		color: var(--muted);
		line-height: var(--lh-relaxed);
		max-width: 60ch;
	}

	.meta {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--panel-2);
	}

	.row {
		display: grid;
		grid-template-columns: 80px 1fr;
		gap: var(--space-3);
		align-items: baseline;
	}

	.row dt {
		color: var(--dim);
		font-size: var(--fs-micro);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}

	.row dd {
		color: var(--text);
		line-height: var(--lh-snug);
	}

	@media (max-width: 720px) {
		.pitch {
			grid-template-columns: 1fr;
			gap: var(--space-6);
		}
	}
</style>
