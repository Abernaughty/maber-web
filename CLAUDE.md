# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing Michael Abernathy's web projects, managed with pnpm workspaces and Turbo. All apps are SvelteKit applications deployed to Vercel.

## Apps

- **landing** (`apps/landing/`) - Main landing page
- **blackjack** (`apps/blackjack/`) - Blackjack game implementation
- **portfolio** (`apps/portfolio/`) - Portfolio site

> **Not in this repo — Pokémon Card Price Checker (`pcpc.maber.io`):** The price checker lives in its own repository, [Abernaughty/PCPC](https://github.com/Abernaughty/PCPC), as a multi-backend showcase (SvelteKit BFF on Vercel + Azure API Management / Functions / Container Apps, Terraform IaC). It was originally developed here under `apps/pcpc` and was consolidated into that repo, which owns its deployment to `pcpc.maber.io`. **Changes to the price checker — including its SvelteKit frontend — belong in `Abernaughty/PCPC` (frontend lives under `frontend/`), not here.**

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

## Architecture

### Tech Stack
- **Framework**: SvelteKit with Vite
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite
- **Deployment**: Vercel with adapter-vercel
- **Type Checking**: TypeScript 5.8+ with svelte-check
- **Package Manager**: pnpm with workspaces
- **Build Tool**: Turbo for monorepo orchestration

### Project Structure
```
maber-web/
├── apps/               # Individual applications
│   ├── landing/
│   ├── blackjack/
│   └── portfolio/
├── packages/          # Shared packages
│   ├── config/       # Build configurations
│   ├── ui/          # Shared components
│   └── utils/       # Utilities
└── turbo.json       # Turbo pipeline configuration
```

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
