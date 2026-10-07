Library authority: libfile_5e55675825dc8191899f1438012c0697. Complete extracted PDF text read: 188 reported lines, 12 pages. This copy is extracted text, not a binary PDF or viewed screenshot pixels.

<PARSED TEXT FOR PAGE: 1 / 12>
Cacao House playtest | Current published build | 2026-10-05 1
Cacao House - six-week playtest, October
5, 2026
Independent live-UI review of the current published build | Prepared as input to upcoming full V4 work
Verdict The business loop and story guidance are substantial and readable. The biggest balance risk is early
retail demand that keeps absorbing the whole plan. Travel and inventory create a real counterweight:
two consecutive weeks produced nothing after stock was exhausted.
What I tested
I played the live site in the assistant-side cloud Chrome browser using visible UI controls, not source code or injected state.
The run started at Week 1 with $3,200, covered six closed trading weeks, and checked automatic purchasing at the start of
Week 7 without running Week 7 production. I bought stock, used the saved production plan, fulfilled a local order, changed
retail prices, hired a quality lead, and traveled to Paris and Turin.
Important environment limit
The game reported that its 3D view was unavailable on this device. Every destination and activity remained accessible
through buttons, so I tested the button-based world map and panels. This is not a full evaluation of 3D movement or optional
minigames. The user’s Mac save is separate and was not accessed. I clicked Export current save before play, but could not
verify the download because the browser blocked its internal downloads page. The six-week session took about one hour of
wall time; the UI was generally responsive, with occasional 7-12 second waits and no crashes.
Top findings
Balance: Weeks 1, 2, 5 and 6 sold every planned retail case. Even after prices rose 10%, the results continued to show
unserved cases. Those counts include stock or contract reservations, so they are an unmet-opportunity signal rather than a
pure demand forecast.
Travel: The route screen clearly predicted 0/90 production, listed missing ingredients and $230 overhead. Weeks 3 and 4
each lost $230 with no production while the business was away and out of stock.
Systems: Ingredient grades, supplier lead times, machine and team capacity, hiring, quality upgrades, brand campaigns,
identity options, pricing and standing rules all exist.
UI issue: The retail price panel obscures part of the product description at the captured viewport. See the screenshot
evidence section.
Scope note
No real-money purchases, site/account changes, external messages, or posts were made. This report describes the current published build and does
not label it as a gameplay version number. The assistant-side test save remains at Week 7 with replenishment rules switched off after verification.
<PARSED TEXT FOR PAGE: 2 / 12>
Cacao House playtest | Current published build | 2026-10-05 2
Six-week trading ledger
The weekly results panels are the source for the figures below. Cash at close is the in-game close value, before later events
at the start of the following week.
Week Made / sold Sales Profit Cash
close
Observed result
1 90 / 90* $1,940 $878 $4,065 20 dark retail + 35 milk retail; 35 dark contract cases dispatched. 50 dark + 15
milk cases reported unserved; $578 balance due.
2 90 / 90 $1,870 $718 $5,058 55 dark + 35 milk retail sold. 15 dark + 26 milk reported unserved. Leda’s $578
balance collected.
3 0 / 0 $0 -$230 $4,528 No ingredients for complete batches while traveling. 57 dark + 48 milk reported
unserved.
4 0 / 0 $0 -$230 $3,678 No ingredients for complete batches. 69 dark + 56 milk reported unserved.
12kg hazelnut sample arrived.
5 90 / 90 $2,050 $877 $4,656 55 dark at $22 + 35 milk at $24. 14 dark + 19 milk reported unserved.
6 90 / 90 $2,050 $786 $5,446 55 dark at $22 + 35 milk at $24. 2 dark + 15 milk reported unserved.
* Week 1 made 90 cases: 55 Embarcadero 62 and 35 Velvet Milk. Thirty-five dark cases were automatically dispatched to Captain Leda; retail sales
were 20 dark and 35 milk cases. “Made / sold” counts the full order shipment plus retail where applicable.
Week 7 start check
After Week 6 closed, the standing rules had filled stock to 150kg cocoa, 80kg sugar and 30kg milk. The live cash balance
changed from $5,446 at Week 6 close to $3,904 after the automatic purchases (about $1,542 spent). Rules were switched
off afterward; no Week 7 production was run.
Reading the unserved figures
The results panels phrase these as retail cases unserved “(stock or contract reservations).” They support the conclusion
that production was not meeting all reported opportunity, but should not be treated as an independent forecast of customer
demand.
<PARSED TEXT FOR PAGE: 3 / 12>
Cacao House playtest | Current published build | 2026-10-05 3
Findings and audit steps
Balance issue - strong sell-through
All planned retail cases sold in Weeks 1 and 2 at the opening prices, and again in Weeks 5 and 6 after moving dark from
$20 to $22 and milk from $22 to $24. The residual unserved counts remained positive. This supports the
early-market-generosity concern. It is not a clean price-elasticity experiment: the later weeks also included a quality lead,
changed inventory, supplier prices and travel history.
Inventory and travel - intended strategic risk
The trip preview was unusually specific: it showed 0/55 dark and 0/35 milk, named missing cocoa, sugar and milk, listed
$230 overhead plus wages and purchasing, and noted uncertain retail receipts. San Francisco to Paris cost $250 and one
trading week; Paris to Turin cost $300 and one week; Turin to San Francisco was included and took one week. Paris had no
ingredient orders available, directing the player to a supplier city or back to the Bay Area. Weeks 3 and 4 show the cost of
failing to prepare. This is not a reproducible defect.
Supplier and operations depth
Cocoa spot and contract suppliers exposed quality, price and lead time. Quotes moved during the run: Guayas quality 82
was $6.65/kg with a two-week lead, later $6.43/kg with a three-week lead, and at Week 7 $5.94/kg with a two-week lead.
Rafi spot cocoa moved from $8.69/kg to $7.76/kg; sugar and milk also varied. These are observed screen quotes, not a
controlled test of why the values changed. Manual sugar, milk, nuts and citrus screens showed Rafi only; the standing-rule
supplier menu showed Rafi, Guayas and Rio. The spot market calls Rafi “Import Pantry,” while rules call the supplier “Dock
Exchange,” which may confuse players. No bulk discount surfaced in the orders tested.
Team and equipment
The starting crew had 165h for $80/week; additional workers cost $150 to hire, with severance of half a week’s salary. Pay
tiers were Developing ($76/worker, 50h), Experienced ($95, 60h), and Senior ($120, 70h). A Quality Lead cost $250 to hire
and $100/week for +3 quality; I saved that in the test run. Since the plant already had 100 machine-hours against 165
crew-hours, extra workers appear redundant until the machine bottleneck is expanded, though the panel does not state that
plainly. Equipment upgrades include a second conching drum (+65h, $1,500 plus $55/week), factory expansion (+70h,
$2,200), precision tempering (+12 quality, $1,150), quick-change moulds (remove 8h changeovers, $750), and heat
recovery (25% lower conversion costs, $1,050).
Story and brand
Nadia’s guidance and story cards tied customer orders, travel, recipes and buyers together. After Leda’s order, I chose
traceability: spend $300 from an earned $400 grant for +5 batch quality and +8 reputation. Claire’s brief asked for 25
gianduja cases at quality 80+ and said there was no artificial deadline until the order was accepted. In Turin, a $250
technique discovery and $120 hazelnut sample (12kg, due next week) advanced the story; a further $250 finishing lesson
promised +2 quality for gifting recipes. The house identity panel offered founder, business name and three emblems. Retail
distribution offered regional price levels from 80% to 130%; Union Square was gated at 48 reputation with a $1,100 opening
cost and $75/week. Brand campaigns ranged from $90 to $140/week. The Guayaquil cacao profile and gianduja pilot
remain untested.
Reproducible UI issue
At the captured 1196x852 viewport, the retail product description sits beneath the product card and is partly covered by the
price-control card. It is visible on the Velvet Milk pricing screenshot. Classify this as a visual usability issue, not a gameplay
bug.
<PARSED TEXT FOR PAGE: 4 / 12>
Cacao House playtest | Current published build | 2026-10-05 4
Playtest flow and general health
Health reflects only the observed flow in this run. “Balance concern” is a tuning signal, not a defect claim.
Suggestions to discuss
Consider surfacing ingredient deficits in the ordinary next-week preview, estimating the cost before a standing rule is
enabled, and clarifying when team hours cannot raise output because machinery is the bottleneck. These are product
suggestions, not verified failures.
Step Flow step Health
1 Opening and tutorial Good
2 Workshop plan and equipment Good
3 Supplier sourcing and stock Mixed
4 Local customer order and dispatch Good
5 Retail price and demand Balance concern
6 Travel and story progression Mixed
7 Staff, quality and identity Good depth; clarity gap
8 Standing-rule auto-buy Good; verified
9 Six-week results Good
The 3D fallback still made every named place reachable through keyboard-accessible buttons. A full movement and collision test was not possible.
<PARSED TEXT FOR PAGE: 5 / 12>
Cacao House playtest | Current published build | 2026-10-05 5
Evidence: opening and factory plan
Actual cloud-browser screenshots from the opening flow and the saved first-week workshop plan.
01. Opening at Week 1 with $3,200. Guided story is front and
center; the interface notes the 3D view is unavailable on this device.
02. The saved plan makes 55 dark and 35 milk cases, using 98 of
100 machine-hours and $263 conversion cost.
<PARSED TEXT FOR PAGE: 6 / 12>
Cacao House playtest | Current published build | 2026-10-05 6
Evidence: sourcing and the first order
The manual market lays out supplier quality and lead time; the buyer screen spells out terms and automatic fulfillment.
04. Cocoa choices distinguish immediate lower-grade stock from
higher-grade imports with different cost and lead time.
05. Captain Leda’s order: 35 cases, quality 50+, $22/case, due W5;
qualifying cases shipped automatically after production.
<PARSED TEXT FOR PAGE: 7 / 12>
Cacao House playtest | Current published build | 2026-10-05 7
Evidence: price controls and tutorial
The game explains that retail turnout is uncertain. The price panel has the visual overlap noted in the report.
08. Milk moved to $24/case, with $14 margin before overhead; the
description is partly obscured by the price-control card.
09. Help explains site-based play, travel advancing weeks, stock
checks, operations-manager remote control and uncertain retail.
<PARSED TEXT FOR PAGE: 8 / 12>
Cacao House playtest | Current published build | 2026-10-05 8
Evidence: trip forecast and stock risk
The route screen was the clearest operational warning in the run.
11. Turin to San Francisco: one trading week, $0 fare, forecast 0/55 dark and 0/35 milk, missing cocoa/sugar/milk, $230 overhead and
uncertain retail receipts.
<PARSED TEXT FOR PAGE: 9 / 12>
Cacao House playtest | Current published build | 2026-10-05 9
Evidence: team and quality controls
Team inputs are real and priced. This was a committed in-game quality investment, not a real-world purchase.
12. Staff controls show 165 crew-hours, 100 machine-hours, hire
fee, wage tiers and the Quality Lead option.
13. Saved Quality Lead: +3 quality, $250 hiring fee and $100/week;
staffing saved at $180/week total payroll.
<PARSED TEXT FOR PAGE: 10 / 12>
Cacao House playtest | Current published build | 2026-10-05 10
Evidence: sales after the price change
Week 5 and Week 6 both sold the full plan after prices rose. Changes in quality and inventory mean this is not a price-only
experiment.
14. Week 5: $2,050 sales, $877 profit, 90 cases sold at $22/$24; 14
dark and 19 milk cases still reported unserved.
16. Week 6: $2,050 sales, $786 profit, 90 cases sold; 2 dark and 15
milk cases still reported unserved.
<PARSED TEXT FOR PAGE: 11 / 12>
Cacao House playtest | Current published build | 2026-10-05 11
Evidence: automatic replenishment
The standing-rule panel separates target stock, chosen supplier and protected cash reserve.
15. Replenish milk each week from Rafi’s Dock Exchange to a 30kg target, with a $1,500 protected reserve. The cocoa and sugar rules
were also tested and turned off after the Week 7 purchase.
<PARSED TEXT FOR PAGE: 12 / 12>
Cacao House playtest | Current published build | 2026-10-05 12
Limits and state after testing
The playtest used the current published site in the assistant-side cloud browser. The initial cloud tab was a new tab and the
game opened the default Week 1 house; the user’s Mac save was not accessed. Export was clicked, but the download
could not be independently checked because the browser policy blocks its internal downloads URL.
The report does not evaluate 3D movement, optional minigames, packaging choices in the Pack & dispatch screen,
Guayaquil sourcing, the Paris gianduja pilot, or exact price elasticity in a controlled run. These remain open.
At the end, the cloud-browser test save was at Week 7 in San Francisco. Auto-replenishment had filled stocks to
cocoa150kg, sugar80kg, milk30kg; all three rules were switched off afterward. The quality lead and $22/$24 prices remain
in this assistant-side test save.
Evidence note
This document embeds selected screenshots from the live run. The full set of 16 original screenshots was also saved
separately in ChatGPT Library.
