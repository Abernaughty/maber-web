/**
 * Hand evaluation utilities
 */

import type { Card } from './types';
import { CARD_VALUES } from './types';

/** Calculate the value of a hand, accounting for aces */
export function calculateHandValue(cards: Card[]): number {
	let value = 0;
	let aceCount = 0;

	for (const card of cards) {
		value += CARD_VALUES[card.value];
		if (card.value === 'A') {
			aceCount++;
		}
	}

	// Promote aces from 1 to 11 when beneficial
	for (let i = 0; i < aceCount; i++) {
		if (value + 10 <= 21) {
			value += 10;
		}
	}

	return value;
}

/** Check if a hand is a blackjack (21 with exactly 2 cards) */
export function isBlackjack(cards: Card[]): boolean {
	return cards.length === 2 && calculateHandValue(cards) === 21;
}

/** Check if a hand is bust (over 21) */
export function isBust(cards: Card[]): boolean {
	return calculateHandValue(cards) > 21;
}

/** Check if two cards can be split (same numeric value) */
export function canSplit(cards: Card[], balance: number, bet: number): boolean {
	if (cards.length !== 2) return false;
	if (balance < bet) return false;

	return CARD_VALUES[cards[0].value] === CARD_VALUES[cards[1].value];
}

/** Check if a hand can double down */
export function canDouble(cards: Card[], balance: number, bet: number): boolean {
	if (cards.length !== 2) return false;
	return balance >= bet;
}

/** Get the masked dealer value (first card only, ace = 11) */
export function getDealerMaskedValue(dealerCards: Card[]): number {
	if (dealerCards.length === 0) return 0;

	const firstCard = dealerCards[0];
	if (firstCard.value === 'A') return 11;
	return CARD_VALUES[firstCard.value];
}
