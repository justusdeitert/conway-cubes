# Copilot Instructions for conway-cubes

## Style

- Do not use em dashes (`—`, `U+2014`). Rephrase instead of substituting with hyphens.

## Overview

- Conway's Game of Life rendered in 3D using Three.js with WebGL.
- Deployed to Netlify as a static site.

## Tech Stack

- **Runtime:** Browser (ESM, no framework)
- **Language:** Plain JavaScript, SCSS
- **3D Rendering:** Three.js (`InstancedMesh` for performance)
- **CSS Utilities:** UnoCSS (Uno preset + Icons preset)
- **Build:** Vite
- **Formatting:** Prettier (4-space indent, single quotes, trailing commas)

## Package Manager

- This project uses **yarn**. Always use `yarn` commands instead of `npm`.

## Project Structure

- `src/main.js` - Entry point, wires up game modules
- `src/game/grid.js` - Grid state, neighbor cache, tick logic
- `src/game/cell.js` - Cell state helpers
- `src/game/renderer.js` - Three.js scene, instanced mesh rendering
- `src/game/patterns.js` - Pattern presets (Glider, Pulsar, etc.)
- `src/ui/controls.js` - UI controls (rules, grid size, rotation, patterns)
- `src/styles/main.scss` - Global styles
- `uno.config.js` - UnoCSS theme and presets
- `vite.config.js` - Vite + UnoCSS plugin

## Development

- `yarn dev` starts the dev server
- `yarn build` builds for production
- `yarn preview` previews the production build

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes: `feat:`, `fix:`, `refactor:`, `style:`, `perf:`, `test:`, `docs:`, `chore:`
- Title: short imperative summary, lowercase after prefix (e.g. `feat: add rotation control`)
- Do not repeat the prefix as a verb (e.g. `fix: broken scroll`, not `fix: fix broken scroll`)
- Body only when needed; flat bullet list, no category headers, max 10 items
- Use `->` for version transitions (e.g. `three 0.17->0.18`)

Before committing, review every changed file:

- No leftover debug code (`console.log`, commented-out blocks, `TODO` hacks)
- No dead code (unused imports, variables, functions, CSS rules)
- No duplicate declarations
- Logic is correct: no off-by-one errors, missing null checks, or broken conditions
- Code is concise and names are consistent with the rest of the codebase
- Only related changes are included: no unrelated drive-by edits

