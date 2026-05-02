/**
 * Contact rows — the closing CTA section's `[label] [value] [arrow]` list.
 *
 * EMAIL is `mike@maber.io` per spec §3 (replaces the v1 `jobs@maber.io`).
 * SCHEDULE points at a placeholder Cal.com URL — replace with the real one
 * when the booking link is set up, or filter the row out if you decide not
 * to surface scheduling at all (per spec §9.2).
 *
 * RESUME points at the existing Azure blob — same URL the v1 site uses.
 * Update if the blob path changes.
 */

export interface ContactRow {
	/** Uppercase label rendered with letter-spacing. */
	label: string;
	/** Display value (the user-readable string). */
	value: string;
	/** href; omit for plain-text rows like CLEARANCE. */
	href?: string;
	/** When set, mark as external — render with target="_blank" rel etc. */
	external?: boolean;
	/** Optional download attribute filename. */
	download?: string;
}

export const EMAIL = 'mike@maber.io';

export const CONTACT_ROWS: readonly ContactRow[] = [
	{
		label: 'email',
		value: EMAIL,
		href: `mailto:${EMAIL}`
	},
	{
		label: 'schedule',
		// TODO: replace with real Cal.com URL once booking link is set up.
		// If you decide not to surface scheduling, remove this entry per spec §9.2.
		value: 'cal.com/mike-abernathy',
		href: 'https://cal.com/mike-abernathy',
		external: true
	},
	{
		label: 'github',
		value: 'github.com/Abernaughty',
		href: 'https://github.com/Abernaughty',
		external: true
	},
	{
		label: 'linkedin',
		value: 'linkedin.com/in/michael-abernathy',
		href: 'https://www.linkedin.com/in/michael-abernathy-674a96217/',
		external: true
	},
	{
		label: 'resume',
		value: 'Michael_Abernathy_Resume.pdf',
		href: 'https://maberstorageacct.blob.core.windows.net/resume/Michael%20Abernathy%20-%20Resume.pdf',
		external: true,
		download: 'Michael_Abernathy_Resume.pdf'
	},
	{
		// No href — clearance line is intentionally not a link, just a credential.
		label: 'clearance',
		value: 'US Citizen, eligible for SECRET'
	}
] as const;
