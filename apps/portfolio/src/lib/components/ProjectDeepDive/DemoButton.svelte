<script lang="ts">
	/**
	 * Section 2 of the deep-dive — single full-width call-to-action panel
	 * linking to the live demo, with a smaller "view source on github" link
	 * below. Spec §7 §2.
	 */

	interface Props {
		liveUrl: string;
		liveDomain: string;
		sourceUrl: string;
	}

	const { liveUrl, liveDomain, sourceUrl }: Props = $props();
</script>

<section class="demo">
	<a class="panel" href={liveUrl} target="_blank" rel="noopener noreferrer">
		<span class="label">[ LIVE DEMO ]</span>
		<span class="copy">See it running</span>
		<span class="domain">{liveDomain}</span>
		<span class="arrow" aria-hidden="true">↗</span>
	</a>
	<a class="source" href={sourceUrl} target="_blank" rel="noopener noreferrer">
		view source on github <span aria-hidden="true">→</span>
	</a>
</section>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.panel {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-6);
		border: 1px solid var(--accent);
		border-radius: var(--radius-md);
		background: rgba(34, 211, 238, 0.04);
		font-family: var(--font-mono);
		transition: background-color var(--transition-fast),
			transform var(--transition-fast);
	}

	.panel:hover {
		background: var(--accent-glow);
	}

	.label {
		font-size: var(--fs-small);
		color: var(--accent);
		font-weight: var(--fw-bold);
		letter-spacing: var(--tracking-label);
	}

	.copy {
		font-size: var(--fs-base);
		color: var(--text);
	}

	.domain {
		font-size: var(--fs-small);
		color: var(--muted);
	}

	.arrow {
		color: var(--accent);
		font-size: var(--fs-lg);
	}

	.source {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		align-self: flex-end;
	}

	.source:hover {
		color: var(--accent);
	}

	@media (max-width: 720px) {
		.panel {
			grid-template-columns: 1fr auto;
			grid-template-areas:
				'label arrow'
				'copy  arrow'
				'domain domain';
			gap: var(--space-2);
		}
		.label {
			grid-area: label;
		}
		.copy {
			grid-area: copy;
		}
		.domain {
			grid-area: domain;
		}
		.arrow {
			grid-area: arrow;
		}
	}
</style>
