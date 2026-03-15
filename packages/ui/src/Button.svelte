<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { variant = 'primary', size = 'md', children, class: className = '', ...rest }: Props = $props();

	const variants = {
		primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
		secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
		ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};
</script>

<button
	class="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none {variants[variant]} {sizes[size]} {className}"
	{...rest}
>
	{@render children()}
</button>
