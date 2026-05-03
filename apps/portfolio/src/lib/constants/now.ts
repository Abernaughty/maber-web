/**
 * "Currently" content for the Now section.
 *
 * Refresh cadence is monthly per spec §3. Stale `/now` is worse than no
 * `/now` — set a calendar reminder. The `LAST_UPDATED` constant powers the
 * `currently — last updated [date]` subtitle.
 *
 * Keep entries short and concrete. "Reading: [book title]" beats "Reading
 * about distributed systems."
 */

export interface NowItem {
	/** Uppercase label rendered with letter-spacing. */
	label: string;
	/** Single-line value. Plain string — no markdown. */
	value: string;
}

/** Last edit date in ISO YYYY-MM-DD format. Update each refresh. */
export const LAST_UPDATED = '2026-05-02';

export const NOW_ITEMS: readonly NowItem[] = [
	{
		label: 'building',
		value:
			'Engineer\'s Desk redesign of this site, plus the GhDashboard server fetch.'
	},
	{
		label: 'learning',
		value:
			'Cosmos DB serverless cost tuning and KQL patterns for App Gateway diagnostics.'
	},
	{
		label: 'reading',
		value: 'Designing Data-Intensive Applications — Kleppmann.'
	},
	{
		label: 'listening',
		value: 'Software Engineering Daily, Latent Space.'
	}
] as const;
