<script lang="ts">
	/**
	 * Top status strip — sits above the section nav, suggests a terminal /
	 * git-branch indicator on the left and current availability on the right.
	 *
	 * No links. CTA-adjacent content lives in the Contact section.
	 *
	 * Spec: §3 TopBar — height 33px, sticky top:0, z-index 60.
	 */
</script>

<div class="topbar">
	<div class="inner">
		<span class="left">
			<span class="path">~/maber.io</span>
			<span class="separator">·</span>
			<span class="branch">main</span>
		</span>
		<span class="right">
			<span class="status">
				<span class="dot" aria-hidden="true"></span>
				<span class="label">open to work</span>
			</span>
			<span class="separator">·</span>
			<span class="location">remote · colorado springs, co</span>
		</span>
	</div>
</div>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: var(--z-topbar);
		height: var(--topbar-height);
		background: rgba(10, 11, 10, 0.92);
		backdrop-filter: var(--blur-backdrop);
		border-bottom: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: var(--fs-micro);
		color: var(--dim);
		letter-spacing: var(--tracking-wide);
	}

	.inner {
		max-width: var(--layout-max-width);
		height: 100%;
		margin: 0 auto;
		padding: 0 var(--section-pad-x);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.left,
	.right {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.path {
		color: var(--muted);
	}

	.branch {
		color: var(--accent-dim);
	}

	.separator {
		color: var(--dim);
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--status-live);
		box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
		animation: pulse 2s ease-out infinite;
	}

	.label {
		color: var(--muted);
		text-transform: lowercase;
	}

	.location {
		color: var(--dim);
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
		}
		70% {
			box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
		}
	}

	/* Mobile: drop the location string; keep status + branch only. */
	@media (max-width: 640px) {
		.location,
		.right .separator {
			display: none;
		}
		.inner {
			padding: 0 var(--section-pad-x-mobile);
		}
	}
</style>
