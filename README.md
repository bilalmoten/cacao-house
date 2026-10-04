# Cacao House · The Maravel Ledger

An original, world-led chocolate business strategy game made for Bilal Moten. A sixteen-week authored campaign in the fictional harbour city of Maravel, with sandbox continuation. React, TypeScript, Vite and Three.js; a separate deterministic simulation; no game backend, payments or account system. Sites supplies private delivery.

## Play

Begin with Nadia’s letter, then tap a building or the labelled visit bar. Drag the world to orbit; pinch or use +/− to zoom. Enter the fixed-layout workshop to see the copper machinery. Locations open contextual decision panels while keeping the world visible. Close a week only when your plan is ready. There is no planning timer.

One output case contains 20 bars. Manage six products, ingredient quality and supplier lead times, capacity and changeovers, prices and demand, commissions and payment delays, research, factory investment, reputation, rival response and market expansion. The campaign requires all five charter conditions by the close of week sixteen: repay the note, fulfil four contracts, deliver one researched signature recipe, open two markets and reach 65 reputation.

The house saves automatically in this browser. Export/import in the House menu transfers a save between devices. Saves are local, not cloud-synchronised. Sound starts off. Reduced-motion preferences stop ambient animation. The city remains playable through location controls if WebGL cannot initialise.

## Develop

Requires Node 22.13+.

- `npm ci` — install the locked dependency set
- `npm run dev` — local server, http://127.0.0.1:5173
- `npm run typecheck` — TypeScript validation
- `npm test` — 21 deterministic regressions, including 40 complete campaign simulations
- `npm run build` — static production output in `dist/`
- `npm start` — preview the production build, http://127.0.0.1:4173

## Structure

- `game/engine.ts`: guarded, deterministic economy, content and version-2 save validation
- `src/App.tsx`: business decisions, story letters, menu, autosave and transfer
- `src/world/scene.ts`: original procedural 3D town/workshop, picking, animation and state-linked props
- `src/world/WorldView.tsx`: world HUD, locations and character encounters
- `src/ProductArt.tsx`: six original dimensional chocolate illustrations and discovery clues
- `tests/engine.test.mjs`: economy regressions and viable citrus/praline campaign routes
- `docs/QA.md`: checked behaviour and honest platform limitations
- `docs/*art-prompt.txt`: provenance for original generated character/workshop artwork
- `.openai/hosting.json`: registered Site identity; reuse it for future updates

The factory layout is fixed. Upgrades change business capabilities and visible equipment; this is not a tile-placement or conveyor-building game. Three.js displays state, never determines economic outcomes. Static geometry is batched, device pixel ratio is capped, animation is limited to 30 fps and suspended while hidden. Render performance on a physical iPhone is not yet measured.

## Economy timing

Wages must be affordable before sales. Eligible stock is reserved for contracts; ready orders dispatch after production and before retail/deadline checks. Due balances collect at the end of their listed week. Sea shipments arrive at the beginning of their listed week. New cooperative orders in weeks six and seven take an extra week; cocoa prices rise during weeks six through nine. Forecast demand has deterministic ±9% variation. Bars expire after their third selling week; ganache after its first.

Reports reconcile the week-opening till with all planning and settlement cash flows. Trading profit includes full dispatched contract revenue and goods cost, separately from deposits, financing, research and capital investment. Deposit refunds are not booked as an expense twice.

## Art and references

All names, story text, characters, procedural models, product illustrations and interface assets are original. Chocolatier inspired the travel/character/trade structure; Coffee Inc 2 informed scope and world-first presentation. No reference-game assets or code are shipped. Official Three.js OrbitControls and geometry utilities are used under the package licence. The bundled UI components and development dependencies retain their licences.
