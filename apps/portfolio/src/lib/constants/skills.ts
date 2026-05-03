/**
 * Skills inventory grouped by category.
 *
 * Categories ordered to lead with cloud/platform strengths (defense-sector
 * recruiter audience per spec §1). Each list is curated — the goal is
 * "things I actually ship with" rather than buzzword soup. Spec §3 Skills
 * subtitle reinforces this: "dropping the buzzword soup".
 *
 * Add a 7th category (FRONT-END) only if it fits the grid without crowding.
 */

export interface SkillCategory {
	/** Display name (uppercase in the grid). */
	name: string;
	/** Skills as plain strings — no nested structure. */
	skills: readonly string[];
}

export const SKILLS: readonly SkillCategory[] = [
	{
		name: 'cloud',
		skills: [
			'Azure Functions',
			'Static Web Apps',
			'Cosmos DB',
			'API Management',
			'Lighthouse',
			'Blueprints',
			'Batch',
			'Cloud Services'
		]
	},
	{
		name: 'iac',
		skills: ['Terraform', 'Bicep', 'ARM', 'Azure Policy', 'Resource Graph']
	},
	{
		name: 'ci/cd',
		skills: ['Azure DevOps Pipelines', 'GitHub Actions', 'tfsec', 'Checkov']
	},
	{
		name: 'observability',
		skills: [
			'Azure Monitor',
			'Log Analytics',
			'App Gateway diagnostics',
			'KQL'
		]
	},
	{
		name: 'security',
		skills: [
			'RBAC',
			'governance',
			'private endpoints',
			'VNet / subnetting',
			'ExpressRoute'
		]
	},
	{
		name: 'languages',
		skills: ['PowerShell', 'Python', 'TypeScript', 'SQL (MySQL, KQL)', 'Bash']
	}
] as const;
