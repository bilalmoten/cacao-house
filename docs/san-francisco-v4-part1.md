# San Francisco V4: waterfront trial and fidelity rebuild

Baseline: `3da145832e5fa3729679f6c3f7e37d0b4ca14abb`. This rebuild follows the two agreed generated targets and independent reviews of real browser screenshots. It replaces the small floating district with a connected shoreline, boulevard, crossing, raised city steps, Ferry arcade and clock tower, broad quay, mooring fingers, cabin boats, suspension bridge and layered green hills.

The workshop has world-scaled brick courses, copper vessels, readable Cacao House lettering, glazed stocked interiors and warm lighting. The sage ingredient warehouse has open loading bays and a delivery van. Procedural geometry, canvas textures, environment lighting, contact shading and actual planar water reflections supply the visual finish; no paid asset service, new dependency or external credit was used.

San Francisco exterior uses perspective framing, bounded drag/scroll pan, two-touch pinch, zoom controls and full recentering. Named places and visible mesh surfaces open the existing business interactions. Place labels avoid controls and show only the active district. Focused cream/green mobile controls expose Explore, Orders and Next week and direct local navigation inside management sheets. The existing engine, save schema and economics are unchanged by this fidelity rebuild. Other cities retain their layouts and rendering path.

## Validation

- `npm ci` passed with Node 24.19.0; final typecheck, all six test files and production build passed. Package and lock files are unchanged.
- Final production browser playtest accepted Leda’s 35-case W1 order, produced 90 cases, dispatched the order, collected its delayed balance, replenished cocoa/sugar/milk through the ingredient UI and traded through W6. W3–W6 cash was $5,945.83, $6,669.66, $7,354.45 and $8,052.79; 90 cases were produced each week. Save state survived reload exactly.
- Browser checks cover drag/scroll pan, recenter, two-touch pinch, gesture suppression of picking, district navigation, actual workshop roof picking, production, ingredient/order navigation and purchases.
- Viewports 320, 375, 390, 768 and 1440 pixels have no document overflow, scroll-reachable purchase controls and horizontally fitting sheets. Oakland, Paris, Turin, Guayaquil and Kyoto passed loading/control smoke checks.
- Independent Sol 6.1 High critique accepted the final actual mobile, desktop and DPR2 phone captures for composition, warm hero materials, landmark hierarchy, legible lettering/controls and continuous bridge cables. Distant scenery and water reflections remain stylistic approximations of the generated targets.
- Baseline and final screenshot pairs retain the same W1 save, waterfront/reset view, 390×844 and 1440×1000 viewports, reduced motion and DPR1. A supplementary native DPR2 phone pair uses the same state and framing. The rebuilt perspective camera intentionally frames the expanded district rather than preserving the old orthographic projection.

## Rendering cost and limits

The richer renderer is more expensive. Under Chromium SwiftShader software WebGL, the original mobile scene delivered about 10 observed frames/second; the final normal-motion scene delivered 7.75 after adaptive quality converged to 0.60 at DPR1. This is a software-GPU comparison, not a physical-phone FPS claim. The interface responded during animation, reduced motion stopped idle rendering and no browser errors were recorded.

Static captures use full quality. Native high-DPR devices cap at 1.5 render pixels per CSS pixel and adaptive quality retains at least one render pixel per CSS pixel. Geometry is spatially batched and offscreen detail is culled; shadow, reflection and contact-shading refreshes are bounded and cached, with immediate camera/state invalidation. Touch movement temporarily bypasses contact shading. Final mobile beauty frames report 336 draw calls / 59,675 triangles; refresh frames include additional shadow/reflection/contact passes, so those counters cannot be compared directly to the old single-pass scene’s 491 / 37,122.

Physical iPhone/Android performance remains unmeasured. The production bundle is about 1.10 MB uncompressed (312 KB gzip), with the existing large-chunk build warning. There is no new backend or cross-device save synchronization.
