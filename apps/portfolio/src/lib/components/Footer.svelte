<script lang="ts">
	/**
	 * Page footer — three-group row with the live clock on the left, build
	 * credits in the center, and copyright + version on the right.
	 *
	 * Spec: §3 Footer. The "A+ securityheaders.com" badge link gets added
	 * in Phase 4 once the headers are configured and the grade is verified.
	 */

	import { useClock } from '$lib/hooks/useClock.svelte';

	const clock = useClock();
	const year = new Date().getFullYear();
	const version = 'v1.0.0';
</script>

<footer class="footer">
	<div class="inner">
		<span class="left">[{clock.time}]</span>
		<span class="center">
			built with <span class="accent">sveltekit</span>
			<span class="separator">·</span>
			hosted on <span class="accent">vercel</span>
			<!-- Phase 4 will append: · A+ securityheaders.com → -->
		</span>
		<span class="right">
			© {year} mike abernathy
			<span class="separator">·</span>
			{version}
		</span>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--border);
		padding: var(--space-6) 0;
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--dim);
		letter-spacing: var(--tracking-wide);
	}

	.inner {
		max-width: var(--layout-max-width);
		margin: 0 auto;
		padding: 0 var(--section-pad-x);
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: var(--space-4);
	}

	.left {
		justify-self: start;
		font-variant-numeric: tabular-nums;
	}

	.center {
		justify-self: center;
		text-align: center;
		color: var(--muted);
	}

	.right {
		justify-self: end;
		text-align: right;
	}

	.accent {
		color: var(--accent-dim);
	}

	.separator {
		color: var(--border-strong);
		margin: 0 var(--space-1);
	}

	@media (max-width: 720px) {
		.inner {
			grid-template-columns: 1fr;
			text-align: center;
			padding: 0 var(--section-pad-x-mobile);
			gap: var(--space-2);
		}
		.left,
		.center,
		.right {
			justify-self: center;
			text-align: center;
		}
	}
</style>
