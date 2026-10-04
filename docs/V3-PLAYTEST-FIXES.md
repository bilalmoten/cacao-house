# V3 playtest fixes — 4 October 2026

Six requested fixes on the existing Cacao House site:

- Claire's opening introduction identifies her as a Paris boutique buyer looking for hazelnut chocolate and explains the local-order introduction.
- Workshop callouts use named object anchors, measured label geometry, collision avoidance and leader lines. They reproject on orbit, zoom and resize.
- Use missing quantity fills only the current order quantity from shared, grade-aware production requirements, rounded up to whole kilograms and capped at the existing 500 kg order limit. It does not purchase or change supplier.
- Manual markets depend on location: Bay Area import pantry plus cacao contracts; Guayaquil cacao; Turin hazelnuts after its sample discovery; Kyoto tea after the supplier discovery. Paris is a buyer destination. In-transit manual buying is unavailable. Existing automatic purchasing and arrivals continue. Turin and Kyoto manual freight takes one and two trading weeks respectively.
- A short ingredient supply produces feasible whole cases and allows the week to pass. Saved targets remain. Reports show planned and made, with shortages and ordinary contract consequences. Capacity and production-cash checks remain.
- Local retailers are labelled as buyers. Unpurchased factories say Factory for sale; ownership styling requires ownership. Distribution remains an earned paid expansion, separate from visiting a city.

Verification: 55 tests passed; TypeScript, production build and whitespace checks passed. Targeted Chrome mobile checks at 390×844 and 402×720 confirmed accurate moving callout anchors, no callout overlap/horizontal overflow, 44 px targets, missing 46.5 kg filled as 47 without changing save or supplier, a 90-case plan producing 21 with saved targets retained, locked unintroduced Paris distribution, Turin nuts only and Kyoto tea only. No page errors. Existing full campaign route test also passed with travel stock arrangements.

Physical iPhone Safari was not available for automated verification. Existing saves are compatible and require no reset. User-supplied private screenshot remains outside this repository and deployment.
