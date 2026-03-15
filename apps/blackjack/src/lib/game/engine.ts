/**
 * Game engine - core game logic and state transitions
 */

import type { Card, GameState, HandResult } from './types';
import {
	DEFAULT_BALANCE,
	DEFAULT_BET,
	LOAN_THRESHOLD,
	LOAN_AMOUNT,
	BLACKJACK_PAYOUT,
	REGULAR_PAYOUT,
	DEALER_STAND_VALUE
} from './types';
import { createShuffledDeck, drawCard } from './deck';
import {
	calculateHandValue,
	isBlackjack,
	isBust,
	canSplit as checkCanSplit,
	canDouble as checkCanDouble,
	getDealerMaskedValue
} from './hand';

/** Create initial game state */
export function createInitialState(balance?: number, previousBet?: number): GameState {
	return {
		balance: balance ?? DEFAULT_BALANCE,
		previousBet: previousBet ?? DEFAULT_BET,
		bet1: 0,
		bet2: 0,
		dealer: [],
		player: [],
		playing: false,
		isSplit: false,
		activeHand: 0,
		dealerMaskVal: 0,
		dealerVal: 0,
		hand1Val: 0,
		hand2Val: 0,
		hand1Win: '',
		hand2Win: '',
		hand1Bust: false,
		hand2Bust: false,
		hand1Surrender: false,
		hand2Surrender: false,
		dealerBust: false,
		hand1Blackjack: false,
		hand2Blackjack: false,
		dealerBlackjack: false,
		turn: null,
		masked: true,
		handOver: false,
		deck: createShuffledDeck()
	};
}

/** Reset for a new hand (keeps balance and previousBet) */
export function resetForNewHand(state: GameState): GameState {
	return {
		...createInitialState(state.balance, state.previousBet),
		deck: createShuffledDeck()
	};
}

/** Place a bet and deal initial cards */
export function placeBet(state: GameState, betAmount: number): GameState {
	let newState = { ...state };
	newState.bet1 = betAmount;
	newState.previousBet = betAmount;
	newState.balance -= betAmount;
	newState.playing = true;
	newState.turn = 'Player';

	// Deal 2 cards each to dealer and player
	let deck = [...newState.deck];
	const dealerCards: Card[] = [];
	const playerCards: Card[] = [];

	for (let i = 0; i < 2; i++) {
		const dealerDraw = drawCard(deck);
		dealerCards.push(dealerDraw.card);
		deck = dealerDraw.deck;

		const playerDraw = drawCard(deck);
		playerCards.push(playerDraw.card);
		deck = playerDraw.deck;
	}

	newState.deck = deck;
	newState.dealer = dealerCards;
	newState.player = playerCards;

	// Calculate values
	newState = recalculateValues(newState);

	// Check for initial blackjack
	newState = checkForWinner(newState);

	return newState;
}

/** Recalculate all hand values */
export function recalculateValues(state: GameState): GameState {
	const newState = { ...state };

	// Dealer value
	newState.dealerVal = calculateHandValue(newState.dealer);

	// Masked dealer value (only first card visible to player)
	if (newState.turn === 'Player') {
		newState.dealerMaskVal = getDealerMaskedValue(newState.dealer);
	}

	// Player hand values
	if (newState.isSplit) {
		const hands = newState.player as [Card[], Card[]];
		newState.hand1Val = calculateHandValue(hands[0]);
		newState.hand2Val = calculateHandValue(hands[1]);
	} else {
		const hand = newState.player as Card[];
		newState.hand1Val = calculateHandValue(hand);
	}

	return newState;
}

/** Player hit action */
export function playerHit(state: GameState): GameState {
	let newState = { ...state };
	const { card, deck } = drawCard(newState.deck);
	newState.deck = deck;

	if (newState.isSplit) {
		const hands = [...(newState.player as [Card[], Card[]])];
		hands[newState.activeHand] = [...hands[newState.activeHand], card];
		newState.player = hands as [Card[], Card[]];
	} else {
		newState.player = [...(newState.player as Card[]), card];
	}

	newState = recalculateValues(newState);
	newState = checkForWinner(newState);

	return newState;
}

/** Player stand action */
export function playerStand(state: GameState): GameState {
	const newState = { ...state };

	if (newState.isSplit && newState.activeHand === 0) {
		// Move to second hand
		newState.activeHand = 1;
		// If second hand has only 1 card (from split), need to auto-hit
		return newState;
	}

	// End player turn
	newState.turn = 'Dealer';
	return newState;
}

/** Player double action */
export function playerDouble(state: GameState): GameState {
	let newState = { ...state };

	if (newState.activeHand === 0) {
		newState.balance -= newState.bet1;
		newState.bet1 *= 2;
	} else {
		newState.balance -= newState.bet2;
		newState.bet2 *= 2;
	}

	// Hit once
	newState = playerHit(newState);

	if (newState.isSplit && newState.activeHand === 0) {
		// Move to second hand after doubling on first
		newState.activeHand = 1;
	} else if (!newState.isSplit || newState.activeHand === 1) {
		// End player turn
		if (newState.turn !== 'Dealer') {
			newState.turn = 'Dealer';
		}
	}

	return newState;
}

/** Player split action */
export function playerSplit(state: GameState): GameState {
	let newState = { ...state };
	const hand = newState.player as Card[];

	// Create two separate hands
	const hand1: Card[] = [hand[0]];
	const hand2: Card[] = [hand[1]];
	newState.player = [hand1, hand2];
	newState.isSplit = true;

	// Set up second bet
	newState.bet2 = newState.bet1;
	newState.balance -= newState.bet2;

	newState.activeHand = 0;

	// Deal a card to the first hand
	const { card, deck } = drawCard(newState.deck);
	newState.deck = deck;
	(newState.player as [Card[], Card[]])[0] = [...hand1, card];

	newState = recalculateValues(newState);
	newState = checkForWinner(newState);

	return newState;
}

/** Player surrender action */
export function playerSurrender(state: GameState): GameState {
	const newState = { ...state };

	if (newState.activeHand === 0 && newState.isSplit) {
		newState.hand1Surrender = true;
		newState.activeHand = 1;
		return newState;
	}

	if (newState.isSplit) {
		newState.hand2Surrender = true;
	} else {
		newState.hand1Surrender = true;
	}

	newState.handOver = true;
	newState.turn = 'Dealer';

	return newState;
}

/** Dealer play logic - hits until 17+ */
export function dealerPlay(state: GameState): GameState {
	let newState = { ...state };

	// Unmask
	newState.masked = false;

	// Dealer hits until 17 or higher
	while (newState.dealerVal < DEALER_STAND_VALUE) {
		const { card, deck } = drawCard(newState.deck);
		newState.deck = deck;
		newState.dealer = [...newState.dealer, card];
		newState = recalculateValues(newState);
	}

	// Check for dealer bust
	if (newState.dealerVal > 21) {
		newState.dealerBust = true;
	}

	// Check for dealer blackjack
	if (newState.dealerVal === 21 && newState.dealer.length === 2) {
		newState.dealerBlackjack = true;
	}

	// Determine winners
	newState = determineWinners(newState);
	newState.handOver = true;

	// Resolve bets
	newState = resolveBets(newState);

	return newState;
}

/** Check for winner during player turn */
function checkForWinner(state: GameState): GameState {
	const newState = { ...state };

	if (newState.turn !== 'Player') return newState;

	if (newState.isSplit) {
		const hands = newState.player as [Card[], Card[]];

		// Check hand 1
		if (newState.activeHand === 0) {
			if (newState.hand1Val === 21) {
				if (hands[0].length === 2) newState.hand1Blackjack = true;
				newState.activeHand = 1;
			} else if (newState.hand1Val > 21) {
				newState.hand1Bust = true;
				newState.activeHand = 1;
			}
		}

		// Check hand 2 (when active)
		if (newState.activeHand === 1 && hands[1].length >= 2) {
			if (newState.hand2Val === 21) {
				if (hands[1].length === 2) newState.hand2Blackjack = true;
				newState.turn = 'Dealer';
			} else if (newState.hand2Val > 21) {
				newState.hand2Bust = true;
				newState.turn = 'Dealer';
			}
		}
	} else {
		const hand = newState.player as Card[];

		if (newState.hand1Val === 21) {
			if (hand.length === 2) newState.hand1Blackjack = true;
			newState.turn = 'Dealer';
		} else if (newState.hand1Val > 21) {
			newState.hand1Bust = true;
			newState.hand1Win = 'Dealer Wins.';
			newState.turn = 'Dealer';
		}
	}

	return newState;
}

/** Determine winners for all hands */
function determineWinners(state: GameState): GameState {
	const newState = { ...state };

	newState.hand1Win = determineHandResult(
		newState.hand1Val,
		newState.dealerVal,
		newState.hand1Bust,
		newState.dealerBust,
		newState.hand1Blackjack,
		newState.dealerBlackjack,
		newState.hand1Surrender
	);

	if (newState.isSplit) {
		newState.hand2Win = determineHandResult(
			newState.hand2Val,
			newState.dealerVal,
			newState.hand2Bust,
			newState.dealerBust,
			newState.hand2Blackjack,
			newState.dealerBlackjack,
			newState.hand2Surrender
		);
	}

	return newState;
}

/** Determine the result for a single hand */
function determineHandResult(
	handVal: number,
	dealerVal: number,
	handBust: boolean,
	dealerBust: boolean,
	handBlackjack: boolean,
	dealerBlackjack: boolean,
	handSurrender: boolean
): HandResult {
	if (handSurrender) return 'Surrender.';
	if (dealerBlackjack && handBlackjack) return 'Push.';
	if (dealerBlackjack && !handBlackjack) return 'Dealer Wins.';
	if (!dealerBlackjack && handBlackjack) return 'Player Wins!';
	if (dealerBust && !handBust) return 'Player Wins!';
	if (!dealerBust && handBust) return 'Dealer Wins.';
	if (!handBust && !dealerBust) {
		if (handVal > dealerVal) return 'Player Wins!';
		if (handVal < dealerVal) return 'Dealer Wins.';
		return 'Push.';
	}
	return 'Dealer Wins.';
}

/** Resolve bets and update balance */
function resolveBets(state: GameState): GameState {
	const newState = { ...state };

	// Resolve hand 1
	newState.balance += resolveHandBet(newState.hand1Win, newState.bet1, newState.hand1Blackjack);

	// Resolve hand 2 if split
	if (newState.isSplit) {
		newState.balance += resolveHandBet(
			newState.hand2Win,
			newState.bet2,
			newState.hand2Blackjack
		);
	}

	// Loan if balance is too low
	if (newState.balance < LOAN_THRESHOLD) {
		newState.balance = LOAN_AMOUNT;
	}

	return newState;
}

/** Calculate payout for a single hand */
function resolveHandBet(result: HandResult, bet: number, isBlackjackHand: boolean): number {
	switch (result) {
		case 'Player Wins!':
			return isBlackjackHand ? Math.floor(bet * BLACKJACK_PAYOUT) : bet * REGULAR_PAYOUT;
		case 'Push.':
			return bet;
		case 'Surrender.':
			return Math.floor(bet / 2);
		default:
			return 0;
	}
}

/** Check if player can split in current state */
export function canSplitCurrentHand(state: GameState): boolean {
	if (state.isSplit) return false;
	const hand = state.player as Card[];
	if (hand.length !== 2) return false;
	return checkCanSplit(hand, state.balance, state.bet1);
}

/** Check if player can double in current state */
export function canDoubleCurrentHand(state: GameState): boolean {
	if (state.isSplit) {
		const hands = state.player as [Card[], Card[]];
		const activeHand = hands[state.activeHand];
		const bet = state.activeHand === 0 ? state.bet1 : state.bet2;
		return checkCanDouble(activeHand, state.balance, bet);
	}
	const hand = state.player as Card[];
	return checkCanDouble(hand, state.balance, state.bet1);
}

/** Check if the second split hand needs an auto-hit (only has 1 card) */
export function needsAutoHit(state: GameState): boolean {
	if (!state.isSplit) return false;
	if (state.activeHand !== 1) return false;
	const hands = state.player as [Card[], Card[]];
	return hands[1].length === 1;
}
