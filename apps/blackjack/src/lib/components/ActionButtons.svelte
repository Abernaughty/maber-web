<script lang="ts">
	let {
		canHit = true,
		canStand = true,
		canDoubleDown = false,
		canSplit = false,
		canSurrender = true,
		onHit,
		onStand,
		onDouble,
		onSplit,
		onSurrender
	}: {
		canHit?: boolean;
		canStand?: boolean;
		canDoubleDown?: boolean;
		canSplit?: boolean;
		canSurrender?: boolean;
		onHit: () => void;
		onStand: () => void;
		onDouble: () => void;
		onSplit: () => void;
		onSurrender: () => void;
	} = $props();
</script>

<div class="action-buttons">
	<button disabled={!canHit} onclick={onHit}>Hit</button>
	<button disabled={!canStand} onclick={onStand}>Stand</button>
	<button disabled={!canDoubleDown} onclick={onDouble}>Double</button>
	<button disabled={!canSplit} onclick={onSplit}>Split</button>
	<button disabled={!canSurrender} onclick={onSurrender}>Surrender</button>
</div>

<style>
	.action-buttons {
		display: flex;
		justify-content: center;
		margin: 15px 0;
		flex-wrap: wrap;
		gap: 10px;
	}

	button {
		background-color: #468c4e;
		color: white;
		border: none;
		padding: 8px 15px;
		font-size: 16px;
		cursor: pointer;
		border-radius: 5px;
		transition: background-color 0.3s;
		min-width: 100px;
	}

	button:hover:not(:disabled) {
		background-color: #3a7542;
	}

	button:disabled {
		background-color: gray;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		button {
			font-size: 14px;
			min-width: 80px;
		}
	}

	@media (max-width: 480px) {
		button {
			padding: 8px 10px;
			font-size: 12px;
			min-width: 70px;
		}
	}
</style>
