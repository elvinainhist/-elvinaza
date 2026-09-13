# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Vue 3 + Vite single-page portfolio site. Currently at the default Vite scaffold stage (`HelloWorld.vue` placeholder content) — treat existing markup/structure as a starting template to be replaced, not an established pattern to preserve.

## Commands

```bash
npm install      # install dependencies
npm run dev       # start Vite dev server with HMR
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

There is no lint, format, or test tooling configured yet. Don't assume `npm test` or `npm run lint` exist.

## Architecture

- Entry point: `src/main.js` mounts `src/App.vue` to `#app` (defined in `index.html`) and imports the single global stylesheet `src/style.css`.
- Components use Vue 3 `<script setup>` SFC syntax (`src/components/*.vue`).
- Static assets imported into components live in `src/assets/`; files referenced directly by URL (favicon, sprite sheet) live in `public/` and are served from the site root (e.g. `/icons.svg`).
- Icons are inlined as a single SVG sprite at `public/icons.svg` with `<symbol id="...">` definitions, referenced from templates via `<svg><use href="/icons.svg#icon-id" /></svg>` rather than individual icon files/components.
