<script lang="ts">
	import { MIN_BET } from '$lib/game/types';

	let {
		balance,
		previousBet,
		onPlaceBet
	}: {
		balance: number;
		previousBet: number;
		onPlaceBet: (amount: number) => void;
	} = $props();

	let betAmount = $state(Math.min(previousBet, balance));

	// Keep bet clamped within valid range
	const maxBet = $derived(Math.max(MIN_BET, balance));
	const clampedBet = $derived(Math.min(Math.max(betAmount, MIN_BET), maxBet));

	function handleSliderInput(e: Event) {
		const target = e.target as HTMLInputElement;
		betAmount = parseInt(target.value, 10);
	}

	function handlePlaceBet() {
		onPlaceBet(clampedBet);
	}
</script>

<div class="betting-ui">
	<div class="bet-controls">
		<p class="place-bet-label">Please place your bet.</p>
		<p class="bet-amount">Bet: {clampedBet}</p>
		<div class="bet-slider-container">
			<input
				type="range"
				class="bet-slider"
				min={MIN_BET}
				max={maxBet}
				step="5"
				value={clampedBet}
				oninput={handleSliderInput}
			/>
		</div>
		<button class="place-bet-btn" onclick={handlePlaceBet}>Place Bet</button>
	</div>
</div>

<style>
	.betting-ui {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.bet-controls {
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 300px;
	}

	.place-bet-label {
		font-size: 20px;
		margin-bottom: 15px;
		color: white;
		background-color: #468c4e;
		padding: 5px 15px;
		border-radius: 5px;
	}

	.bet-amount {
		font-size: 20px;
		margin-bottom: 15px;
		background-color: #468c4e;
		color: white;
		padding: 5px 15px;
		border-radius: 5px;
		min-width: 100px;
		text-align: center;
	}

	.bet-slider-container {
		width: 80%;
		margin: 15px 0;
	}

	.bet-slider {
		width: 100%;
		height: 35px;
		background: #468c4e;
		outline: none;
		border-radius: 15px;
		cursor: pointer;
	}

	.place-bet-btn {
		background-color: #468c4e;
		color: white;
		border: none;
		padding: 10px 20px;
		font-size: 20px;
		cursor: pointer;
		border-radius: 5px;
		transition: background-color 0.3s;
	}

	.place-bet-btn:hover {
		background-color: #3a7542;
	}
</style>
