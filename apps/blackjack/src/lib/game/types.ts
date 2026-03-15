/**
 * Type definitions for the Blackjack game
 */

export type Suit = 'C' | 'S' | 'H' | 'D';
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
	value: CardValue;
	suit: Suit;
	imgPath: string;
}

export type Turn = 'Player' | 'Dealer' | null;

export type HandResult = 'Player Wins!' | 'Dealer Wins.' | 'Push.' | 'Surrender.' | '';

export interface GameState {
	balance: number;
	previousBet: number;
	bet1: number;
	bet2: number;
	dealer: Card[];
	player: Card[] | [Card[], Card[]];
	playing: boolean;
	isSplit: boolean;
	activeHand: 0 | 1;
	dealerMaskVal: number;
	dealerVal: number;
	hand1Val: number;
	hand2Val: number;
	hand1Win: HandResult;
	hand2Win: HandResult;
	hand1Bust: boolean;
	hand2Bust: boolean;
	hand1Surrender: boolean;
	hand2Surrender: boolean;
	dealerBust: boolean;
	hand1Blackjack: boolean;
	hand2Blackjack: boolean;
	dealerBlackjack: boolean;
	turn: Turn;
	masked: boolean;
	handOver: boolean;
	deck: Card[];
}

/** Numeric values for each card face value */
export const CARD_VALUES: Record<CardValue, number> = {
	A: 1,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'10': 10,
	J: 10,
	Q: 10,
	K: 10
};

export const SUITS: Suit[] = ['C', 'S', 'H', 'D'];
export const VALUES: CardValue[] = [
	'A',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'J',
	'Q',
	'K'
];

export const DEFAULT_BALANCE = 100;
export const DEFAULT_BET = 5;
export const MIN_BET = 5;
export const LOAN_THRESHOLD = 5;
export const LOAN_AMOUNT = 100;
export const BLACKJACK_PAYOUT = 2.5; // 3:2
export const REGULAR_PAYOUT = 2; // 1:1
export const DEALER_STAND_VALUE = 17;
