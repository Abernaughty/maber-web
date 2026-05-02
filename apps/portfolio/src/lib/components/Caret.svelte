<script lang="ts">
	/**
	 * Blinking cursor primitive. Drop after typed text or interactive prompts
	 * to suggest a live terminal.
	 *
	 * Default color is the cyan accent. Pass `color` to override (e.g. white
	 * for non-prompt contexts) or `solid` to disable the blink (useful while
	 * a useTyping session is mid-type — Caret should stay visible without
	 * flicker until the string completes).
	 */

	interface Props {
		/** CSS color value. Defaults to var(--accent). */
		color?: string;
		/** When true, the caret stops blinking and shows solid. */
		solid?: boolean;
		/** ARIA-hide by default — caret is decorative. */
		ariaHidden?: boolean;
	}

	const {
		color = 'var(--accent)',
		solid = false,
		ariaHidden = true
	}: Props = $props();
</script>

<span
	class="caret"
	class:solid
	style:--caret-color={color}
	aria-hidden={ariaHidden ? 'true' : undefined}
></span>

<style>
	.caret {
		display: inline-block;
		width: 0.55ch;
		height: 1em;
		margin-left: 1px;
		background-color: var(--caret-color);
		vertical-align: text-bottom;
		animation: blink 1s steps(1) infinite;
	}

	.caret.solid {
		animation: none;
	}

	@keyframes blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.caret {
			animation: none;
		}
	}
</style>
