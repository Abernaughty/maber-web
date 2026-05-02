<script lang="ts">
	/**
	 * Contact section — closing CTA and the contact rows.
	 *
	 * Heading is rendered with a terminal prompt above (`$ curl -X POST
	 * mike@maber.io`) and the title `let's ship something_good` where the
	 * second word is cyan to suggest a glob/identifier match.
	 *
	 * Each row uses uniform `[label] [value] [arrow]` layout. CLEARANCE row
	 * intentionally has no href — it's a credential, not a link.
	 *
	 * Spec: §3 Contact.
	 */

	import { CONTACT_ROWS, EMAIL } from '$lib/constants/contact';
</script>

<section id="contact" class="contact">
	<div class="inner">
		<header class="header">
			<span class="prompt">
				<span class="dollar">$</span>
				<span class="cmd">curl -X POST {EMAIL}</span>
			</span>
			<h2 class="title">
				<span class="line-1">let's ship</span>
				<span class="line-2">something_good</span>
			</h2>
			<p class="subtitle">
				open to senior cloud, platform, and devops roles. also up for a chat
				about azure weirdness, sveltekit, or pokémon tcg market data.
			</p>
		</header>

		<dl class="rows">
			{#each CONTACT_ROWS as row (row.label)}
				<div class="row">
					{#if row.href}
						<a
							class="row-link"
							href={row.href}
							target={row.external ? '_blank' : undefined}
							rel={row.external ? 'noopener noreferrer' : undefined}
							download={row.download}
						>
							<dt class="label">{row.label}</dt>
							<dd class="value">{row.value}</dd>
							<span class="arrow" aria-hidden="true">→</span>
						</a>
					{:else}
						<div class="row-static">
							<dt class="label">{row.label}</dt>
							<dd class="value plain">{row.value}</dd>
							<span class="arrow placeholder" aria-hidden="true"></span>
						</div>
					{/if}
				</div>
			{/each}
		</dl>
	</div>
</section>

<style>
	.contact {
		padding: var(--section-pad-y) var(--section-pad-x);
		background: var(--bg);
		position: relative;
		z-index: var(--z-content);
	}

	.inner {
		max-width: var(--layout-max-width);
		margin: 0 auto;
	}

	.header {
		margin-bottom: var(--space-12);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.prompt {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--dim);
		display: inline-flex;
		gap: var(--space-2);
	}

	.dollar {
		color: var(--accent);
	}

	.title {
		font-family: var(--font-sans);
		font-weight: var(--fw-black);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-tight);
		font-size: clamp(48px, 9vw, 88px);
		display: flex;
		flex-direction: column;
	}

	.line-1 {
		color: var(--text);
	}

	.line-2 {
		color: var(--accent);
		text-shadow: 0 0 24px rgba(34, 211, 238, 0.2);
	}

	.subtitle {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		max-width: 560px;
		line-height: var(--lh-relaxed);
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	.row {
		border-top: 1px solid var(--border);
	}

	.row:last-child {
		border-bottom: 1px solid var(--border);
	}

	.row-link,
	.row-static {
		display: grid;
		grid-template-columns: 140px 1fr auto;
		gap: var(--space-4);
		padding: var(--space-4) var(--space-3);
		align-items: baseline;
		color: inherit;
		transition: background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.row-link:hover {
		background-color: var(--accent-glow);
	}

	.row-link:hover .arrow {
		transform: translateX(4px);
		color: var(--accent);
	}

	.row-link:hover .value {
		color: var(--accent);
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--dim);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
	}

	.value {
		font-family: var(--font-mono);
		font-size: var(--fs-base);
		color: var(--text);
		transition: color var(--transition-fast);
		word-break: break-word;
	}

	.value.plain {
		color: var(--muted);
	}

	.arrow {
		font-family: var(--font-mono);
		color: var(--dim);
		transition: transform var(--transition-fast),
			color var(--transition-fast);
	}

	.arrow.placeholder {
		visibility: hidden;
	}

	@media (max-width: 720px) {
		.contact {
			padding: var(--section-pad-y-mobile) var(--section-pad-x-mobile);
		}
		.row-link,
		.row-static {
			grid-template-columns: 1fr auto;
			grid-template-areas:
				'label arrow'
				'value value';
			gap: var(--space-1) var(--space-2);
			padding: var(--space-3) var(--space-2);
		}
		.label {
			grid-area: label;
		}
		.value {
			grid-area: value;
		}
		.arrow {
			grid-area: arrow;
		}
	}
</style>
