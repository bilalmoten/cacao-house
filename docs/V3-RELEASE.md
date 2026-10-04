# Cacao House V3

## Delivered scope

Six distinct, explorable 3D destinations: San Francisco, Oakland, Paris, Turin, Guayaquil and Kyoto. Physical buildings, people, ingredient stores and factory machines open relevant actions. Two districts per destination, camera orbit/zoom/reset, a fixed factory cutaway, and visible production, staff, stock, upgrades and dispatch state. Contemporary SF/Oakland buildings, delivery vans and digital machine controls; the overseas architecture retains local identity.

The authored ten-chapter story connects a first waterfront order, Paris introduction, Turin technique, Guayaquil sourcing, a gianduja pilot and tasting, Oakland commissioning and staffing, Kyoto tea collaboration, repeat customers, debt settlement and a Paris collection gathering. Commercial choices affect cash, quality, reputation, lead times and demand. The story has an ending and open-ended continuation; no forced week-16 ending applies to new V3 houses.

Factories are managed individually on site through Production, Stock, Equipment, People and Standards tabs. Recipe selectors keep production controls focused. An earned operations manager enables remote changes. Persistent production and purchasing rules continue during travel; the booking review states costs, elapsed trading weeks, commitments and stock warnings.

Known cost and capacity feedback sits beside numeric controls. Retail results remain uncertain; an analyst provides ranges. Weekly reports present actual results. News, rivals, quality policies, research, pricing, regional distribution, staffing, recurring buyers and working capital remain commercially connected.

Optional guidance starts with actual world interactions. House identity is optional. The compact main HUD shows location, cash, week, messages/menu and the current goal. There is no persistent dashboard or product tagline. Vintage character images are not used in the V3 interface.

## Verification

- TypeScript: `npm run typecheck` passed.
- Build: `npm run build` passed; production JS `/assets/index-C1EI0TDb.js`, approximately 283 kB gzip. Vite notes the uncompressed Three.js-inclusive bundle exceeds 500 kB.
- Simulation: 48/48 tests passed. These cover overspend/invalid actions, ingredient and capacity blocking, deadlines and refunds, delayed payments, atomic repeated actions, bankruptcy and victory, migrations and malformed saves, deterministic accounts, on-site management, travel, news expiry, uncapped prices and a complete real-action V3 campaign.
- Real-action campaign route reached the Paris ending at week 35 with debt settled and both factories retained. No manually injected cash or completed objectives were used for that route.
- Integrated browser opening exercised Nadia, factory navigation, a production plan, Captain Leda's order, week close, delivery, the next story choice and saved reload.
- 390×844 Chrome touch emulation exercised factory controls, district navigation, the map and typed prices above the previous $80 cap. No horizontal page overflow or application runtime errors were observed.
- Production-build smoke returned HTTP 200 and rendered the final mobile scenes. Imported real-route Oakland and Paris checkpoints; opened the second factory, Paris buyer and atelier; imported the real ending and continued into sandbox. A malformed future-version import preserved the current save.
- Captures in `docs/qa/v3`: `mobile-world.png`, `mobile-factory-controls.png`, `mobile-factory-world.png`, `mobile-paris.png`, `paris-finale.png`. These are actual integrated-game captures of the production build.
- Release deployment/access evidence is recorded separately after publication so the source archive corresponds exactly to the published commit.

## Compatibility and limitations

Save version 6 migrates versions 2–5. Existing houses keep their original campaign semantics and all economic assets; a first-load notice explains how to export and begin the new V3 story. Restart exports the current save first. A preserved pre-V3 copy remains exportable. Saves are browser-local; transfer between Mac and iPhone uses export/import, not cloud synchronization.

This is a world-led management simulation with navigable miniature scenes, not free-avatar movement or editable factory layouts. Staffing and equipment are strategic choices; there is no tile/conveyor minigame. No native installation, backend authentication, payments, outsourced production or multiplayer was added.

Physical iPhone Safari, measured device performance, long-session stability and every alternate business route have not been exhaustively tested. Mobile verification used Chrome touch emulation; the user will perform hands-on phone playtesting. Graphics include reduced-motion behavior, capped pixel ratio, static geometry batching, keyboard place controls and a WebGL fallback.

## Rollback

The prior public version remains saved in Sites as version 2. Local tag `cacao-house-v1.1-rollback` points to `564de2fd24f093d1d628d524900232f8a429ece1`. Deployment is to the existing public Site `appgprj_6ac2459164a881918210ab6805491bf3`, with its access mode and URL unchanged.
