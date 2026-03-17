# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing Michael Abernathy's web projects, managed with pnpm workspaces and Turbo. All apps are SvelteKit applications deployed to Vercel.

## Apps

- **landing** (`apps/landing/`) - Main landing page
- **pcpc** (`apps/pcpc/`) - Pokémon Card Price Checker with Azure Cosmos DB and Redis integration
- **blackjack** (`apps/blackjack/`) - Blackjack game implementation
- **portfolio** (`apps/portfolio/`) - Portfolio site

## Shared Packages

- **@maber/config** - Shared ESLint, TypeScript, and Tailwind configurations
- **@maber/ui** - Shared UI components
- **@maber/utils** - Shared utility functions

## Common Commands

### Root Level (all apps)
```bash
pnpm install              # Install all dependencies
pnpm build                # Build all apps
pnpm dev                  # Run all apps in dev mode
pnpm lint                 # Lint all apps
pnpm check                # Type check all apps
pnpm test                 # Run tests for all apps
pnpm format               # Format code with Prettier
pnpm format:check         # Check formatting
```

### App-specific development
```bash
cd apps/[app-name]
pnpm dev                  # Start dev server (default port varies by app)
pnpm build                # Build for production
pnpm preview              # Preview production build
pnpm check                # Run svelte-check
pnpm lint                 # Run ESLint
```

### PCPC-specific
```bash
cd apps/pcpc
pnpm test                 # Run Vitest tests
```

## Architecture

### Tech Stack
- **Framework**: SvelteKit with Vite
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite
- **Deployment**: Vercel with adapter-vercel
- **Type Checking**: TypeScript 5.8+ with svelte-check
- **Package Manager**: pnpm with workspaces
- **Build Tool**: Turbo for monorepo orchestration

### PCPC Architecture
- **Frontend**: SvelteKit with server-side rendering
- **Backend Services**:
  - Azure Cosmos DB for card and set data storage
  - Redis for caching (optional)
  - Integration with PokeData and Pokemon TCG APIs
- **Environment Variables**: Configure in `.env` (see `apps/pcpc/.env.example`)

### Project Structure
```
maber-web/
├── apps/               # Individual applications
│   ├── landing/
│   ├── pcpc/
│   ├── blackjack/
│   └── portfolio/
├── packages/          # Shared packages
│   ├── config/       # Build configurations
│   ├── ui/          # Shared components
│   └── utils/       # Utilities
└── turbo.json       # Turbo pipeline configuration
```

## Environment Setup

For PCPC app, create `.env` from `.env.example`:
- Azure Cosmos DB connection details
- Redis connection (optional)
- API keys for PokeData and Pokemon TCG APIs
- Cache TTL configurations

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to main:
1. Install dependencies with frozen lockfile
2. Run linting
3. Type checking
4. Build all apps
5. Run tests

## Deployment

All apps deploy automatically to Vercel on push to main. Each app has its own `vercel.json` with:
- Framework set to "sveltekit"
- Custom install command for pnpm
- Security headers configuration