<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';

	let { children }: { children: Snippet } = $props();
</script>

<div class="app">
	<header>
		<nav class="container">
			<div class="logo">
				<a href="/">
					<img src="/images/mabear-icon.png" alt="Coding Bear" class="logo-icon" />
					<span>maber.io</span>
				</a>
			</div>
			<ul class="nav-links">
				<li><a href="#about">About</a></li>
				<li><a href="#projects">Projects</a></li>
				<li><a href="#skills">Skills</a></li>
				<li><a href="#contact">Contact</a></li>
			</ul>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>
		<div class="container">
			<p>&copy; {new Date().getFullYear()} - Mike Abernathy. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	header {
		background-color: rgba(30, 30, 30, 0.8);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		padding: var(--space-md) 0;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo a {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: var(--fs-large);
		font-weight: 700;
		letter-spacing: -0.5px;
		transition: filter var(--transition-speed) ease;
	}

	.logo-icon {
		height: 32px;
		width: auto;
		transition: transform var(--transition-speed) ease;
	}

	.logo a:hover .logo-icon {
		transform: rotate(-5deg);
	}

	.logo a span {
		background-image: var(--purple-blue-gradient);
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		background-size: 100% 100%;
		filter: brightness(1.2);
		display: inline-block;
	}

	.logo a:hover {
		filter: brightness(1.2);
	}

	.nav-links {
		display: flex;
		list-style: none;
		gap: var(--space-lg);
		font-weight: var(--fw-medium);
		letter-spacing: 0.3px;
	}

	.nav-links a {
		color: var(--text);
		transition: color var(--transition-speed) ease;
		letter-spacing: 0.3px;
		position: relative;
	}

	.nav-links a::after {
		content: '';
		position: absolute;
		width: 0;
		height: 2px;
		bottom: -4px;
		left: 0;
		background: var(--purple-blue-gradient);
		transition: width var(--transition-speed) ease;
	}

	.nav-links a:hover {
		color: #8b5cf6;
	}

	.nav-links a:hover::after {
		width: 100%;
	}

	main {
		flex: 1;
	}

	footer {
		background-color: rgba(30, 30, 30, 0.8);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
		padding: var(--space-lg) 0;
		text-align: center;
	}

	@media (max-width: 768px) {
		nav {
			flex-direction: column;
			gap: var(--space-md);
		}

		.nav-links {
			flex-wrap: wrap;
			justify-content: center;
			gap: var(--space-md);
		}
	}
</style>
