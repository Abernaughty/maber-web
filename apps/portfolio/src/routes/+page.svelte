<script lang="ts">
	import { onMount } from 'svelte';
	import { ProjectCard } from '$lib/components';
	import { getProjects } from '$lib/api';
	import type { Project } from '$lib/api';

	let projects: Project[] = $state([]);
	let loading = $state(false);
	let error: string | null = $state(null);

	onMount(async () => {
		try {
			loading = true;
			projects = await getProjects();
			loading = false;
		} catch (err) {
			loading = false;
			error = err instanceof Error ? err.message : 'Failed to load projects';
			console.error('Error loading projects:', err);
		}
	});

	async function retryFetch() {
		error = null;
		try {
			loading = true;
			projects = await getProjects();
			loading = false;
		} catch (err) {
			loading = false;
			error = err instanceof Error ? err.message : 'Failed to load projects';
		}
	}
</script>

<svelte:head>
	<title>Mike Abernathy | maber.io</title>
	<meta name="description" content="Personal portfolio website showcasing my projects and skills" />
</svelte:head>

<!-- Hero Section -->
<section class="hero">
	<div class="hero-background-image"></div>
	<div class="glass-card-dark hero-container hero-gradient-container">
		<h1><span class="purple-blue-gradient-text">Mike Abernathy</span></h1>
		<p class="tagline">Full-Stack Developer | Cloud Solutions Engineer</p>
		<div class="cta-buttons">
			<a href="#projects" class="hero-gradient-outline-button">View My Work</a>
			<a href="#contact" class="hero-gradient-outline-button">Get In Touch</a>
		</div>
	</div>
</section>

<!-- About Section -->
<section id="about" class="section">
	<div class="container glass-card-dark section-container">
		<h2 class="section-header-gradient">About Me</h2>
		<div class="about-content">
			<div class="about-text">
				<p>
					I'm a Full-Stack Developer with expertise in cloud architecture and modern web technologies.
					I specialize in building scalable, performant applications using Azure cloud services,
					TypeScript, and modern frameworks like SvelteKit. My experience spans from serverless
					architectures to comprehensive design systems, with a focus on clean code, testing, and accessibility.
				</p>
				<p>
					I'm passionate about creating efficient solutions that deliver exceptional user experiences.
					My projects demonstrate proficiency in cloud-native development, API design, performance optimization,
					and modern development practices. I'm always exploring new technologies and best practices to
					deliver high-quality software solutions.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Projects Section -->
<section id="projects" class="section">
	<div class="container glass-card-dark section-container">
		<h2 class="section-header-gradient">My Projects</h2>

		{#if loading}
			<div class="loading-container">
				<p>Loading projects...</p>
			</div>
		{:else if error}
			<div class="error-container">
				<p>Error loading projects: {error}</p>
				<button class="btn" onclick={retryFetch}>Retry</button>
			</div>
		{:else if projects.length === 0}
			<div class="empty-container">
				<p>No projects found.</p>
			</div>
		{:else}
			<div class="card-grid">
				{#each projects as project (project.id)}
					<ProjectCard
						title={project.title}
						description={project.description}
						techStack={project.techStack}
						imageUrl={project.imageUrl}
						liveUrl={project.liveUrl}
						sourceUrl={project.sourceUrl}
					/>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- Skills Section -->
<section id="skills" class="section">
	<div class="container glass-card-dark section-container">
		<h2 class="section-header-gradient">Skills</h2>
		<div class="skills-container">
			<div class="skill-category">
				<h3>Frontend</h3>
				<ul class="skill-list">
					<li>TypeScript</li>
					<li>JavaScript (ES6+)</li>
					<li>Svelte/SvelteKit</li>
					<li>HTML5 & CSS3</li>
					<li>TailwindCSS</li>
					<li>Responsive Design</li>
					<li>Component Architecture</li>
					<li>WebGL/Canvas API</li>
				</ul>
			</div>
			<div class="skill-category">
				<h3>Backend</h3>
				<ul class="skill-list">
					<li>Node.js</li>
					<li>Express.js</li>
					<li>TypeScript</li>
					<li>RESTful APIs</li>
					<li>Azure Functions</li>
					<li>Serverless Architecture</li>
					<li>API Design & Documentation</li>
					<li>Database Design</li>
				</ul>
			</div>
			<div class="skill-category">
				<h3>Cloud & DevOps</h3>
				<ul class="skill-list">
					<li>Azure Static Web Apps</li>
					<li>Azure Cosmos DB</li>
					<li>Azure API Management</li>
					<li>Azure Functions</li>
					<li>GitHub Actions</li>
					<li>CI/CD Pipelines</li>
					<li>Cloud Architecture</li>
					<li>Infrastructure as Code</li>
				</ul>
			</div>
			<div class="skill-category">
				<h3>Development Practices</h3>
				<ul class="skill-list">
					<li>Test-Driven Development</li>
					<li>Vitest/Testing Library</li>
					<li>Accessibility (WCAG 2.1)</li>
					<li>Performance Optimization</li>
					<li>Git Version Control</li>
					<li>ESLint/Prettier</li>
					<li>Code Review</li>
					<li>Agile Methodologies</li>
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- Contact Section -->
<section id="contact" class="section">
	<div class="container glass-card-dark section-container">
		<h2 class="section-header-gradient">Get In Touch</h2>
		<div class="contact-content">
			<p>I'm currently looking for new opportunities and would love to hear from you!</p>
			<div class="contact-methods">
				<div class="contact-method">
					<h3>Email</h3>
					<a href="mailto:jobs@maber.io">jobs@maber.io</a>
				</div>
				<div class="contact-method">
					<h3>GitHub</h3>
					<a href="https://github.com/Abernaughty" target="_blank" rel="noopener noreferrer">github.com/Abernaughty</a>
				</div>
				<div class="contact-method">
					<h3>LinkedIn</h3>
					<a href="https://www.linkedin.com/in/michael-abernathy-674a96217/" target="_blank" rel="noopener noreferrer">linkedin.com/in/michael-abernathy</a>
				</div>
				<div class="contact-method">
					<h3>Resume</h3>
					<a href="https://maberstorageacct.blob.core.windows.net/resume/Michael%20Abernathy%20-%20Resume.pdf" target="_blank" rel="noopener noreferrer" download="Michael_Abernathy_Resume.pdf">Download Resume (PDF)</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.section {
		padding: calc(var(--space-xl) * 0.5) 0;
		margin: calc(var(--space-xl) * 0.1) 0;
	}

	.section-container {
		padding: calc(var(--space-lg) * 1.25);
		border-radius: var(--radius-xl);
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-header-gradient {
		color: var(--blue-color);
		text-align: center;
		margin-bottom: var(--space-lg);
		font-size: var(--fs-xl);
		font-weight: var(--fw-bold);
		width: fit-content;
		margin-left: auto;
		margin-right: auto;
		padding: 0;
	}

	.hero {
		padding: var(--space-xl) 0;
		position: relative;
		text-align: center;
		background-color: transparent;
		color: white;
		overflow: hidden;
		min-height: 500px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-container {
		position: relative;
		z-index: 2;
		padding: 3rem;
		max-width: 800px;
		text-align: center;
		border-radius: var(--radius-xl);
	}

	.glass-card-dark {
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.hero-gradient-container {
		--hero-gradient: var(--purple-blue-gradient);
		position: relative;
	}

	.hero-container h1,
	.hero-container p,
	.hero-container a {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.purple-blue-gradient-text {
		background-image: var(--hero-gradient);
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		display: inline-block;
		background-size: 100% 100%;
		filter: brightness(1.2);
	}

	.hero-gradient-outline-button {
		display: inline-block;
		padding: 11px 24px;
		background: rgba(0, 0, 0, 0.25);
		color: white;
		font-weight: 500;
		font-size: 16px;
		letter-spacing: 0.5px;
		border-radius: 8px;
		position: relative;
		transition: all 0.3s ease;
		z-index: 1;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	.hero-gradient-outline-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 8px;
		padding: 2px;
		background: var(--hero-gradient);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		z-index: -1;
	}

	.hero-gradient-outline-button:hover {
		background: rgba(0, 0, 0, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.2);
		color: white;
	}

	.hero-gradient-outline-button:hover::before {
		filter: brightness(1.2);
	}

	.hero-background-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		background-image: url('/images/bear-coding.png');
		background-size: cover;
		background-position: center;
		filter: brightness(0.85);
	}

	.tagline {
		font-size: var(--fs-medium);
		margin-bottom: var(--space-lg);
	}

	.cta-buttons {
		display: flex;
		gap: var(--space-md);
		justify-content: center;
	}

	.about-content {
		display: flex;
		gap: var(--space-lg);
		align-items: center;
	}

	.about-text {
		flex: 2;
	}

	.skills-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--space-lg);
	}

	.skill-category {
		background-color: var(--surface);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-md);
		padding: var(--space-lg);
		transition: all 0.3s ease;
	}

	.skill-category:hover {
		transform: translateY(-5px);
	}

	.skill-category h3 {
		color: var(--blue-color);
		margin-bottom: var(--space-md);
		text-align: center;
	}

	.skill-list {
		list-style-position: inside;
		margin-top: var(--space-sm);
	}

	.skill-list li {
		margin-bottom: var(--space-sm);
	}

	.contact-content {
		max-width: 600px;
		margin: 0 auto;
		text-align: center;
	}

	.contact-methods {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--space-lg);
		margin-top: var(--space-lg);
	}

	.contact-method {
		padding: var(--space-md);
		background-color: var(--surface);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-md);
		text-align: center;
		transition: all 0.3s ease;
	}

	.contact-method:hover {
		transform: translateY(-5px);
	}

	.contact-method h3 {
		margin-bottom: var(--space-sm);
	}

	.contact-method a {
		color: var(--blue-color);
		transition: all 0.3s ease;
		white-space: nowrap;
		display: inline-block;
	}

	.contact-method a:hover {
		text-decoration: underline;
	}

	.loading-container,
	.error-container,
	.empty-container {
		padding: var(--space-lg);
		text-align: center;
		background-color: var(--surface);
		border-radius: var(--border-radius);
		margin: var(--space-lg) 0;
	}

	.error-container {
		color: var(--accent);
		border: 1px solid var(--accent);
	}

	.error-container button {
		margin-top: var(--space-md);
	}

	@media (max-width: 480px) {
		.hero-container {
			padding: 2rem 1rem;
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
			gap: var(--space-sm);
		}

		.about-content {
			flex-direction: column;
		}

		.contact-methods {
			flex-direction: column;
			align-items: center;
			gap: var(--space-sm);
		}

		.contact-method {
			width: 100%;
			max-width: 280px;
		}

		.skills-container {
			grid-template-columns: 1fr;
			gap: var(--space-md);
		}

		.section-container {
			padding: var(--space-lg);
		}
	}

	@media (min-width: 481px) and (max-width: 768px) {
		.hero-container {
			padding: 2.5rem 1.5rem;
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
			gap: var(--space-sm);
		}

		.about-content {
			flex-direction: column;
		}

		.contact-methods {
			justify-content: space-around;
			gap: var(--space-sm);
		}

		.skills-container {
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		}
	}

	@media (min-width: 769px) {
		.contact-methods {
			flex-wrap: wrap;
		}
	}
</style>
