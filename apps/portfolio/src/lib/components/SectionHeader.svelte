<script lang="ts">
	/**
	 * Shared section header pattern — used by Work / Now / Skills / Contact.
	 *
	 * Two-row block:
	 *   Top:    `/section-id` (mono dim) optionally followed by a `[ N items ]` counter
	 *   Bottom: large sans-serif title with optional subtitle below
	 *
	 * Spec §3 "Section header pattern".
	 */

	interface Props {
		/** Path-style label, e.g. `/work`. Always rendered with leading slash. */
		path: string;
		/** Optional counter, e.g. "3 projects". Bracketed automatically. */
		count?: string;
		/** Section title (large, sans-serif). */
		title: string;
		/** Optional subtitle below the title. Mono, muted. */
		subtitle?: string;
	}

	const { path, count, title, subtitle }: Props = $props();
</script>

<header class="header">
	<div class="meta">
		<span class="path">{path}</span>
		{#if count}
			<span class="count">[ {count} ]</span>
		{/if}
	</div>
	<h2 class="title">{title}</h2>
	{#if subtitle}
		<p class="subtitle">{subtitle}</p>
	{/if}
</header>

<style>
	.header {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
	}

	.meta {
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--dim);
		text-transform: uppercase;
		letter-spacing: var(--tracking-label);
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.path {
		color: var(--accent-dim);
	}

	.count {
		color: var(--dim);
	}

	.title {
		font-family: var(--font-sans);
		font-size: var(--fs-2xl);
		font-weight: var(--fw-black);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-tight);
		color: var(--text);
	}

	.subtitle {
		font-family: var(--font-mono);
		font-size: var(--fs-small);
		color: var(--muted);
		max-width: 60ch;
	}

	@media (max-width: 720px) {
		.title {
			font-size: var(--fs-xl);
		}
	}
</style>
