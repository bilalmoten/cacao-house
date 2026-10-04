# V1 verification · 4 October 2026

## Automated simulation

21/21 tests pass. Includes 40 complete sixteen-week campaigns (20 demand seeds each for citrus and praline strategies), both with all five victory conditions. Checks atomic overspending/invalid actions, insufficient stock and wages, capacity, conservation, due-week dispatch, mixed-quality reservation, repeated rewards, deposits, delayed collection, deadline penalties, storm arrivals, research/upgrades, bankruptcy precedence, campaign review, sandbox continuation, deterministic replay and versioned/corrupt saves. Accounting regressions cover manual versus automatic dispatch, all planning cash flows, returned deposits, exact shelf life and higher-quality inventory allocation.

## Browser gameplay

Chromium local browser, actual rendered game and real interface actions:

- Complete sixteen-week campaign through the 3D world’s location panels. Four commissions, one signature recipe, quality and capacity investments, research, immediate and cooperative purchases, growers/independence/festival choices, Hill expansion, full repayment, victory and sandbox continuation. Final cash $8,154.33, reputation 98, no debt. Reload retained week 17.
- Actual 3D mesh raycast selects the workshop; named location controls, camera drag/orbit, zoom/reset and town/workshop switching work. Character encounters open relevant panels; all six business panels remain usable.
- Desktop 1440 CSS pixels, tablet 768 and phone 390/375/320: all six panels checked for document/panel overflow. The final checks assert the actual CSS viewport width, after correcting an inherited 80% zoom in an earlier browser origin. Those earlier blockout screenshots were visual work in progress.
- Export/import exact-state round trip, reload, corrupt JSON and unsupported-version rejection, restart cancel/confirm, fractional plan rejection, unaffordable order prevention and blocked overcapacity/short-stock production.
- UI-imported valid fixtures verify deadline failure/refund and bankruptcy ending. Two synchronous clicks on close confirmation advance exactly one week.
- Animated canvas pixels change in normal mode and remain unchanged under reduced motion. A separate touch-enabled 390×844 Chromium context passed location taps, panel navigation and zoom buttons; two-finger pinch events were dispatched. This is browser emulation, not an iPhone device.
- A fresh browser origin starts with Nadia’s opening letter and week-one defaults. Saves from testing are not embedded in the production source.
- World screenshots visually inspected at desktop/phone sizes, including factory, character card and product collection. Original model detail and interface readability were revised after inspection.

- Production bundle smoke test passed on the local preview server: fresh opening, first commission, close week, reload and 3D workshop. No page runtime errors. TypeScript and Vite production build pass. JavaScript is 293.8 kB gzipped; both original raster assets total about 606 kB in WebP format.

## Limits

The 3D world is a stylised, bounded city diorama and fixed workshop, not a walkable open-world game. Economic progression changes equipment, stock stacks, trial vessels, market flags, waiting buyers, shipping and production activity. Background townspeople and moored boats are ambience; their movement is not a separate simulation.

No physical iPhone or iPhone Safari was available. Responsive and touch emulation in Chromium cannot establish real Safari GPU performance, thermals, audio behaviour or browser-storage retention. Mac Safari and Firefox were not tested. The current browser does not expose WebMCP, so the feature-detected optional tools were not exercised. There is no cloud-save synchronisation. A cleared browser store loses local progress unless exported.

Deployment success and exact private URL are recorded in the handoff after the native Sites deployment result; local build success alone is not deployment verification.
