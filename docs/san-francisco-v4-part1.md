# San Francisco V4, part 1

Baseline: `3da145832e5fa3729679f6c3f7e37d0b4ca14abb`.

This experiment rebuilds the San Francisco waterfront as procedural Three.js geometry: a copper-vessel workshop, ingredient depot, Ferry Building, connected streets and steps, harbor, cable car and distant bridge. It adds bounded pan/scroll navigation, pinch zoom, reliable recentering, surface-based picking and district-aware interaction. Mobile controls expose Explore, Orders and Next week, with direct local business navigation inside focused management sheets. Other cities retain their layouts and business rules. No paid asset services or new dependencies were used.

The engine, save schema and economic rules are unchanged. A story-progress sentence now acknowledges a delivered order. San Francisco offers open automatically when there are no commitments; accepting an offer switches to commitments.

## Validation

- Dependency installation (`npm ci`, Node 24.19.0), typecheck, engine tests and production build passed.
- Browser playtest: accepted the 35-case Leda order in W1, produced 90 cases, dispatched it and collected its delayed balance in W2. Replenished cocoa, sugar and milk through the ingredient UI and traded through W6. Each subsequent week produced 90 cases; cash at W3–W6 was $5,945.83, $6,669.66, $7,354.45 and $8,052.79. Save state survived reload exactly.
- Browser checks cover drag and scroll pan, recenter, two-touch pinch, gesture suppression of picking, district navigation, actual workshop roof picking, interior production, ingredient/order panel navigation and purchases.
- Viewports 320, 375, 390, 768 and 1440 pixels: no document overflow; ingredient quantity/purchase controls reachable by scrolling; sheets fit horizontally.
- Independent screenshot critique found no release blocker. Supply and workshop sheets cover most of the mobile viewport; they are focused task screens rather than half-height cards.
- Baseline and final captures use identical W1 save, waterfront camera, 390×844 and 1440×1000 viewports, reduced motion and device pixel ratio 1. Baseline: 491 draw calls / 37,122 triangles; final mobile: 331 / 41,070. Draw calls decreased about 33%; geometry increased about 11%. These are renderer counters, not physical-phone frame-rate benchmarks.

## Limits

Procedural geometry intentionally approximates the generated visual direction; it does not reproduce the target image's photographic lighting or exact composition. Trading and rendering checks use desktop Chromium with mobile touch emulation and software WebGL, not physical iPhone/Android hardware. The existing application bundle remains about 1 MB uncompressed (290 KB gzip); build reports a chunk-size warning. There is no new backend or cross-device save synchronization.
