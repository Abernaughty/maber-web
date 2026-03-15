<script lang="ts">
	import type { Card as CardType } from '$lib/game/types';
	import Card from './Card.svelte';

	let {
		cards,
		label = '',
		score = 0,
		showScore = true,
		bet = 0,
		showBet = false,
		isBlackjack = false,
		isBust = false,
		result = '',
		highlight = false,
		dealerMasked = false
	}: {
		cards: CardType[];
		label?: string;
		score?: number;
		showScore?: boolean;
		bet?: number;
		showBet?: boolean;
		isBlackjack?: boolean;
		isBust?: boolean;
		result?: string;
		highlight?: boolean;
		dealerMasked?: boolean;
	} = $props();

	const scoreText = $derived.by(() => {
		if (!showScore || score === 0) return '';
		let text = `${label}: ${score}`;
		if (isBlackjack) text += ' - Blackjack';
		else if (isBust) text += ' - Bust';
		return text;
	});

	const resultClass = $derived.by(() => {
		if (result === 'Dealer Wins.') return 'dealer-wins';
		if (result === 'Push.') return 'push';
		if (result) return 'player-wins';
		return '';
	});
</script>

<div class="hand-area" class:hand-highlight={highlight}>
	{#if showScore && scoreText}
		<div class="score">{scoreText}</div>
	{/if}

	<div class="cards">
		{#each cards as card, i}
			<Card {card} faceDown={dealerMasked && i === 1} />
		{/each}
	</div>

	{#if showBet && bet > 0}
		<div class="bet">Bet: {bet}</div>
	{/if}

	{#if result}
		<div class="result {resultClass}">{result}</div>
	{/if}
</div>

<style>
	.hand-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 10px 0;
		padding: 10px;
		border: 3px solid transparent;
		border-radius: 10px;
		transition: border-color 0.3s ease;
	}

	.hand-highlight {
		border-color: yellow;
	}

	.cards {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		min-height: 120px;
		align-items: center;
	}

	.score,
	.bet {
		background-color: #468c4e;
		color: white;
		padding: 5px 15px;
		border-radius: 5px;
		margin: 5px 0;
		font-size: 16px;
		min-width: 120px;
		text-align: center;
	}

	.result {
		background-color: #468c4e;
		color: white;
		padding: 8px 20px;
		border-radius: 5px;
		margin: 8px 0;
		font-size: 18px;
		text-align: center;
		font-weight: bold;
	}

	.result.dealer-wins {
		background-color: #dc2626;
	}

	.result.push {
		background-color: white;
		color: black;
	}

	.result.player-wins {
		background-color: #468c4e;
	}
</style>
