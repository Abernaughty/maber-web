<script lang="ts">
	let menuOpen = $state(false);

	function toggleMenu() {
		menuOpen = !menuOpen;
	}
</script>

<header class="header">
	<div class="header-left">
		<img src="/images/bear-icon.png" alt="Bear Icon" class="header-icon" />
		<img src="/images/maber-logo.png" alt="maber.io" class="header-logo" />
	</div>

	<button
		class="mobile-menu-toggle"
		class:active={menuOpen}
		onclick={toggleMenu}
		aria-label="Toggle navigation menu"
		aria-expanded={menuOpen}
	>
		<div class="hamburger">
			<span></span>
			<span></span>
			<span></span>
		</div>
	</button>

	<nav class="header-right mobile-menu" class:active={menuOpen}>
		<a href="https://blackjack.maber.io" class="nav-link" target="_blank" rel="noopener">
			<img src="/images/Blackjack.png" alt="Blackjack" class="header-nav-img" />
		</a>
		<a href="https://pcpc.maber.io" class="nav-link" target="_blank" rel="noopener">
			<img src="/images/PokeData.png" alt="PCPC" class="header-nav-img" />
		</a>
		<a href="https://dev.maber.io" class="nav-link portfolio-link" target="_blank" rel="noopener">
			<img src="/images/Portfolio.png" alt="Portfolio" class="header-portfolio" />
		</a>
	</nav>
</header>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		min-height: 68px;
		height: auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30px;
		background-color: rgba(0, 0, 0, 0.75);
		background-image: linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.08) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		z-index: 20;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
	}

	.header-left {
		display: flex;
		align-items: center;
	}

	.header-icon {
		max-height: 68px;
		height: auto;
		width: auto;
		transition: transform 0.3s ease;
	}

	.header-icon:hover {
		transform: scale(1.05);
	}

	.header-logo {
		max-height: 68px;
		height: auto;
		width: auto;
		margin-left: 15px;
		object-fit: contain;
	}

	.header-right {
		display: flex;
		align-items: center;
		height: 100%;
	}

	.nav-link,
	.portfolio-link {
		display: flex;
		align-items: center;
		height: 100%;
		margin-left: 15px;
	}

	.header-nav-img,
	.header-portfolio {
		max-height: 54px;
		height: auto;
		width: auto;
		transition: transform 0.3s ease;
		object-fit: contain;
	}

	.header-nav-img:hover,
	.header-portfolio:hover {
		transform: scale(1.05);
	}

	/* Hamburger */
	.mobile-menu-toggle {
		display: none;
		cursor: pointer;
		z-index: 30;
		background: none;
		border: none;
		padding: 12px;
	}

	.hamburger {
		width: 35px;
		height: 25px;
		position: relative;
	}

	.hamburger span {
		display: block;
		position: absolute;
		height: 4px;
		width: 100%;
		background: #fff;
		background: linear-gradient(90deg, #ffd700, #ff1493, #00e5ff, #00cc66);
		border-radius: 4px;
		opacity: 1;
		left: 0;
		transform: rotate(0deg);
		transition: 0.25s ease-in-out;
		box-shadow: 0 0 5px rgba(0, 229, 255, 0.8);
	}

	.hamburger span:nth-child(1) {
		top: 0;
	}
	.hamburger span:nth-child(2) {
		top: 10px;
	}
	.hamburger span:nth-child(3) {
		top: 20px;
	}

	/* Responsive */
	@media screen and (max-width: 768px) {
		.header {
			padding: 0 15px;
			min-height: 54px;
		}

		.header-icon,
		.header-logo {
			max-height: 54px;
		}

		.header-nav-img,
		.header-portfolio {
			max-height: 40px;
		}

		.nav-link,
		.portfolio-link {
			margin-left: 10px;
		}
	}

	@media screen and (max-width: 767px) {
		.header {
			padding: 0 10px;
		}

		.header-left {
			flex: 0 0 auto;
		}

		.mobile-menu-toggle {
			display: block;
			margin-left: auto;
			margin-right: 10px;
			background-color: rgba(0, 0, 0, 0.75);
			background-image: linear-gradient(
				to bottom,
				rgba(255, 255, 255, 0.08) 0%,
				rgba(255, 255, 255, 0.02) 100%
			);
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
			border-radius: 4px;
			border: 1px solid rgba(255, 255, 255, 0.1);
			box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
		}

		.header-right {
			position: fixed;
			top: 54px;
			left: 0;
			width: 100%;
			height: 0;
			flex-direction: column;
			background-color: rgba(0, 0, 0, 0.9);
			overflow: hidden;
			transition: height 0.3s ease;
			z-index: 25;
			padding: 0;
		}

		.header-right.active {
			height: auto;
			padding: 15px 0;
			max-height: 80vh;
			overflow-y: auto;
		}

		.nav-link,
		.portfolio-link {
			width: 100%;
			margin: 15px 0;
			justify-content: center;
			height: auto;
			padding: 10px 0;
		}

		.header-nav-img,
		.header-portfolio {
			max-height: 50px;
		}

		/* Hamburger animation */
		.mobile-menu-toggle.active .hamburger span:nth-child(1) {
			top: 10px;
			transform: rotate(45deg);
		}

		.mobile-menu-toggle.active .hamburger span:nth-child(2) {
			opacity: 0;
		}

		.mobile-menu-toggle.active .hamburger span:nth-child(3) {
			top: 10px;
			transform: rotate(-45deg);
		}

		.mobile-menu-toggle:hover .hamburger span {
			box-shadow: 0 0 5px rgba(255, 255, 255, 0.9);
		}

		.header-icon {
			max-height: 48px;
		}

		.header-logo {
			max-height: 48px;
			margin-left: 8px;
		}
	}
</style>
