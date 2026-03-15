<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameState, Card as CardType } from '$lib/game/types';
	import {
		createInitialState,
		resetForNewHand,
		placeBet as placeBetAction,
		playerHit as playerHitAction,
		playerStand as playerStandAction,
		playerDouble as playerDoubleAction,
		playerSplit as playerSplitAction,
		playerSurrender as playerSurrenderAction,
		dealerPlay as dealerPlayAction,
		canSplitCurrentHand,
		canDoubleCurrentHand,
		needsAutoHit
	} from '$lib/game/engine';
	import { saveGameData, loadGameData } from '$lib/game/storage';
	import BettingUI from './BettingUI.svelte';
	import Hand from './Hand.svelte';
	import ActionButtons from './ActionButtons.svelte';

	type GamePhase = 'betting' | 'playing' | 'dealer' | 'resolving';

	let game: GameState = $state(createInitialState());
	let phase: GamePhase = $state('betting');
	let actionsEnabled = $state(true);

	// Derived state
	const playerCards = $derived.by((): CardType[] => {
		if (game.isSplit) return [];
		return game.player as CardType[];
	});
	const splitHand1 = $derived.by((): CardType[] => {
		if (!game.isSplit) return [];
		return (game.player as [CardType[], CardType[]])[0];
	});
	const splitHand2 = $derived.by((): CardType[] => {
		if (!game.isSplit) return [];
		return (game.player as [CardType[], CardType[]])[1];
	});
	const canSplit = $derived(phase === 'playing' && actionsEnabled && canSplitCurrentHand(game));
	const canDouble = $derived(phase === 'playing' && actionsEnabled && canDoubleCurrentHand(game));
	const canAct = $derived(phase === 'playing' && actionsEnabled && game.turn === 'Player');

	onMount(() => {
		const saved = loadGameData();
		game = createInitialState(saved.balance, saved.previousBet);
	});

	function handlePlaceBet(amount: number) {
		game = placeBetAction(game, amount);
		saveGameData(game.balance, game.previousBet);
		phase = 'playing';

		// Check if player got blackjack on deal
		if (game.turn === 'Dealer') {
			actionsEnabled = false;
			setTimeout(() => runDealerPhase(), 1000);
		}
	}

	function handleHit() {
		if (!canAct) return;
		game = playerHitAction(game);

		checkPostAction();
	}

	function handleStand() {
		if (!canAct) return;
		game = playerStandAction(game);

		if (game.turn === 'Dealer') {
			actionsEnabled = false;
			setTimeout(() => runDealerPhase(), 1000);
		} else if (needsAutoHit(game)) {
			// Auto-hit second split hand if it only has 1 card
			setTimeout(() => {
				game = playerHitAction(game);
				checkPostAction();
			}, 500);
		}
	}

	function handleDouble() {
		if (!canAct) return;
		game = playerDoubleAction(game);
		saveGameData(game.balance, game.previousBet);

		if (game.turn === 'Dealer') {
			actionsEnabled = false;
			setTimeout(() => runDealerPhase(), 1000);
		} else if (needsAutoHit(game)) {
			setTimeout(() => {
				game = playerHitAction(game);
				checkPostAction();
			}, 500);
		}
	}

	function handleSplit() {
		if (!canAct) return;
		game = playerSplitAction(game);
		saveGameData(game.balance, game.previousBet);

		checkPostAction();
	}

	function handleSurrender() {
		if (!canAct) return;
		game = playerSurrenderAction(game);

		if (game.turn === 'Dealer') {
			actionsEnabled = false;
			setTimeout(() => runDealerPhase(), 1000);
		} else if (needsAutoHit(game)) {
			setTimeout(() => {
				game = playerHitAction(game);
				checkPostAction();
			}, 500);
		}
	}

	function checkPostAction() {
		if (game.turn === 'Dealer') {
			actionsEnabled = false;
			setTimeout(() => runDealerPhase(), 1000);
		} else if (needsAutoHit(game)) {
			setTimeout(() => {
				game = playerHitAction(game);
				checkPostAction();
			}, 500);
		}
	}

	function runDealerPhase() {
		phase = 'dealer';
		game = dealerPlayAction(game);
		saveGameData(game.balance, game.previousBet);
		phase = 'resolving';

		// Start new hand after delay
		setTimeout(() => {
			game = resetForNewHand(game);
			phase = 'betting';
			actionsEnabled = true;
		}, 2500);
	}
</script>

<div class="game-container">
	<header>
		<h1>BLACKJACK</h1>
	</header>

	{#if phase === 'betting'}
		<BettingUI
			balance={game.balance}
			previousBet={game.previousBet}
			onPlaceBet={handlePlaceBet}
		/>
	{:else}
		<div class="game-ui">
			<!-- Dealer Hand -->
			<Hand
				cards={game.dealer}
				label="Dealer"
				score={game.masked ? game.dealerMaskVal : game.dealerVal}
				showScore={true}
				dealerMasked={game.masked}
				isBlackjack={game.dealerBlackjack}
				isBust={game.dealerBust}
			/>

			<!-- Single-hand result -->
			{#if !game.isSplit && game.hand1Win}
				<div class="winner-announcement" class:dealer-wins={game.hand1Win === 'Dealer Wins.'} class:push={game.hand1Win === 'Push.'}>
					{game.hand1Win}
				</div>
			{/if}

			<!-- Player Hand(s) -->
			{#if game.isSplit}
				<div class="split-hands">
					<Hand
						cards={splitHand1}
						label="Player"
						score={game.hand1Val}
						showScore={true}
						showBet={true}
						bet={game.bet1}
						isBlackjack={game.hand1Blackjack}
						isBust={game.hand1Bust}
						result={game.hand1Win}
						highlight={game.activeHand === 0 && game.turn === 'Player'}
					/>
					<Hand
						cards={splitHand2}
						label="Player"
						score={game.hand2Val}
						showScore={true}
						showBet={true}
						bet={game.bet2}
						isBlackjack={game.hand2Blackjack}
						isBust={game.hand2Bust}
						result={game.hand2Win}
						highlight={game.activeHand === 1 && game.turn === 'Player'}
					/>
				</div>
			{:else}
				<Hand
					cards={playerCards}
					label="Player"
					score={game.hand1Val}
					showScore={true}
					showBet={true}
					bet={game.bet1}
					isBlackjack={game.hand1Blackjack}
					isBust={game.hand1Bust}
				/>
			{/if}

			<!-- Action Buttons -->
			{#if phase === 'playing'}
				<ActionButtons
					canHit={canAct}
					canStand={canAct}
					canDoubleDown={canDouble}
					canSplit={canSplit}
					canSurrender={canAct}
					onHit={handleHit}
					onStand={handleStand}
					onDouble={handleDouble}
					onSplit={handleSplit}
					onSurrender={handleSurrender}
				/>
			{/if}
		</div>
	{/if}

	<footer>
		<div class="balance">Balance: {game.balance}</div>
	</footer>
</div>

<style>
	.game-container {
		width: 100%;
		max-width: 1000px;
		min-height: 780px;
		background-image: url('/images/felt.png');
		background-size: cover;
		background-position: center;
		background-color: #35654d;
		display: flex;
		flex-direction: column;
		position: relative;
		border-radius: 10px;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	header {
		text-align: center;
		background-color: #dc2626;
		padding: 15px 0;
	}

	h1 {
		font-family: 'Arial Black', 'Elephant', sans-serif;
		font-size: 36px;
		color: white;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
		margin: 0;
	}

	.game-ui {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 10px;
	}

	.split-hands {
		display: flex;
		justify-content: space-around;
		gap: 10px;
	}

	.winner-announcement {
		background-color: #468c4e;
		color: white;
		padding: 10px 20px;
		border-radius: 5px;
		margin: 10px auto;
		font-size: 18px;
		text-align: center;
		max-width: 300px;
		font-weight: bold;
	}

	.winner-announcement.dealer-wins {
		background-color: #dc2626;
	}

	.winner-announcement.push {
		background-color: white;
		color: black;
	}

	footer {
		background-color: #dc2626;
		padding: 10px 0;
		width: 100%;
		text-align: center;
		margin-top: auto;
	}

	.balance {
		font-size: 16px;
		color: white;
	}

	@media (max-width: 768px) {
		.game-container {
			max-width: 100%;
			min-height: 100vh;
			border-radius: 0;
		}
	}

	@media (max-width: 480px) {
		h1 {
			font-size: 24px;
		}

		.split-hands {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
