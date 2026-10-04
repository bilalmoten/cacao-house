# Cacao House V3

An original browser strategy game made for Bilal Moten. Explore six 3D destinations, operate fixed-layout chocolate factories and build a house through a connected ten-chapter campaign. React, TypeScript, Vite and Three.js; deterministic simulation; no game backend, accounts, payments or marketing features.

## Play

Meet Nadia, inspect a batch at the workshop and serve the waterfront customer. Follow your contacts to Paris, Turin, Guayaquil, Oakland and Kyoto. Tap buildings, people and machines to open focused decisions. Drag to orbit, pinch or use camera buttons to zoom. Each factory has its own production, stock, equipment, people and standards tabs. Factory settings require an on-site visit until an operations manager is earned and hired.

Products, quality, supplier prices and lead times, manufacturing capacity, product prices, customer orders, payment delays, research, staffing, purchasing rules, repeat buyers, rivals and regional distribution interact. Saved production continues while travelling. Booking shows elapsed trading weeks, costs and warnings. Actual weekly results show what sold; retail forecasts become uncertain ranges only after hiring an analyst.

The story ends at a visible Paris collection gathering after the house has developed its recipes, operated Oakland, fulfilled its promises and settled its loan. Continue into open-ended play with everything retained. There is no real-time planning clock and no forced week-16 deadline in a new V3 story.

## Saves and compatibility

Autosaves are local to this browser. Settings exports/imports a JSON save to move between Mac and iPhone. New games use save version 6; versions 2–5 migrate without losing the original house, rules or campaign. Existing houses keep their original campaign semantics. Start a new V3 story from Settings to play the authored journey; the current house exports first. A preserved pre-V3 save can also be exported from Settings. No cloud synchronization is provided.

## Development

Node 22.13+ is required. Use `npm ci`, `npm run dev`, `npm run typecheck`, `npm test`, `npm run build` and `npm start`. The static build is `dist/`. The 48 deterministic tests include guarded transactions, stock and capacity, deadlines, delayed payments, bankruptcy/victory, migrations, on-site management, travel, uncertainty and a complete real-action V3 route.

- `game/engine.ts`, `growth.ts`, `travel.ts`, `journey.ts`: simulation and save validation.
- `src/App.tsx`: world navigation, contextual interface, story, saves and audio.
- `src/v3/`: focused business panels and numeric controls.
- `src/world/V3World.tsx`, `scene.ts`: original procedural worlds, picking, camera, animation and state-linked props.
- `docs/V3-RELEASE.md`: release scope, verification and limitations.
- `.openai/hosting.json`: existing Site identity; preserve it for updates.

## Scope and art

This is a strategy game with navigable miniature destinations, not an avatar-based open world or conveyor-placement game. Factory layouts are fixed; upgrades and business state change their visible equipment and activity. People, businesses, story, procedural models and product illustrations are original. Real destinations provide commercial context. No Chocolatier or Coffee Inc assets or code are shipped. Older generated artwork remains in the source history but is not used by the V3 contact interface.

Reduced motion follows the device preference; sound is optional. Rendering caps pixel ratio, batches static geometry and pauses when hidden. Keyboard-accessible place buttons and a WebGL fallback preserve actions. Physical iPhone Safari performance and long-session stability remain for user playtesting.
