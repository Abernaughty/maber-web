<script lang="ts">
	/**
	 * Shared skeleton primitive for GhDashboard modules. Renders a single
	 * shimmering placeholder block at the size you specify. Compose multiples
	 * to fake the shape of a real card while data loads.
	 *
	 * Phase 1: every GhDashboard module renders nothing but Skeleton blocks
	 * — no real data fetched until Phase 2 wires up the GraphQL query.
	 */

	interface Props {
		/** CSS width, e.g. `100%`, `120px`, `8ch`. Defaults to 100%. */
		width?: string;
		/** CSS height. Defaults to `1em`. */
		height?: string;
		/** Border radius override. */
		radius?: string;
	}

	const {
		width = '100%',
		height = '1em',
		radius = 'var(--radius-sm)'
	}: Props = $props();
</script>

<span
	class="skeleton"
	style:width
	style:height
	style:border-radius={radius}
	aria-hidden="true"
></span>

<style>
	.skeleton {
		display: inline-block;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 0%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.04) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.6s linear infinite;
	}

	@keyframes shimmer {
		from {
			background-position: 200% 0;
		}
		to {
			background-position: -200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton {
			animation: none;
			background: rgba(255, 255, 255, 0.06);
		}
	}
</style>
