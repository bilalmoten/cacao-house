# Call-feedback revision — verified locally, not deployed

4 October 2026. This changes only the authorized v1 feedback scope. Phase 2 and Phase 3 have not started. The live Site remains the previously published v1; no publication or sharing settings were changed.

## Implemented

- A map building opens its business panel immediately. The workshop building enters the workshop; its production control then opens the production panel. No intermediate location-card confirmation.
- Nadia, Mara and Rafi guide real production, accepting the first order, the week-one cash result, immediate restocking, a delayed cooperative delivery, and week-two results. Progress is saved; the guide can be hidden and resumed. Production blockers take precedence over a ready message.
- Separate raw ingredient lots retain acquisition quality and cost. Every product saves ingredient-grade preferences and fallback rules. Explicit preferred grades are allocated across all products first; then remaining stock is allocated in saved product priority order. Preview and settlement share the allocator. Contract-quality warnings show when planned/fallback quality is too low.
- All four global metrics remain visible: clickable cash details, reputation, used/available factory hours, workshop note. Settings, tutorial/help and Messages remain available from the map or a panel. Repeated panel header stats were removed.
- Messages contains all historically available business updates, including recorded choices. Acknowledge & close preserves the message in history and does not repeat its financial effect.
- Each ingredient saves its last successful supplier and quantity. Supplier quality fixes its purchase grade. Repeat buys execute with one click using today's price and lead time. Quantities, affordability and terminal game status are validated atomically. Rounded totals handle exact-cash purchases correctly.
- Shorter contemporary business copy and restrained interface typography. Original map, artwork, models and animation are unchanged. Unused modern portraits were not applied.
- Save format v3 migrates v2 stock balances into legacy lots at their exact stored quantity, cost and quality. Old blended inventory cannot be historically separated; new purchases remain separate. Existing browser storage keys are retained. No raw-material expiration was added.

## Positioning finding — no rebalance

At the same fresh-game $20 dark-bar price, expected demand is 74 value / 67 standard / 62 premium. The old model deliberately favors value positioning for Everyday customers; Gift and Connoisseur customers favor premium. Production cost is not an input to demand. The misleading wrapper-upgrade wording was changed to positioning, and an always-visible comparison BEFORE the choice shows the audience, cost, margin and demand for all three positions. Pricing & product fit remains available. No segment multipliers or price elasticities changed.

## Verification

- TypeScript, production build and `git diff --check`: pass. Vite retains its advisory about a >500 kB uncompressed chunk; final JavaScript is 298.19 kB gzip.
- **34 engine tests pass**, including the existing **40 sixteen-week campaigns** across two strategies and 20 demand seeds each.
- Independent randomized allocator review: **500 states**, 380 successful settlements and 120 intended production blocks. Source-state immutability, forecast/actual cash reconciliation after retail variance, and save round trips passed. A **120-week sandbox** remained playable at week 121 with $90,525.33. Review found guide readiness, stale imported serial IDs and exact-cash UI rounding issues; all were corrected and exercised again.
- **Complete rendered UI campaign**: 16 weeks, four contracts, one researched signature contract, quality/capacity upgrades, immediate and delayed sourcing, story decisions, market expansion and loan repayment. Won at week 17 with **$8,154.33 cash, 98 reputation, $0 debt**, then continued to sandbox and reloaded.
- Real guided weeks 1–2: accepted and fulfilled first order; immediately bought 47 kg cocoa and 27 kg sugar; ordered 40 kg cooperative cocoa arriving week 4. Closing/reopening, cancelling week close and refresh retained the guide and game state.
- Imported real v2 week-17 sandbox and v2 week-two fixtures; migrated to v3 without changing campaign outcomes. Old completed players received no guide. Hide/reload/resume worked for early saves. Inbox displayed all eight historical messages and the recorded sourcing decision.
- UI tested saved grade/fallback choices, one-click repeat execution, exact $55.58 cash purchase, disabled unaffordable second repeat, strict grade shortage warning, direct map navigation, global settings/help access and responsive widths **320 / 390 / 768 / 1440**.
- Separate **390×844 touch-enabled Chromium** context tested taps, saved grades, message inbox and guided start. Screenshots were visually inspected. No physical iPhone, iPhone Safari, Mac Safari or Firefox test was available.
- **Final production bundle smoke**: first order, production, reload, v3 save and two synchronous close clicks advancing exactly once. Week 2: 90 cases produced, one fulfilled contract, $4,647.50 cash, no page errors.

Supporting browser scripts, randomized probes, a v2 save fixture and final screenshots are in `docs/qa/revision/`. Run fixture generation from the project root with `node --experimental-strip-types docs/qa/revision/revision-edge-fixtures.mjs` after creating `output/playwright/`. Browser scripts run through the Playwright skill wrapper; campaign must precede edge checks, which assert the recorded winning result.

## Already present in published v1 — do not call these new Phase 2 features

A deterministic 16-week campaign plus sandbox continuation; a rendered 3D town and fixed workshop; six chocolate recipes across three customer segments; three suppliers with different cocoa quality, prices and delivery lead times; storm and cocoa-price events; repeatable production plans, pricing and product positioning; factory capacity, changeovers and four upgrades; research unlocks; three markets and advertising; deposits, automatic/manual contract dispatch, deadlines, penalties and delayed payments; working capital, debt and emergency credit; rival response; story choices; forecasts, weekly cash/profit reports; finished-goods shelf life; local saves, import/export, restart, responsive/touch interface, sound and reduced-motion support.

The current unpublished revision adds the saved grade allocation controls, repeat-order presets, persistent HUD, direct navigation, guided-play loop and global inbox described above. Those should also be treated as completed current-scope work, not future Phase 2 promises.
