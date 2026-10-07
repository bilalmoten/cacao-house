# Cacao House V4 Design and Build Plan

Prepared for Bilal Moten | 5 October 2026 | Approved direction and executable build specification

## 1 Executive recommendation

Build V4 as one complete, original founder-to-global-brand strategy campaign. The player should begin by choosing a brand, financing and equipping a small San Francisco factory, then earn the ability to run a production network, a retail and ecommerce business, and eventually an international franchise brand. Each transition changes the work the player does. It should never be the same production panel with another zero added to the numbers.

Keep the accepted San Francisco visual direction as the quality reference for every city. Make the world the place where the player meets people, learns opportunities, configures production, negotiates and sees the consequences. Focused controls and a readable business overview support those actions. The world must also remain useful once the player becomes a chief executive.

The approved initial launch is the full game, including the advanced campaign, franchising, ecommerce, high-end marketing and a real global-brand ending. Build it in testable stages; intermediate slices are development checkpoints, not a smaller launch or early-access release. The world expands beyond the existing cities, with regional ingredients, cocoa origins, seasonal supply and commercial opportunities that change how the player operates.

Three linked changes make this design work:

- A tougher, understandable economy. Customers have alternatives; growth consumes cash, space, staff time and debt capacity. Better ingredients, equipment and packaging only pay when they suit the customer and the production system.
- Occasional hands-on work with lasting business effects. Recipe development costs serious money. Factory setup exposes real bottlenecks. Timed tempering and process trials establish production efficiency for each factory and recipe, then staff repeat the process.
- A campaign that teaches through doing, then hands over responsibility. Nadia guides the first real decisions. Later introductions explain new systems at the moment they become useful. Management eventually shifts from individual batches to policies, product portfolios, regions and exceptions.

Bilal approved the summary and authorized the build on 5 October 2026 at 18:28 UTC, delegating this focused final planning pass and routine implementation decisions. This revision incorporates that approval and proceeds directly to a fresh Sol 6.1 Medium implementation task. No further routine plan-approval pause is required. Numerical balance remains provisional and must be tuned against evidence. This planning pass changes documents only; it does not change or deploy the game.

## 2 Requirements authority and delegated decisions

Bilal's feedback is the primary design authority. Luna's six-week playtest is supporting evidence about the current build, not a competing product brief. Where the report finds a panel readable but Bilal finds the overall guidance or world loop unsatisfying, the redesign follows Bilal's requirement.

Owner requirements are marked R in the traceability section. Earlier discussion proposals are marked P where their origin matters. The latest approval adopts the summary, including recoverable financial trouble, faster delegated turns, preserved legacy saves and an untimed activity alternative. Concrete content counts, interfaces and operating defaults in this revision are implementation decisions made under Bilal's delegated judgment, not quotations of requirements he specified numerically. Where this document uses recommend or proposed for an implementation detail, it is the selected working default, not a pending approval request. Tune numerical values without reopening routine design approval; escalate only a material scope reduction, new consequential commitment or an actual blocker outside the authorized work.

The upcoming complete redesign is called V4. The live Site's deployment version 8 is a hosting revision, not game V8. The current accepted San Francisco pilot is the visual baseline; it is not completion of the proposed V4 campaign.

### Terms used in this plan

- Art direction: the overall visual character, materials, lighting, colors and sense of place.
- World design: the cities, interiors, navigation, people and meaningful locations.
- Interface: the controls, text, numbers and screens used to make decisions.
- Player experience: how understandable, satisfying and convenient those interactions feel.
- Mechanics: individual rules, such as interest, spoilage or a tempering activity.
- Systems: interacting mechanics, such as production connecting staff, equipment and ingredients.
- Core loop: the recurring sequence of discovering, planning, making, selling and reviewing.
- Progression: how new responsibilities and capabilities become available.
- Balance: whether costs, rewards, difficulty and alternatives produce worthwhile choices.
- Onboarding: learning the game through the opening and later guided introductions.

## 3 Grounded starting point

Read-only source inspection used repository bilalmoten/cacao-house at commit 168bdda114a540bcf39498293187309176e7ee8a. It confirms a React, TypeScript, Vite and Three.js browser game with deterministic simulation, local saves and no game backend. The package declares Node 22.13 or later. These are the existing technology choices, not a proposal to move the game to another engine.

The inspected game already has ingredient lots and quality policies, production allocation, per-factory capacity, wage tiers, quality leads, equipment upgrades, seasonal news, variable supplier quotes and lead times, buyer orders, deposits, later payments, purchasing rules and a protected cash reserve. Basic founder/business naming and three emblems also exist. V4 should preserve useful behavior while replacing the rules and presentation that no longer serve the design.

The current source has eight recipe identities, six destinations, three factory identities and a ten-chapter authored journey. Source verification confirms the completed-story button labelled Visit the gathering only closes the panel and returns to the current exterior. A Paris gathering display does exist, but that button does not deliver a new ending scene. This is a specific interaction to replace.

Luna actually played six trading weeks through the visible cloud-browser interface. Four producing weeks sold the entire 90-case plan; two travel weeks produced nothing after ingredients ran out. Travel warnings explicitly forecast the shortage and overhead. Preserve that planning consequence. Do not compensate for it with free production or hidden rescue stock.

The later price increase was accompanied by different stock and a quality lead, so it is not a controlled measure of price sensitivity. V4 needs controlled demand tests before numerical balancing. The report also confirms inconsistent manual versus automatic supplier lists and a pricing-card overlap at 1196 by 852 pixels. Both belong in regression coverage.

The report used a 3D fallback and did not evaluate the full world, physical-phone performance, advanced packaging, all research or the late campaign. Earlier renderer measurements came from software WebGL. Neither source establishes acceptable real-phone performance.

### Retain rework and add

Retain the deterministic engine principle, visible ingredient grades, separate inventory lots, meaningful travel time, explicit payment dates, stock reservations, one-click saved replenishment, backups and exports, keyboard place navigation, reduced motion and the accepted San Francisco visual character.

Rework the opening economy, brand creation, factory setup, staff model, supplier catalog, equipment progression, demand and pricing, packaging, research, campaign, tutorial, business overview and responsive interaction hierarchy. Do not rebuild every useful existing mechanic from nothing.

Add scheduled loan servicing, expandable condition-aware storage, factory-recipe process records, substantial R&D projects, modular bottleneck setup, named employees, richer customer segments, channel-specific selling, repeatable macro conditions, regional management, ecommerce, franchise operations and an actual advanced ending.

Explicitly exclude supplier sample/testing minigames. Ordinary supplier information, quality specifications, reliability and commercial negotiation remain valid sourcing mechanics. Buyer tasting is an optional short commercial encounter, not a required arcade activity or a core launch dependency.

## 4 The experience from minute one to global brand

### The recurring loop

The player arrives in a city or opens the headquarters overview. A customer, employee, supplier or market signal presents a reason to act. The player visits the relevant place, inspects the tradeoff and chooses a response. They configure a plan, check cash and commitments, then deliberately advance business time. The factory and city show what happened; a concise report explains the result and suggests where to investigate.

The player is choosing among competing uses of limited resources: secure inventory or fund research; take a reliable wholesale order or reserve capacity for higher-margin retail; buy a faster machine or train the worker operating the true bottleneck. Progress comes from understanding these relationships, not discovering a permanently dominant upgrade.

### Early journey example

The player names their house, builds a simple emblem and chooses brand colors. Nadia brings them inside a modest waterfront unit. They compare a used, flexible line with a newer, more expensive line, hire two named people and choose a small working-capital loan. The equipment is installed visibly. A trial shows the cooling station will constrain their plan even though there are spare labor hours.

A ferry café wants dependable everyday bars. The player chooses a modest recipe and standard wrapper, buys enough stock for the order and a small retail experiment, then sees a forecast range rather than guaranteed sellout. After the week closes, the café pays its deposit balance later, some retail stock remains, and the first loan installment is due. The player learns why profit and available cash differ.

### Middle journey example

Claire's Paris brief asks for a gift assortment with a particular flavor, finish, packaging and shelf life. A Turin contact provides a technique and a Guayaquil partnership provides a suitable cocoa route. Back in the lab, a first pilot tastes good but fails its game-model shelf-life target. Paying for a revised recipe delays the launch and competes with an Oakland equipment deposit.

Oakland can produce everyday bars efficiently, while San Francisco handles smaller premium runs. Transferring a recipe carries process knowledge, but Oakland needs commissioning on its own equipment. The player records a better timed process there, trains the team and delegates replenishment. A forecast cocoa disruption then tests whether the two-factory network has a useful buffer rather than just spare machinery.

### Late journey example

The house operates regional manufacturing hubs, owned stores, ecommerce and franchise cohorts. The player no longer sets every batch. A regional director proposes faster store openings; the finance lead shows the working-capital exposure; the brand lead warns that promotion is outrunning delivery reliability. A franchise cohort is missing quality standards, while direct online acquisition is becoming expensive.

The player visits a flagship opening and one underperforming partner district, then makes group-level decisions: slow franchise intake, fund field training, change the product assortment and shift marketing toward repeat buyers. The next management turn resolves weekly operations with stops for exceptional decisions. A stronger global brand comes from a better operating system, not from clicking Produce thousands of times.

## 5 Campaign structure and scope

Build six stages with 42 authored main chapters, 18 optional regional commissions and six recurring relationship arcs with at least three distinct decisions each. This expands the earlier 28-chapter proposal to support the approved longer game and expanding world. Counts specify the content to build, not measured playtime. Every main chapter must contain a new consequential decision, an applied business challenge or a meaningful world/story encounter; simple payment-and-click milestones do not count as complete chapters.

The existing ten chapters are material to adapt into the founder and regional arcs, not an untouched opening followed by a disconnected second game. Character relationships and consequences should carry forward. Gates depend on demonstrated readiness, not a fixed week number or a cash windfall. A player may keep operating before accepting the next stage.

The launch content baseline is 12 fully explorable cities, 24 authored commercial recipes across eight product lines, 37 ingredient varieties across 11 ingredient families, eight cocoa-origin profiles and 24 supplier businesses. These are the selected finite build scope for the expanded requirement, not permanent limits in the data model. Six new cities join the existing six progressively. Additional markets may be represented through regional operating maps, but map labels do not substitute for the 12 explorable destinations. Section 8 defines the ingredient catalog, recipe coverage and strategic differences.

Content counts and the twelve-city list are the build baseline. Monetary, performance and progression thresholds remain provisional balance targets in tunable configuration. A qualified recipe means one of the authored commercial recipes released after its required tests; formula revisions, alternate origins, flavor-intensity variants and packaging colors cannot inflate the count. Product-line breadth prevents the player from meeting every gate by developing many nearly identical bars.

### Stage 1 Found the house

Chapters 1 to 6: Your name above the door; Choose what to finance; Build the first line; Keep a small promise; The market has alternatives; A business that can repeat.

Setting: San Francisco. Nadia is a practical founding adviser; Leda is an early business customer; Rafi introduces the realities of procurement. The player creates the brand, chooses a constrained factory setup, makes two starting recipes, completes a real customer order and learns cash, hours, quality and retail demand.

The story conflict is whether this can become a dependable business rather than a subsidized tutorial. A local rival already serves customers. Early mistakes should create recoverable pressure. A starter order may provide a foothold, but it must not finance every upgrade or guarantee permanent retail demand.

Proposed exit gate: two released recipes, three successful deliveries, positive contribution on at least one product for three operating weeks, no overdue payroll or installment, and unrestricted cash covering the next two weeks of fixed obligations. On meeting it, the player chooses when to accept Claire's introduction.

### Stage 2 Create a distinctive collection

Chapters 7 to 13: A brief from Paris; Turin's method; The supply behind the flavor; Oaxaca's different brief; Buy before the season turns; Pay for the pilot; The first collection.

Settings: Paris, Turin, Guayaquil, the new Oaxaca destination and the home lab. The player learns R&D budgeting, ingredient compatibility, packaging, shelf life, imports and market positioning. The dramatic choice is how to fund an original product while keeping the existing business reliable. Voss becomes a recurring commercial rival and occasional potential partner, with offers that have concrete contractual tradeoffs rather than automatic moral rewards.

The collection launch is an actual playable event: inspect displays, speak to collaborators, see buyer responses tied to the collection and receive a short outcome scene. It is a milestone, not the end of the whole game.

Proposed exit gate: six qualified recipes across at least three product lines, a completed premium launch order, four-week positive operating profit, no overdue obligations and cash covering six weeks of fixed obligations after the proposed second-site deposit. A failed launch has a revised brief or a later event; it cannot permanently remove the campaign.

### Stage 3 Run a production network

Chapters 14 to 21: Across the bay; Commission the second line; A different kind of leaf; Salvador changes the mix; The warehouse decision; Transfer the method; Keep the network supplied; Pass the operating review.

Settings: Oakland, Kyoto, the new Salvador destination and the existing commercial network. The player specializes factories, develops tea products, manages shared logistics, hires production and operations leaders, and maintains service during travel. The new strategic problem is coordination. A factory with cheap capacity is not useful if stock, skills, transfers or demand are missing.

Proposed exit gate: ten qualified recipes across four product lines, two commissioned factories with certified processes and named managers, at least 95% on-time fulfillment over eight weeks, positive aggregate operating cash flow over that window and a six-week liquidity buffer after committed spending. The service threshold is a starting tuning target; missed deliveries must be recoverable through later performance.

### Stage 4 Build a consumer brand

Chapters 22 to 28: The first flagship; A store is a business; Istanbul's gift season; Mumbai's launch brief; The online launch; A campaign with consequences; Own the customer relationship.

Existing cities gain modern retail interiors, distribution and a headquarters commercial floor. Istanbul and Mumbai become new explorable commercial destinations, each introducing a regional product brief, ingredient routes and a contrasting customer opportunity. The player opens owned retail, launches in-game ecommerce, chooses fulfillment promises and runs larger campaigns. Wholesale, stores and online sales compete for stock, customer attention and price credibility. The new problem is profitable demand creation and channel conflict, not simply making more chocolate.

Proposed exit gate: fourteen qualified recipes across five product lines, three viable markets, a positive contribution margin in retail and ecommerce for a rolling 12-week period, repeat-customer growth, on-time fulfillment at the network target and cash covering the next expansion's commitments plus the reserve. Marketing spend alone cannot satisfy the gate.

### Stage 5 Grow through other operators

Chapters 29 to 35: Write the operating standard; Accra's supply partnership; Choose the first partners; Fund field support; Support the opening cohort; Protect the name; The regional review.

The player creates a franchise operating model, selects partners using ordinary business suitability, prices royalties and support, chooses central versus local supply, funds training and handles quality exceptions. Each opening cohort represents a set of stores with shared conditions and visible individual exceptions. It is not a thousand interchangeable map pins.

Proposed exit gate: eighteen qualified recipes across six product lines, three sustainably profitable regions, at least two successful franchise cohorts, 12 weeks of partner compliance and support coverage, positive group operating cash flow and debt service that remains covered in a disclosed downside scenario. Franchise deposits are obligations or deferred income, not a shortcut to profit.

### Stage 6 Lead a global house

Chapters 36 to 42: Singapore opens the next route; Allocate the next year; The seasonal portfolio; The brand under pressure; A promise across regions; The global launch; A house that outlasts its founder.

The player chooses a long-term portfolio, regional investment, premium collaborations, ecommerce retention and franchise pace under an economic shock. Executives bring recommendations with assumptions and competing priorities. The decisive challenge combines resilience, brand consistency and profitable scale. It should require a considered strategy rather than one largest possible marketing purchase.

Selected final milestone: twenty qualified recipes across all eight product lines, including at least one developed in stage 6, and an in-game enterprise value above $2 billion, sustained for four quarterly reviews, together with positive operating cash flow, acceptable debt service, service reliability and product-quality compliance. The value is an explicitly fictional game estimate, distinct from cash, revenue and profit. It must arise from the operating business. A proposed model uses trailing 52-week revenue multiplied by a bounded factor reflecting margin, growth and reliability; no real-world valuation accuracy is claimed. Use only group-recognized revenue, including franchise royalties and external supply revenue, with associated costs recorded separately, never the sum of partner sales and group revenue. The valuation coefficient needs long-horizon simulation before locking the target's attainability.

The finale is a new global launch or anniversary scene at the flagship headquarters, with the player's brand, products, collaborators and regional achievements visible. It summarizes consequential choices, allows a short walk through the event and then offers Continue the business or Start a new house. Every button performs the action its label promises.

### Length through changing decisions

Use an internal target of 24 to 36 active player-hours for a first unguided complete campaign, spread across many sessions. This is a design and validation target, not an achieved duration or a public promise. It responds to the owner's requirement that the game should not be finishable in a few hours or a normal single-day session. Actual ordinary play must establish duration and whether the experience earns that time.

Each stage combines four kinds of work: an authored commercial problem, a regional discovery that changes available decisions, an operational investment that must prove itself, and a consequence/review encounter. The 18 side commissions are three per stage with alternative solutions. The six relationship arcs belong to Nadia, Leda, Claire, Luca, Ines and Aoi; existing relationships develop as responsibilities grow rather than resetting when a new city opens. New regional contacts support the six new destinations and recur in their later business reviews.

A chapter record must include its lead, world encounter, objective predicates, meaningful decision, simulation consequences, a recovery route and completion scene. Track at least one concrete consequence in the next chapter or regional review. Do not count rereading email, passive waiting, repeating an already-mastered minigame or raising an arbitrary cash target as additional story length. If playtesting is too short, add distinct consequential scenarios within these arcs; if repetitive, redesign the task rather than raising the number of required deliveries.

Keep production and research durations business-relevant and allow useful parallel work. Multiweek delegation may accelerate routine operations, but must stop before unresolved story decisions and preserve the new campaign encounters. Do not use the clock to skip the story or force the player to babysit it. Every main chapter must be encountered and completed through its actual route; accelerated fixtures are testing tools only.

### Progressive world manifest

Each city has an authored exterior, at least four meaningful hotspots, one distinctive gameplay interior, a recurring regional contact, two supplier businesses or commercial access points, an encounter chain and a visible change after a milestone. Factory cities additionally expose the operating interior; market cities need a showroom, flagship or logistics interior suited to their role. Optional scenery does not count as a meaningful hotspot.

- Stage 1: San Francisco establishes the waterfront workshop and first customers. Oakland may be visible across the bay, but its factory responsibility unlocks in stage 3.
- Stage 2: Paris, Turin and Guayaquil gain their rebuilt roles; Oaxaca opens as the first new destination with a spiced-cocoa product brief and a contrasting harvest/short-haul purchasing choice. Travel options open through named introductions, not one simultaneous wall of cities.
- Stage 3: Oakland is commissioned; Kyoto introduces tea techniques; Salvador opens a fruit-and-cocoa product route with a different seasonal calendar and storage/transport challenge.
- Stage 4: Istanbul introduces a premium nuts-and-gifting assortment and retailer payment terms. Mumbai introduces a spice-led brief, regional demand segmentation and a warm-route fulfillment challenge. These are authored commercial scenarios, not claims that every consumer in a region has one taste.
- Stage 5: Accra introduces a scale-versus-specialty cocoa purchasing decision, a training relationship and regional franchise supply continuity. A bulk source can be reliable and commercially valuable without being framed as intrinsically inferior to a luxury origin.
- Stage 6: Singapore introduces a regional distribution hub, cross-market ecommerce fulfillment and access to specialty origins through trade relationships. The final world expansion creates a new logistics/allocation problem, not just a backdrop for the ending.

The twelve cities are San Francisco, Oakland, Paris, Turin, Guayaquil, Kyoto, Oaxaca, Salvador, Istanbul, Mumbai, Accra and Singapore. Production can expand through owned factory sites and regional manufacturing cohorts; not every explorable city needs an owned factory. Additional cocoa origins can be available through import partners without falsely claiming that their home region is an explorable destination.

### What belongs in launch

Full V4 launch includes all six stages and 42 main chapters; 12 explorable cities and their required gameplay interiors; 24 authored commercial recipes; the 37-variety ingredient catalog and regional sourcing; a dedicated Reports Centre; functional lab and factory activities; owned retail, ecommerce, franchising and the final global-brand stage. The remaining four recipes beyond the final twenty-recipe gate support genuine player choice and replay, not mandatory completionist padding.

Future additions can include further explorable cities, deeper regional storylines, more recipe families, optional specialist starting scenarios and richer franchise customization. Multiplayer, real advertising integrations, live financial data, real payments, user accounts and cross-device cloud sync are outside this launch proposal. These omissions preserve the requested business ambition without introducing unrelated infrastructure.

A smaller initial release or early-access substitute is not authorized. If the full scope encounters a genuine feasibility blocker, report evidence and options to Bilal rather than quietly omitting the advanced campaign, new destinations or reports. Continue independent work while a material decision is needed.

## 6 Brand creation and a difficult opening

Move identity creation into the opening: founder name, business name, emblem construction and primary/accent colors. Use a small original shape library, meaningful preview and accessible palette checks. Apply the identity to storefront signage, product packaging, uniforms, delivery crates and later flagship environments. Keep financial-status colors independent so a brand color cannot make warnings unreadable. Existing three emblems are a starting asset set, not the full customization experience.

Recommend one shared campaign start with several viable setup choices rather than three separate business-path campaigns at launch. Craft, wholesale and retail orientations should emerge through decisions and later specialization. A mandatory starting-path selector was previously discussed as an option, not established as an owner requirement.

The player chooses among two or three suitable starter equipment packages, a small candidate pool and one of the disclosed funding packages. Each package exposes capacity, quality consistency, energy, maintenance, changeover time and installation cost. The most expensive machine must leave less working capital or impose higher servicing requirements; the cheapest must remain a viable start with a different plan.

Calibrate the opening so the player cannot buy all useful improvements immediately. Suggested balance target: after a sensible setup, retain roughly three to five weeks of unavoidable obligations and stock for more than a single batch, while a meaningful upgrade consumes a noticeable share of that cushion. Treat this as a ratio to tune, not a fixed dollar claim. First-week sellout is possible for a cautious plan; repeated total sellout at elevated prices across all products should not be the effortless default.

Difficulty comes from visible competition and scarce cash, not withheld instructions or random failure. The guide can explain a warning without choosing the best response. A player who ignores a known shortage should experience the resulting lost production; a player who plans well should be able to outperform it.

## 7 The integrated business model

### Units and accounting

Use 20 consumer units per saleable case. For bar recipes these are bars, preserving the existing convention; other product forms use their clearly labelled retail packs. Show cases and the appropriate unit equivalent where useful. Recipes specify ingredient mass per case, packaging units and operations time. Large-company screens may display thousands or millions of cases, but the ledger must preserve exact quantities and monetary minor units.

Use integer cents for money, grams for ingredient inventory, minutes for labor and machine time, and whole saleable cases for dispatch. Avoid floating-point rounding that creates free stock, negative balances or lost pennies. Economic values are game abstractions and need internal consistency; they are not real manufacturing or financing advice.

Distinguish cash, revenue, cost of goods sold, operating profit, investment, inventory value, customer deposits, receivables and loan principal. Buying ingredients moves cash into inventory. Consuming and selling them creates cost of goods sold. A loan increases cash and liability, not sales. A deposit is not earned revenue before the contractual delivery milestone. Show both cash runway and operating profitability because either can fail while the other looks healthy.

### Initial balance configuration for the implementer

Use a separate balance configuration so the first integrated simulation has concrete starting values. The default Standard financing package begins with $6,000 total cash, comprising $3,000 founder equity and a $3,000 starter-loan liability. Offer a Leveraged package with the same equity plus a $5,000 loan, $8,000 total cash and a higher 0.45% weekly rate over 52 weeks; show the larger installment before selection. Both must pass viable-opening tests. The choice changes available investment and financial pressure; it is not a free difficulty bonus. The Standard starter loan runs for 52 weekly installments at a 0.3% weekly rate, with an amortizing payment and rounding-adjusted final installment. These are fictional game seed values, not real financing advice. Legacy starts remain unchanged.

Seed starter equipment packages at $1,400, $2,200 and $3,200, plus a shared $600 premises/commissioning outlay. The middle package should leave about $2,500 after a roughly $700 initial stock order. Seed two operators at $180 and $200 weekly, 40 contracted hours each, and base premises expense at $150 weekly. Equipment and skilled labor are separate resource budgets; working-time efficiency is not extra contracted human hours. Use the current opening recipe reference prices of $20 and $22 per case as initial anchors, with unconstrained asking prices and a finite competitor-shared demand pool tuned toward roughly 50 to 70 combined opening retail cases at a competent offer. This is a desired test scenario, not guaranteed demand or a quantity cap.

Seed the first distinctive R&D project around $1,800 all-in and later platform projects around $4,000 to $15,000, with the cost composition in section 10. Start meaningful line/warehouse upgrades around $1,000 to $6,000 and new site investments around $15,000 to $30,000; later industrial lines, regional hubs and franchise support scale by capability, not a repeated flat price. Use variable batch cost derived from actual lots, energy, packing, waste and channel handling rather than a second arbitrary production fee. Allocate paid operator cost for product comparison but charge payroll once. For new recipes, seed reference case prices in a $28 to $70 range according to product role, process burden and target segment; the range is not a price ceiling.

These amounts are provisional initial data for Phase B/C, not final balance commitments. Run the opening, debt, research and growth scenarios before expanding content. If the middle package is insolvent despite sensible operation or buys every upgrade effortlessly, tune the smallest causal parameters and record the before/after scenario results. Preserve the owner's difficulty and full-content requirements. Do not keep an arbitrary cost merely because it appeared in this seed configuration.

### How decisions connect

Ingredient lots determine flavor suitability, baseline quality, yield, cost and storage behavior. The recipe sets ingredient sensitivity and process demands. Equipment sets feasible throughput and process consistency. Staff skills and workload affect attainable speed, error risk and training. A factory-recipe process record determines reproducible production time and process losses. Packaging adds material cost, packing time, protection and customer-specific appeal.

Those inputs produce actual batch quality and landed unit cost. Price, observed quality, brand trust, packaging fit, channel service and rival alternatives determine customer demand. Sales then feed cash, reputation, customer retention and future information. No isolated purchase should grant an unlimited universal demand bonus.

### Quality and cost

Recommend a quality score with an explanation, not a mysterious sum of permanent bonuses. Calculate ingredient suitability as recipe-specific weighted input quality; process quality from equipment capability, trained staff and the saved method; and condition at sale from elapsed shelf life, storage and transit. Use a bounded combined score with a penalty when a critical ingredient or process is below its minimum. Premium cocoa cannot compensate indefinitely for a spoiled filling or a badly controlled process.

Keep taste preference separate from objective consistency. A more intense tea recipe may appeal more to enthusiasts and less to everyday shoppers without being categorically better. Packaging can preserve condition and communicate value; it cannot transform poor chocolate into high intrinsic quality.

Unit cost includes consumed ingredient-lot costs, manufacturing energy and conversion expense, paid labor allocation, packaging, expected process loss and channel fulfillment cost. Report direct contribution per case separately from allocated fixed overhead. Fixed salaries must not be charged twice when labor allocation is used for product comparison. Transfers between owned factories, warehouses and shops are internal movements, not new consolidated revenue; keep external sales and partner supply transactions distinct.

### Explainability

Every forecast and result needs the same compact explanation format: result, three largest drivers, limiting factor and link to the relevant world location. For example: Expected 44 to 61 cases; price above nearby alternatives; strong gift packaging fit; low local awareness. A deeper breakdown is available on demand.

### Proposed computational starting points

For reproducible tuning, begin with explicit models rather than separate hand-written bonuses in every screen. Ingredient suitability is a recipe-specific weighted mean of eligible lot quality. Proposed batch quality is 0.55 times ingredient suitability plus 0.35 times process consistency plus 0.10 times freshness, followed by declared critical-input and condition penalties and a 0 to 100 bound. These weights are provisional and may vary by recipe family; packaging appeal stays outside intrinsic quality. A strict buyer can additionally require a minimum critical-input grade, so averaging cannot conceal an unacceptable component.

Station minutes equal the sum of each scheduled batch's calibrated cycle minutes plus applicable setup/changeover and handoff minutes. Labor minutes are tracked separately by role and station. Expected good cases equal completed batch cases multiplied by the process yield, rounded once at the batch boundary with recorded rejects. The allocator must never convert unused staff hours directly into machine capacity.

For each segment, give every available product offer a utility score from normalized quality fit, flavor fit, packaging fit, brand/service trust and a negative price term. A suitable initial price term is elasticity times the natural logarithm of offer price divided by that segment's reference price. Purchase share equals the exponential of an offer's utility divided by the sum of the exponentials of all rival, own-product and no-purchase utilities. Multiply by the segment's finite opportunity pool, then apply stock/service constraints. Use numerically stable evaluation and an explicit no-purchase option. This yields substitution and declining demand without a price ceiling; coefficient values belong in balance configuration.

Forecast ranges sample plausible market conditions from a separate deterministic preview stream and summarize a central estimate and uncertainty interval. They must not reveal the exact committed random draw or alter it. A wider range is appropriate when data is sparse or an event is uncertain. Validate the interval against realized outcomes across held-out seeds rather than presenting an arbitrary plus/minus percentage as confidence.

For a fixed-rate loan, interest for a week equals opening principal times the documented weekly rate. Payment first covers due fees and interest, then principal; any unpaid amount becomes a separately visible arrears balance under its stated rule. The final payment is adjusted for rounding. Cash runway uses the calendar of obligations and receivables, not simply cash divided by last week's expense.

The overview should answer five questions without opening a sequence of repeated panels: Where is cash going? What limits next week's output? Which products and channels earn contribution? Which commitments are at risk? What has changed in the market? Clicking a cause takes the player to the factory, person or commercial location responsible.

### Reports Centre

Build a dedicated Reports Centre available from the office/headquarters and a compact global Reports button. It is a place to understand the business and follow causes back to the world, not a replacement location containing every operational control. The first weekly close introduces it through Nadia. Cash, current commitments and the last report are accessible before that close; later categories appear only when their systems unlock.

The desktop centre uses a stable category rail, time-period selector and company/factory/region/channel scope. Phone uses a compact category chooser and one focused report at a time, with period, scope and headline totals visible beside the relevant chart/list. Default to the current week; offer trailing 4, 13 and 52 weeks once enough history exists. Comparisons without adequate history say insufficient history, not zero. Reports preserve their filters on returning from a world drill-down.

Seven categories cover the business:

1. Overview: cash, runway, operating profit, next installments/payroll, fulfillment risk, biggest changes and the next three decisions needing attention.
2. News and updates: market/harvest signals, announced events, current disruptions, internal milestones and manager updates, with effective dates and links to affected places. An unread item does not silently become an accepted contract.
3. Finance: weekly financial position, cash-flow statement, profit and loss, receivables, deposits, inventory value, debt and committed capital. Show opening cash plus operating, investing and financing flows equals closing cash. P&L separates net sales, cost of goods sold, gross profit, operating expense, interest and pretax result; equipment investment is not immediately counted as both an asset and full operating expense. Apply a simple disclosed depreciation schedule where used. This is a game model, not statutory reporting.
4. Sales and demand: actual volume, net sales, contribution, price, quality/packaging fit, returns, retention, contract versus retail/channel mix, forecast intervals and realized-versus-forecast differences. Separate demand before stock limits from feasible sales and stock-related missed opportunity.
5. Supply and inventory: available/reserved/incoming stock, projected space at arrival, lots approaching expiry, stock cover, supplier/route cost, lead-time risk and seasonal outlook. Show stock cover as an estimate based on the current plan, not a hard cap.
6. Production and people: planned/feasible/actual cases, station and skilled-labor utilization, bottlenecks, changeover/rework, calibrated process versions, wages, overtime, training and factory-level contribution.
7. Obligations and plans: accepted orders, delivery windows, deposits and balances, recurring commitments, loan schedule, payroll, rent, research stages, commissioning, campaign budgets and franchise support/opening commitments, all on one dated timeline.

Every report distinguishes Actual, Forecast and Planned. Every headline number carries its period, unit, scope and source. Expand Why it changed to see the largest additive drivers, with an Other changes remainder so the bridge reconciles. Show causal attribution as modeled explanation where exact causality cannot be established. Do not present correlation or forecast error decomposition as certainty. From a stockout, go to the relevant warehouse/recipe; from a margin issue, go to that product/channel; from arrears, go to the loan; from a process slowdown, go to its factory station.

The required data contracts are buildReport(state: V4State, query: ReportQuery): ReportView and explainMetric(state: V4State, ref: MetricRef): MetricExplanation. ReportQuery contains asOfWeek, periodStart, periodEnd, scopeType, scopeId and category; omit scopeId for company-wide reports and validate it for entity scopes. ReportView contains schemaVersion, generatedFromTickId, query, metrics, series, rows, alerts and availableDrilldowns. ReportMetric contains id, label, value, unit, basis (actual/forecast/planned), period, sourceEventIds, sourceEntityIds and optional comparison. A forecast adds lower/central/upper values, intervalLabel, assumptions and modelVersion. MetricExplanation contains the baseline, current value, driver contributions, remainder and entity-linked actions.

LedgerEntry and DomainEvent are authoritative; a WeeklySnapshot is an immutable derived summary at each completed tick. Store enough events and snapshots for full campaign history, with lossless aggregation of older routine detail where needed. A snapshot records tickId, financial totals, inventory/obligations summaries, actual sales and production, plus the pre-close forecast used for comparison. Historical actuals must not be recalculated using today's prices or a later model version. Report calculation must be read-only and deterministic, including after reload/export/import.

In finance.ts, classify entries into operating/investing/financing cash flows and accrual P&L once. In reports.ts, aggregate those classifications rather than rebuilding accounting rules. In demand.ts, retain the forecast at commitment/weekly close so reports compare like with like. In sourcing.ts and production.ts, return constraint/driver IDs consumed by the same explanation component. A report line always has a path back to an event or clearly labelled model assumption; unsupported blank metrics stay absent, not fabricated.

## 8 Suppliers inventory and storage

Use one supplier catalog and one eligibility function for manual purchases and delegated replenishment. Each supplier has actual offered ingredients, grades, geographic access, quantity bands, available stock, lead time, transport options, reliability and commercial terms. Automatic buying cannot invent products or bypass discoveries unavailable to the same company. Use one displayed business name per supplier across every route.

Recommend three reachable starter commercial options, introduced gradually: Rafi's broad immediate pantry, a lower-cost domestic ingredient wholesaler and an import broker. These are proposed additions, not claims about existing suppliers. Every one of the 37 ingredient varieties must have at least two commercially distinct sourcing routes by its mature unlock stage; cocoa, sugar and milk should have alternatives early. Specialty ingredients can begin with one contact, then gain alternatives through travel and business relationships. Three starter commercial options are the selected default; introduce their relevant ingredients progressively rather than exposing the entire catalog at the start.

Later sources include the existing Guayas and Río cocoa relationships, Turin nuts, Kyoto/Uji tea, regional dairy/sugar partners and citrus routes. Give each a reason to exist beyond a different portrait. A nearby source may win on replenishment speed; a distant one on quality or volume; another on flexible order quantities. Do not make every ingredient available from every supplier.

Availability changes with harvest windows, demand, production, weather and announced events. Show available-now volume, expected restock date and confidence. A large requested purchase may be split between immediate stock and an explicitly accepted future delivery. Never silently shrink it. Remove the arbitrary 500-unit cap; true limits are supplier availability, credit/cash, transport, minimum lots and receiving/storage capacity.

Bulk discounts are stepped contract terms with a displayed effective price and total landed cost. Larger orders reduce unit price but tie up cash and space, incur freight and risk expiry or a wrong forecast. Discounts apply to the order or committed volume period stated in the quote; splitting orders or cancelling and rebuying cannot multiply them.

Store ingredients as dated lots with source, landed cost, quality, remaining quantity, storage class and expiry/condition data. Finished goods retain recipe revision, factory, process version, packaging, batch quality, cost and production date. Allocate first-expiring eligible stock by default while respecting saved premium-reservation and fallback policies. Never substitute a lower grade into a strict customer order without a visible policy allowing it.

Warehouse capacity is physical usable storage by condition, not a one-week inventory quota. Provide dry storage, controlled-temperature space and, where recipes require it, cold storage. Shelves, receiving bays, rented overflow and larger warehouses have capital or recurring costs and expansion lead times. Display present occupancy and projected occupancy when scheduled deliveries arrive.

Purchases check receiving capacity at the delivery date. If later events make space insufficient, use the player's chosen policy: paid overflow if within budget, delay/re-route where possible, or reject the excess with disclosed cost. Do not silently delete goods. Shelf-life decline is recipe and storage-specific. The game abstracts food science; testing labels must not imply real regulatory approval or certify real products.

### Ingredient and product catalog to build

Use IngredientFamily, IngredientVariety and SupplyOffer as separate concepts. Family is the broad material role; variety is the ingredient/form/origin that a recipe actually uses; an offer is one supplier's dated grade, price, quantity and delivery promise. A premium grade is not a new variety. All names below describe authored game content and should not imply real sourcing certification or universal geographic flavor claims.

The 37-variety launch manifest is:

- Cocoa, eight origin profiles: Ecuador, Ghana, Brazil, Mexico, Peru, Madagascar, Dominican Republic and Vietnam. Each profile has an authored flavor vector, processing behavior, harvest window, supply volume and alternative import/direct routes. Grade and reliability vary within each origin; no continent receives a blanket quality ranking.
- Sweeteners, three: refined cane sugar, raw cane sugar and panela.
- Dairy, three: milk powder, cream powder and butter.
- Nuts, six: hazelnut, pistachio, almond, peanut, cashew and pecan.
- Fruit, five: orange peel, lemon peel, berry preparation, passion-fruit puree and mango puree.
- Tea, three: matcha, roasted green tea and black tea.
- Spices, three: vanilla, cardamom and cinnamon.
- Grains, two: wafer pieces and crisp rice.
- Plant bases, two: coconut base and oat base.
- Coffee, one: coffee preparation.
- Salt, one: finishing salt.

IngredientVariety defines familyId, physical form, allowed recipe roles, flavor dimensions, baseline process behavior, mass/volume conversion, storage class, shelf life and region/origin metadata. Quality, landed cost, expiry and traceability are properties of the actual lot and offer, not permanent promises attached to a variety. Ingredient families share safe UI units but do not imply unrestricted interchangeability.

A RecipeRevision declares ingredient roles with allowed varieties and quantity ratios. Nut substitutions change roast/preparation time, yield, flavor and customer fit. A liquid fruit preparation changes moisture-sensitive processing, cold storage and shelf-life testing. Milk powder cannot be swapped one-for-one with butter. A different cocoa origin can improve a desired flavor while changing cost, process time and available harvest volume. Material substitutions require a new pilot/test revision and factory-specific process validation; minor grade changes within the approved specification use the existing method with its actual quality/yield inputs.

The 24 authored commercial recipes are organized in eight product lines, three per line:

- Solid bars: Embarcadero 62, Velvet Milk and Origin Collection.
- Inclusion bars: Amber Peel, Pistachio Crunch and Spiced Coffee Bar.
- Nut centres: Copper Praline, Gianduja Reserve and Cashew Coconut Centre.
- Ganache: Midnight Ganache, Kyoto Tea Cream and Passion Fruit Ganache.
- Caramel: Salted Caramel Bonbon, Cardamom Caramel and Coffee Caramel.
- Enrobed bites: Biscuit Bites, Citrus Fruit Jellies and Pecan Crunch Bites.
- Plant-based products: Coconut Dark, Oat Milk Bar and Almond Berry Bite.
- Drinking chocolate: Classic Drinking Chocolate, Spiced Cocoa Blend and Mocha Mix.

The earlier eight recipes are adapted into this manifest; Origin Collection carries the existing single-origin recipe concept. Formulation revisions and origin-specific versions belong to a recipe and do not create extra gate credits. Six reusable production routes cover solid molding, inclusion molding, nut-paste filling, ganache/caramel filling with their distinct process parameters, enrobing and dry beverage blending. Plant-based recipes reuse a suitable route while imposing their declared ingredient/line constraints. Each recipe still requires its own per-factory calibrated process.

Use this exact initial content-unlock assignment:

- Stage 1: Embarcadero 62 and Velvet Milk.
- Stage 2 adds Amber Peel, Origin Collection, Copper Praline and Gianduja Reserve, bringing the catalog to six.
- Stage 3 adds Kyoto Tea Cream, Midnight Ganache, Cashew Coconut Centre and Pistachio Crunch, bringing it to ten.
- Stage 4 adds Salted Caramel Bonbon, Cardamom Caramel, Spiced Coffee Bar, Biscuit Bites, Passion Fruit Ganache and Coconut Dark, bringing it to sixteen.
- Stage 5 adds Coffee Caramel, Citrus Fruit Jellies, Pecan Crunch Bites and Oat Milk Bar, bringing it to twenty.
- Stage 6 adds Almond Berry Bite, Classic Drinking Chocolate, Spiced Cocoa Blend and Mocha Mix, bringing it to twenty-four.

Place each recipe's required ingredient introductions before its project offer. Discovery opens a development opportunity; it does not grant free release or commissioning. A content validation test enforces this schedule and the gate/product-line breadth. Stage 6 must expose at least one recipe in any product line not previously required for a player's chosen route. No chapter may require a recipe or ingredient before at least one valid acquisition path exists.

There are 24 supplier businesses: two anchored to each city's commercial network. The three opening options are Rafi in San Francisco, a San Francisco import broker and an Oakland-based domestic wholesaler serving the Bay Area remotely; a supplier introduction can precede visiting its home city or acquiring a factory there. These may serve several varieties, while direct producers and import brokers may offer the same variety under materially different cost, lead-time, availability and minimum-volume terms. Catalog validation requires at least two viable routes for every mature variety, at least 74 valid variety-to-supplier edges overall, and no automatic-only supplier loopholes. A route can be temporarily unavailable during a shock, but the signal, alternative and recovery must remain understandable.

### Harvests and regional supply as operating decisions

Use a 52-week seasonal year. Every seasonal variety/origin has an authored primary harvest window, optional secondary window, yield curve, carryover stock, quality/condition curve and replenishment schedule. Calendars are fictionalized for game pacing and must be labelled as game forecasts, not educational claims about exact real harvest dates. Opposing regional windows create diversification opportunities; they must not all peak in the same weeks or change merely because the player has reached a chapter.

Supply quantity equals supplier base output times the seasonal yield factor and event capacity, plus carryover inventory minus committed demand. Landed cost includes farm/producer quote, selected grade, processing/form, freight, import handling, storage/condition requirements, quantity discount and expected waste. Keep each component visible in the quote explanation. A low producer quote can be a poor delivered choice after freight, delay and loss.

The selected balance envelope is a seasonal yield factor around 0.5 to 1.5 and ordinary price pressure around 0.8 to 1.3 of the baseline before exceptional events; these are provisional simulation values, not real commodity statistics. Announce ordinary harvest shifts several weeks ahead. Existing fixed-price commitments retain their terms; spot quotes and new contracts react. Pre-harvest contracts can secure allocation while tying up deposits; carrying peak-harvest stock trades unit cost against cash, space and condition. Supplier discovery is conversation and commerce, never a testing minigame.

Each of the six new cities must introduce at least one decision-changing combination of a recipe brief, ingredient/season, route economics or customer/channel difference. Acceptance requires a controlled comparison showing that substituting the region's ingredient or route changes at least two of flavor fit, feasible production, shelf life, landed cost, cash timing or service risk. A different name and tint alone does not pass.

## 9 Factories equipment and people

### Factory setup as a playable operating problem

Replace decorative fixed layouts with a constrained modular workshop. Each site has a floor plan with receiving/storage, preparation, processing, tempering/cooling and packing/dispatch bays. Place or upgrade suitable station modules within allowed bays, assign staff and run a visible trial batch. This is a readable production-design activity, not a full conveyor or freeform architecture simulator.

Location matters through travel distance, incompatible flows, staging space, power/cooling budgets and handoff delays. Show paths, work-in-progress and waiting stations. A cramped packing area can back up a fast process line. The player should see and understand the bottleneck before buying another machine.

The activity produces an actual configuration consumed by the simulation. Decorative props must not secretly affect throughput. Capacity previews should compare the current and proposed line with the same recipe mix, showing the limiting station, labor and space constraints. Invalid layouts explain what is blocked and preserve the last valid layout.

### Tiered upgrades

Create three or four equipment tiers per major station: small flexible equipment, larger batch equipment, coordinated industrial equipment and efficient specialist automation. Each has purchase/lease cost, commissioning time, operating expense, footprint, staffing needs, maintenance and product compatibility. Later tiers cost substantially more and may be poor choices for tiny specialty batches.

Separate physical expansion from machinery. A larger building offers room, utilities and receiving capacity; it does not automatically provide operators or equipment. Energy-efficiency upgrades reduce a specific cost, quality upgrades improve process control, and capacity upgrades improve a particular bottleneck. Their previews must identify which one the player actually needs.

Changeover reduction has three meaningful steps. An illustrative series is 8 to 5 to 3 to 1.5 hours between incompatible recipe families. Those are provisional values; the invariant is gradual improvement with a nonzero operating cost rather than one purchase removing all switching. Sequence compatible recipes to save time. Cleaning and allergen separation are simplified game constraints, never real compliance instructions.

### Named staff

Each employee has a name, role, wage, contracted weekly hours, skills, training, assignment and workload. Proposed skills: production technique, process setup, quality control, maintenance, research and commercial/management ability. Show the skill relevant to the task; do not expose six meters everywhere.

Hire from a changing candidate pool with clear strengths and salary expectations. Experience is not simply a salary tier that creates impossible extra human hours. Overtime is a deliberate bounded option with added cost and fatigue; repeated excessive workload reduces effective performance and retention. Rest, staffing and training restore it. Avoid hidden permanent penalties from one busy week.

Training costs money and productive time, takes a stated number of weeks and improves a specific capability. Assigning a quality specialist helps the process and reduces rework rather than granting the same flat bonus at every site. Maintenance skills reduce downtime risk; they cannot erase it. A staff card explains current cost, hours scheduled/available and contribution to the line.

At large scale, keep site leaders and executives named while grouping routine teams into cohorts with a visible headcount and skill distribution. Hiring and staffing policies govern the cohorts; important departures, labor shortages and training gaps surface as exceptions. This preserves people management without requiring thousands of character cards.

## 10 Recipe development and occasional activities

### Recipe Lab

The lab starts with a product brief: desired customer, flavor, price band, quality and shelf-life target. The player chooses a formula direction, process and packaging hypothesis. A project budget includes lab booking, specialist time, pilot-batch production, taste-panel fees, stability/expiry testing and likely revision allowance. Ingredient cost is only one component and should usually be a minority of serious development expenditure.

A project proceeds through concept, pilot, taste feedback, stability testing and commercial release. Each paid stage produces useful results: ingredient mismatch, poor yield, taste preference by segment, difficult process or insufficient shelf-life confidence. The player can revise, reduce ambition, pause or abandon. Work already learned remains in the project; failure is not a blind fee lottery.

An illustrative first distinctive-recipe budget might allocate 10% to ingredients and pilot consumables, 25% to lab and specialists, 20% to taste panels, 30% to stability work and 15% to contingency. These percentages are proposed tuning examples, not real R&D estimates. Later product lines should compete materially with equipment and expansion spending.

Recipe families and techniques come from contacts, business opportunities and research. Within them, limited formula choices create useful variations without an unmanageable combinatorial recipe generator. Changes that materially alter ingredients, process or shelf life create a new revision requiring the relevant tests; a color change on the wrapper does not rerun the entire lab project.

### Timed tempering and process commissioning

At least one occasional timed activity must materially set production hours for each factory and recipe. Recommend a 60 to 90 second commissioning run combining heat/cooling control and the timing of handoffs to the next station. The player watches clear process signals, acts within forgiving windows and sees the resulting cycle time, yield and consistency. This is a strategic process trial tied to the line, not a score chase unrelated to the business.

The result is a saved ProcessProfile keyed by factory, recipe revision and relevant equipment configuration. Routine staff production uses that profile every week. A proposed operating range is 1.15 times standard cycle time for a poor valid process, 1.00 for a competent setup and 0.80 for an excellent one. A 20% time reduction can increase throughput by up to 25% when this process is the bottleneck; it does nothing to remove a different station's limit. The final range must be balanced against equipment and skills.

A profile includes timing, expected loss, quality consistency and required team competency. It cannot make a machine exceed its physical operating envelope. Staff below the required competency cannot reproduce all of an expert run until trained. Better equipment raises the achievable envelope rather than merely multiplying arbitrary bonuses.

Before committing a paid trial, show its cost and time. Practice is free and does not improve the saved economic result. After a trial the player can retain the existing valid profile or adopt the new one. A bad attempt therefore does not permanently damage a factory. Recommissioning is available after training, equipment changes or a recipe revision; ordinary weeks never require replay.

Transferring a recipe to a new factory carries its documented method, but that factory needs its own certified profile. Early on the player may perform the commissioning. Later a qualified engineer can establish a conservative profile or improve one over time within a budget, with the same attainable operating envelope. Major equipment changes invalidate only affected process stages and explain the required recommissioning.

### Accessibility and optional encounters

Approved default: provide an untimed assisted mode with the same economic ceiling. It asks the player to choose process settings and handoff order, previews feedback and uses the same competency constraints. Extended timing windows, keyboard input, pause and reduced motion are also available. Reflex speed must not gate the campaign or permanently lower attainable business performance.

Buyer tasting can be a short optional encounter choosing samples, packaging and an offer against a known buyer brief. It uses product facts and negotiation tradeoffs, not guessing which dialogue line the designer likes. It must not duplicate the rejected supplier-testing activity. If it adds no meaningful decision beyond the order screen, omit the activity and retain the commercial meeting.

## 11 Production scheduling and time

Plan production by factory, recipe revision, batch size, sequence and target channel. Convert each batch into operations through its station route. Every operation consumes station minutes, skilled labor minutes, staging space and relevant ingredients. Available output is the feasible schedule across all those resources, not just the minimum of one global machine-hour and crew-hour total.

Show planned versus feasible cases, the critical bottleneck, changeover time and what would improve output. For example, extra people should not promise more cases when cooling capacity is exhausted. A saved profile can improve operating minutes materially while the preview still correctly reports packing as the bottleneck.

The initial scheduling model should be deterministic and explainable: apply the player's recipe sequence, reserve eligible stock and promised deliveries, schedule batches into station budgets, and report the first binding constraints. Do not introduce a black-box optimizer as a prerequisite for launch. Later managers can propose a schedule using clear heuristics such as commitment priority, due date and contribution per bottleneck minute. The player can inspect and override it.

Retain deliberate time advancement and no always-running planning clock. A local visit or conversation does not consume a trading week unless its card explicitly says so. Long-distance travel, commissioning, training and research state their elapsed time and cash consequences before commitment. Saved operating policies continue during travel.

Early play advances one week at a time. After delegation, offer a four-week management turn that resolves four weekly ticks with stops for an uncovered shortfall, material decision, crisis or deadline. In the global stage, a 13-week review turn may be offered after the same stop logic is proven. Weekly interest, payroll, arrivals, expiry and orders still resolve weekly; a longer turn is not free time or a different economy.

Recommended timing model permits several in-game years without hundreds of repetitive manual weeks. Do not promise a real-world completion time before playtesting. The advanced campaign should add varied decisions and story, not stretch duration through waiting or repeated travel.

## 12 Selling and consumer behavior

### Demand has alternatives

Model market demand as a finite segment pool shared between the player's products, visible rivals and customers who do not buy. Proposed segments include everyday value, thoughtful gifting, enthusiasts and convenience-led online buyers, with regional variations. Their willingness to pay responds differently to quality, flavor, packaging, trust and service.

Use a decreasing price-response function within each segment, relative to visible alternatives and willingness to pay. Include a no-purchase option and substitution between the player's similar products. Adding more recipes cannot create unlimited customers; discounting can shift purchases without making every sale profitable. Rivals have recognizable strategies and bounded responses, rather than reading the player's hidden future decisions.

Allow any sensible positive asking price within technical numeric safety, with no arbitrary $80 gameplay ceiling. At an extreme price the forecast can honestly approach zero. A numerical storage bound is not a balancing tool and must not be presented as a market rule. Customer price memory and frequent promotions can lower later willingness to pay, particularly in everyday segments.

### Forecasts and actual results

Before an analyst, provide coarse ranges and observable signals: quieter footfall, competitor discount, promising gift demand. An analyst improves resolution and identifies drivers, but never turns uncertainty into a guaranteed sales figure. Display forecast demand before stock limits, expected sell-through given available goods and committed reservations, and revenue/contribution ranges separately.

Use seeded demand uncertainty with declared drivers. Reopening a panel or reloading cannot reroll the week. The realized sales report distinguishes low demand, no stock, reserved stock, quality mismatch, price resistance, channel delivery failure and spoilage. Unserved opportunity must not be labelled as a clean demand estimate when those causes are mixed.

### Channels introduce distinct problems

Local direct retail begins with footfall, assortment, displayed price and freshness. Owned shops later add location economics, opening costs, rent, store staff, merchandising, store-level stock and customer retention. Regional distribution has wholesale margins, delivery schedules and minimum shelf-life requirements.

Business orders specify volume bands, quality, packaging, delivery window, deposits, settlement date, cancellation terms and service penalties. Negotiation trades better price against faster payment, exclusivity, flexibility or service commitments. Recurring agreements show the next expected commitment and allow pausing future cycles without erasing already accepted orders. The existing deposits and receivables are foundations to retain.

Ecommerce adds acquisition cost, conversion, basket size, shipping subsidy, fulfillment capacity, delivery promise, damage/returns and repeat purchases. Revenue after discounts is not profit after acquisition and delivery. A campaign can grow first orders while losing money; retention and better operations can improve it. No real ecommerce account or ad platform is required.

High-end marketing later requires a brief, audience, creative-production budget, media/partner spend, launch window, distribution readiness and measurement plan. A flagship event, premium collaboration or regional campaign changes consideration and demand over time, with reach saturation, frequency fatigue and uncertain attribution. Campaigns compete for budget and product availability; a costly launch with poor fulfillment can damage trust. The commercial lead compares expected acquisition cost, repeat value and contribution, rather than promising a fixed sales multiplier. All spending and partnerships are fictional in-game actions.

Franchises earn group royalties and possibly supply margin while imposing training, support, logistics and reputation risk. Partner store revenue and group revenue must not be added together as if both were the same cash. New franchise fees cannot be an infinite expansion-profit exploit.

### Packaging is a product decision

Define wrapper/box families with material cost, packing minutes, minimum order, storage volume, protection, shelf-life compatibility and segment appeal. Everyday consumers may prefer economical packaging; gifting customers may pay for a presentation box; online sales may need protective packaging that customers do not value aesthetically. Sustainability preferences can differ by segment and event rather than granting one permanent universal bonus.

Premium packaging must earn its cost through fit, protection or contract eligibility. Show the effect on contribution, production time and expected demand before adoption. Packaging stock can become obsolete after a brand refresh, making rebranding a real later decision. A supplier quantity discount on boxes still consumes warehouse space and cash.

## 13 The wider market and competitive pressure

Use a small set of understandable macro states rather than dozens of hidden modifiers. Proposed categories are household spending, input/energy costs, financing conditions, transport reliability, social attention and taste trends. Each has a visible direction, affected segments or routes, probable duration and uncertainty. Display important upcoming conditions through the in-game business feed, contact emails and city activity.

A weak spending period makes everyday shoppers more price-sensitive and premium gifts more occasional. A holiday raises gift interest but also packaging demand and freight pressure. A heatwave changes product mix and cold-chain costs. A viral style can create a temporary surge followed by fatigue. A rival discount can be met through price, better service, a different product or waiting it out.

Psychology should mean understandable consumer behavior: reference prices, trust, familiarity, novelty fatigue, social proof and disappointment after broken promises. Do not use opaque penalties called psychology. Brand awareness brings consideration; fulfilled expectations build trust; excessive discounting can train price expectations; repeated poor delivery reduces retention.

Scheduled events provide planning opportunities with a known horizon. Unexpected events are bounded and cannot stack into an unavoidable opening failure. The opening teaches one pressure at a time. Later combinations are allowed because the player has diversification, reserves and delegation tools. News must identify plausible responses without guaranteeing which is optimal.

A seeded scenario deck can combine authored story events with repeatable market patterns. It needs cooldowns, severity budgets and mutually exclusive states. Events affecting existing orders must follow their disclosed contract terms; do not retroactively change a fixed supplier price without an explicit floating-price agreement.

## 14 Financing failure and recovery

Owner requirement: loans have interest, scheduled weekly repayments and genuine pressure. Recommendation: offer a small set of understandable products, such as a starter term loan, later equipment finance and a revolving working-capital facility. Eligibility depends on cash flow, assets and existing obligations. The game should not allow infinite refinancing or count borrowed cash as campaign success.

For each loan show amount received, fees, rate convention, weekly installment, term, total scheduled repayment, collateral/conditions and late consequences before acceptance. Use a clearly defined amortization rule in the simulation. If an annual rate is displayed, state its conversion to weekly interest consistently; do not mix monthly and weekly formulas. Variable-rate products later disclose when their rate resets.

The accounts view combines payroll, loan installments, rent, committed purchase payments, receivables and planned investments on a cash calendar. The default planning reserve covers unavoidable near-term commitments before discretionary automatic spending. A player can deliberately override a reserve after seeing the resulting risk; a replenishment rule cannot silently consume protected loan or payroll cash.

Recommend a Standard campaign with staged recovery. A forecast shortage first produces a warning. If cash actually falls short, pause discretionary purchases and present legitimate choices: reduce production, sell eligible uncommitted stock, sell/lease back equipment where supported, renegotiate an eligible debt, seek a costly bridge facility or close an unprofitable site. Each option has explicit consequences and eligibility.

Missing a payment creates arrears, fees, restricted borrowing and a recovery objective. Do not instantly end a long campaign over one missed installment. Persistent insolvency triggers a restructuring chapter or a bankruptcy ending. Restructuring may shrink the business and delay growth, but preserves acquired knowledge and allows a clear recovery route. It cannot produce unlimited free money.

Offer an optional strict challenge mode with a harder bankruptcy rule and a relaxed mode with wider forecasts and softer financial pressure. Recommended default is Standard. On a terminal ending, preserve the save and offer an earlier checkpoint, a new house or a view of the outcome. Do not erase the campaign automatically.

Selected Standard-mode starting rule: the first missed installment creates a two-week recovery window with disclosed fees and restricted discretionary spending; unresolved arrears then trigger a restructuring offer if viable assets/cash flow remain, otherwise a bankruptcy ending. Debt limits and costs remain tunable. One bridge facility may be active at a time, and refinancing cannot clear accrued loss or inflate progression metrics. These numerical defaults can be revised through balance tests without another routine approval gate. The design invariant is that every failure has a legible cause, and every recoverable state has an honest next action. No activity score or missed optional meeting should create an undisclosed permanent dead end.

## 15 World interface and modern presentation

### City identity and visual direction

Use the accepted San Francisco connected waterfront, warm materials, purposeful buildings, legible landmarks and restrained atmospheric detail as the standard. Carry that level of care to every destination without copying its geography. Avoid a small isolated platform surrounded by empty water, flat placeholder terrain, unreadable signage or visually identical cities.

Proposed city roles: San Francisco combines waterfront production with a contemporary commercial district; Oakland is a practical industrial campus with loading and expansion space; Paris combines premium retail and a modern showroom with recognizable urban fabric; Turin centers on technical craft and manufacturing; Guayaquil connects a river-port export district to growers and logistics; Kyoto combines a contemporary confectionery/lab setting with regional tea relationships. Each city gets a distinct silhouette, materials, streets and commercial purpose. The six new destinations follow the same quality standard: Oaxaca has a compact contemporary market/craft district, Salvador a coastal cocoa-and-fruit trade setting, Istanbul a mixed modern retail/warehouse district, Mumbai a dense commercial and fulfillment district, Accra a contemporary trading/production campus, and Singapore a regional logistics/flagship district. Their architecture and routes must be researched from suitable visual references during production, rather than assembled from stereotypes or San Francisco copies.

The tone is warm, modern and professional, with contemporary equipment, digital terminals, email and concise commercial language. Gen Z and futuristic should mean current, confident and usable, not neon decoration or slang everywhere. Retain warmth and craft without village nostalgia, old-letter framing or historical-business costumes.

### World actions and visible consequences

Factories show installed machines, moving work, idle stations, queues and storage pressure. Shops show the player's products and selected packaging. Logistics locations show arriving shipments and disruptions. Contacts occupy plausible workplaces. A new flagship, expanded warehouse or successful launch changes the place the player can visit.

A building click enters or focuses the relevant place before exposing its controls. A machine opens that station's setup; a named employee opens their assignment; a buyer opens the brief or negotiation. The headquarters overview may jump to a known location or delegated responsibility, but it must not replace discovery and meaningful visits with a universal list of every action.

Keep compact pannable scenes, clear recenter controls, touch-friendly picking and a keyboard-accessible location list. A full walking avatar is not required for this proposal. The factory activity may use a closer top-down/isometric view with precise module selection. The fallback must preserve all strategic actions when 3D is unavailable and honestly state that the full visual mode is not active.

### Desktop and phone hierarchy

Desktop can pair the world with a compact contextual sheet and optional business comparison. Phone uses a focused task view or bottom sheet with one group of decisions at a time. Do not shrink the desktop dashboard or stack all data into a long scroll.

Keep the relevant total beside the control that changes it. Production quantities show their time and current bottleneck in the same viewport; price changes show expected demand/contribution nearby; purchases show total cost and arrival/storage impact. A short sticky summary is appropriate within a task, not an excuse to keep every global metric permanently visible.

The permanent HUD contains only immediate essentials: cash, time, current objective access, critical alerts and navigation/settings. Remove decorative labels that consume scarce mobile space. After the tutorial, long explanations live in optional help. Important warnings remain visible. The known pricing-card overlap must be fixed at its exact viewport and tested across nearby widths.

### Guided opening and ongoing help

Nadia guides real world actions: choose identity; inspect the empty factory; select equipment and staff; run the trial; visit the supplier; understand the buyer; plan production; preview commitments; advance time; read the outcome. Teach one concept at a time with short prompts and a highlighted target. Completion is detected from the actual action, not merely closing a dialog.

Offer Start guided and Explore myself, plus pause, resume and replay help. Skipping guidance does not skip campaign requirements or grant rewards. Locked systems should not expose dense disabled controls and explanations before they matter. A broad future ambition can be hinted at through the story without revealing every management menu.

When a new system unlocks, a relevant person sends a short email and offers a contextual walkthrough. Story goals name the objective, person, city and useful neighborhood lead. The player explores locally to find the contact. Optional hints become more specific on request; do not leave them with Find a recipe and no path to act.

The inbox keeps complete conversation history and separates new offers, accepted commitments and informative news. All messages and character scenes must use the current brand and campaign state. A promised event requires an actual scene or an honestly labelled business action.

## 16 Delegation and the higher management game

Delegation follows demonstrated need and a paid, capable hire. Early replenishment becomes available after the player understands inventory and cash. A production lead schedules within approved recipes, standards and hours. An operations manager coordinates sites and remote changes. A commercial lead manages approved recurring terms and channel allocation. Regional directors and executives eventually handle cohorts and bring exceptions to headquarters.

Every delegated policy has scope, objective, constraints, spending authority and escalation conditions. Examples: replenish to a target within a reserve and supplier policy; schedule committed orders before discretionary stock; keep a minimum quality; pause a campaign if contribution remains negative; stop a franchise opening if support capacity is exhausted.

Automation uses exactly the same simulation rules and quotes as manual actions. It cannot source locked products, spend money twice, ignore storage, create unapproved debt or silently accept a new contractual obligation. The player can preview the next planned actions and inspect an audit trail after resolution.

The late-game screen centers on exceptions, capital allocation, portfolio/region performance and upcoming commitments. It still links to meaningful world visits: a flagship opening, partner review, lab breakthrough or struggling factory. Routine batch editing becomes optional detail. The campaign should test whether the player can design a reliable organization and judge its recommendations.

## 17 Save compatibility and launch integrity

The current save envelope is version 6 and the browser key is cacao-house-save-v2. Existing source includes migrations for older saves, a backup and export/import. V4 will materially change economic meaning, so silently loading an old company into the new balance would be misleading.

Approved save policy has two clear paths. Continue existing house preserves its original rules and save in a legacy mode. Start V4 creates a separate campaign slot with a new schema and offers to carry only the chosen founder/brand identity. Export and preserve the existing save before a new campaign. A player must never discover that a redesign erased or rebalanced their old business without consent.

An optional later conversion can import a legacy company into a clearly labelled V4 sandbox, with an explicit conversion report for cash, stock, staff, loans and unlocked recipes. It is not required for the initial V4 campaign and must not be described as a faithful story migration. Keep the legacy path lazy-loaded and isolated to avoid paying its rendering/runtime cost in a new V4 session. If this proves infeasible, report the evidence before replacing the agreed legacy experience with an archive-only alternative.

V4 saves need versioned schema, content version, deterministic random state, process profiles, R&D, loans, lots, contracts, employee/cohort state, campaign flags and delegated policies. Persist only after an atomic action or completed weekly tick. During multiweek advancement retain safe checkpoints and the exact next tick to prevent duplicated deliveries or interest after a crash.

Validate imports before replacing the active slot. Unknown future versions, invalid numeric values, missing critical references and corrupt JSON must leave the current game unchanged. Bound import size and content without an arbitrary economic ceiling. Use exportable slots and local persistence for launch; recommend IndexedDB for the larger V4 data while keeping a tested legacy-reader boundary. Cloud sync remains a separate future choice.

## 18 Technical design grounded in the repository

### Existing integration points

Verified files include game/engine.ts, game/growth.ts, game/journey.ts, game/travel.ts and game/sourcing.ts. The engine exports State, Action, act, newGame, allocateProduction, productPreview, forecast, serialize and deserialize. The current State composes growth, travel and journey state. Those names are existing interfaces, not newly invented files.

Verified presentation files include src/App.tsx, src/v3/FactoryPanel.tsx, src/v3/CommercePanels.tsx, src/world/V3World.tsx and its imported src/world/scene module. App currently owns boot, local persistence, action dispatch, world navigation, sheets, travel advancement and story rendering. FactoryPanel and CommercePanels call engine functions for their previews. These are natural seams for a V4 adapter and focused replacement, rather than adding all new systems to App.

The current recipe, supplier, factory and market identifiers are fixed unions. V4's expanded content requires stable content IDs and validated catalogs rather than extending several unrelated hard-coded lists indefinitely. Existing exports can remain behind the legacy boundary while V4 introduces a coherent schema. Do not rename or remove legacy interfaces before compatibility tests exist.

### Proposed module boundaries

All paths in this paragraph are proposed new files, not claims that they already exist. Under game/v4/, use model.ts for shared immutable data contracts; commands.ts for validated player actions; tick.ts for ordered weekly resolution; catalog.ts for content lookup; production.ts for schedules; sourcing.ts for quotes/eligibility; inventory.ts for lots/storage; quality.ts for batch evaluation; demand.ts for segments/forecasts; sales.ts for allocation/contracts; finance.ts for ledger/loans; people.ts for staff/training; research.ts for projects; process.ts for commissioning results; campaign.ts for objectives/unlocks; delegation.ts for policies; and saves.ts for serialization/migrations; and reports.ts for read-only historical views and explanations.

Keep tunable values and authored content in game/v4/content/ with separate campaign, recipes, ingredients, origins, suppliers, equipment, cities, seasons, events and balance records. Each catalog entry has a stable ID and schema validation; the launch manifest is a checked data file, not a hard-coded UI list. New renderer adapters and focused screens belong under src/v4/. Reuse existing world infrastructure and city assets where appropriate; inspect the actual scene module before choosing further renderer splits. Do not perform an unrelated whole-repository reorganization.

The simulation has no React, DOM, wall-clock or renderer dependency. Rendering consumes a read-only view model. Randomness is seeded and advanced only by committed simulation events. Previews operate on snapshots and do not consume the live random stream. Commands return explicit errors without partial mutation. This is essential for replay, testing and trustworthy forecasts.

### Proposed interfaces

Use these names consistently across subsystem implementation packets; change a shared contract only through a recorded integration decision and corresponding tests. They are design contracts, not existing APIs.

- applyCommand(state: V4State, command: V4Command): CommandResult. Returns either a new state plus DomainEvent records, or a typed rejection with the original state unchanged.
- previewWeek(state: V4State, intent: WeekIntent): WeekPreview. Returns capacity, procurement, cash and sales ranges, assumptions and blocking/risk reasons without changing state.
- resolveWeek(state: V4State, intent: WeekIntent): WeekOutcome. Commits exactly one weekly tick and returns the next state, ledger entries, outcomes and interruptions.
- scheduleProduction(context: ProductionContext, plan: FactoryPlan): ProductionSchedule. Returns batch operations, resource minutes, consumed lots, expected output and limiting constraints.
- evaluateBatch(input: BatchInputs): BatchEvaluation. Returns quality dimensions, expected yield, unit-cost components and traceable drivers.
- quotePurchase(state: V4State, request: PurchaseRequest): PurchaseQuote. Returns eligibility, available quantity, volume discount, landed price, arrival window, storage impact and quote identity.
- forecastMarket(context: MarketContext, offers: ProductOffer[]): DemandForecast. Returns segment ranges, substitution, stock-independent demand and explanatory drivers.
- evaluateUnlocks(state: V4State): UnlockStatus[]. Returns visible objective progress, missing conditions and newly available capabilities.
- buildReport(state: V4State, query: ReportQuery): ReportView and explainMetric(state: V4State, ref: MetricRef): MetricExplanation. Produce the deterministic Reports Centre data defined in section 7.
- validateContent(catalog: V4Catalog): ContentValidationResult. Checks IDs, references, unlock reachability, recipe/ingredient compatibility, seasonal coverage and the launch-manifest counts.
- serializeV4(state: V4State): string and deserializeV4(raw: string): SaveLoadResult. Round-trip all state or return a recoverable validation error without overwriting another slot.

V4State contains schemaVersion, contentVersion, seed/random cursor, week, identity, ledger/cash, loans, factories, employees/cohorts, recipes/revisions, processProfiles, inventory lots, shipments, contracts/receivables, channels/regions, brand/market state, research projects, campaign, delegation policies settings, report snapshots and report preferences. Use stable IDs for relationships; do not copy separate mutable versions of the same factory or recipe into several systems.

ProcessProfile identifies factoryId, recipeRevisionId, equipmentSignature, methodVersion, cycleMinutes, expectedYield, consistency, requiredCompetency and commissioning provenance. InventoryLot identifies location, ingredient or finished product, quantity, landed/unit cost, quality, condition, birth/arrival/expiry week and reservations. Loan identifies principal outstanding, rate convention, installment schedule, fees, arrears and term status. Contract identifies buyer/channel, recipe/packaging specification, reserved volume, price, deposit liability, due window, settlement rule and fulfillment status.

All Quantity and Money fields use documented units from section 7. DomainEvent records have stable IDs and tick/action origin. The ledger references these IDs so retries cannot book the same event twice. A view model can summarize history, but saved financial totals must reconcile with transactions.

### Weekly resolution order

Use one documented order everywhere, including travel and delegated multiweek turns:

1. Open the week, mature receivables, receive due shipments and complete scheduled installations/training/research milestones.
2. Apply the published market/event state and determine current quotes and available supply. Preserve existing fixed contract terms.
3. Reserve mandatory cash obligations and execute eligible delegated purchasing within policy limits; immediate deliveries can enter stock this week, later ones become shipments.
4. Finalize production/transfer schedules, reserve inputs, pay required operating costs and run feasible batches through the saved processes.
5. Fulfill accepted commitments by their priority and terms, then allocate remaining eligible finished goods to channels. Resolve seeded customer demand and returns according to their dated rules.
6. Book revenue and costs, payroll, overhead, scheduled loan service, penalties and deposit settlement; advance lot condition/expiry after the permitted sales window.
7. Update customer trust, staff workload, delegation results, campaign readiness and recovery status. Reconcile the ledger, save an atomic checkpoint and present the report.

Cash protection in step 3 is a reservation/forecast, not a second charge. Step 6 settles each obligation exactly once. Wages or production costs that must be prepaid are deducted in step 4 and only classified in step 6. Any shortfall follows the defined recovery policy, not negative invisible cash. Define boundary tests for arrivals and expiry on the same week as delivery before implementation.

## 19 Phased build sequence

The build is authorized. The fresh Sol 6.1 Medium implementer should start Phase A immediately in the assigned saved-cloud environment, then proceed through these phase packets without routine approval pauses. Use this revision as the single specification and make the named tests executable. Numerical balance examples are initial configuration values to validate and tune, not immutable claims. Report meaningful milestones, actual screenshots, important findings and true blockers as work progresses.

Each task follows the same checkable cycle: add the named failing test; run it and confirm the relevant failure; implement the smallest change satisfying the approved contract; run the targeted and affected regression tests; review the actual output; then commit the bounded change. New tests below are proposed files. Existing commands are npm run typecheck, npm test and npm run build; test files use the repository's Node test runner. Use the assigned environment's existing supported development workflow and included tools. No new paid services, paid assets or external review-loop service are permitted. The planning agent does not execute product work; the separately authorized build task does.

### Phase A Protect the baseline and establish execution contracts

Task A1 records the approved decisions, baseline commit, release naming, current save fixtures and matched screenshots. Read current main again before starting because it may have changed. Inspect the actual existing tests and renderer imports. Verify no active user changes are overwritten. Proposed deliverable: docs/v4/approved-design.md and a bounded test fixture set, as the first authorized build checkpoint.

Task A2 creates the V4/legacy boundary and save-slot design. Proposed test tests/v4-save-boundary.test.mjs must show that a version-6 fixture opens with unchanged legacy semantics, a new V4 slot leaves that fixture untouched, and corrupt or future saves cannot replace an active slot. Verify import/export and restore through the interface, not only serialization functions.

Exit gate: the approved launch scope and delegated defaults are recorded; the baseline can be restored; legacy and V4 saves cannot collide. This phase must not publish a new live build.

### Phase B Establish the economic kernel

Task B1 implements model.ts, catalog.ts, commands.ts, finance.ts and tick.ts with money/quantity units, seeded events and atomic actions. Test tests/v4-ledger.test.mjs for conservation, deposits versus revenue, principal versus expense, idempotent tick replay, impossible numbers and rejected-action immutability.

Task B2 implements inventory.ts and sourcing.ts. Test tests/v4-sourcing.test.mjs for identical manual/delegated eligibility, per-ingredient alternatives, finite availability, bulk-price boundaries, receiving-date capacity, lot reservations, expiry and policy-protected cash. A 501-unit request succeeds when real constraints allow it; a smaller request fails when stock or space does not.

Task B3 implements quality.ts, production.ts and people.ts with simple initial catalogs. Test tests/v4-production.test.mjs for ingredient-limited output, machine-limited output, skill/labor limits, packing bottlenecks, changeovers, lot costs, yield and non-double-counted payroll. Adding staff to a machine-limited line must not raise feasible output.

Task B4 implements demand.ts and sales.ts. Test tests/v4-demand.test.mjs for price response holding every other variable and seed constant, finite market pools, substitution, no-purchase demand, segment packaging tradeoffs, contract reservation priority and correct receivables. A price above $80 is accepted as an asking price and can produce zero demand without numerical failure.

Task B5 implements reports.ts and the immutable WeeklySnapshot pipeline. Test tests/v4-reports.test.mjs for opening-plus-flows-equals-closing cash, P&L reconciliation, principal/deposit classification, partner/group separation, historical price/model stability, missing-history labels, forecast/actual separation and entity-linked explanations. Add tests/v4-content.test.mjs for the twelve-city, twenty-four-recipe, thirty-seven-variety manifest, eight origins, twenty-four suppliers, mature dual-sourcing coverage, valid seasonal calendars and unlock reachability.

Exit gate: a headless opening business survives or fails for explainable reasons, every ledger reconciles, no infinite cash/demand loop exists, and previews match deterministic parts of the next tick. This kernel is a test harness milestone, not a substitute for a playable world.

### Phase C Deliver one complete opening slice

Task C1 builds brand creation, the first factory setup and a world-action tutorial through the first customer and weekly report. Integrate the new engine via src/v4/ without breaking the legacy App path. Proposed tests/v4-onboarding.test.mjs covers actual action completion, skip/resume, reload mid-guide and locked-control visibility.

Task C2 builds the named-staff and equipment views with local summaries, then the Reports Centre overview, Finance, Sales and demand, Supply and inventory, Production and people, News and updates, and Obligations views, with progressive category visibility and the mobile task hierarchy. Capture the same production and pricing task on desktop and 390-pixel phone viewports. The player must adjust quantities and inspect the resulting hours without scrolling to another part of the sheet.

Task C3 plays at least 12 opening weeks across a cautious, ambitious and deliberately poor plan using real controls. Record actual choices, resulting cash, unsold stock, bottlenecks and recovery. Ask whether the world actions are necessary and satisfying, whether decisions are consequential, and whether a first-time player knows what to do.

Exit gate: the opening is understandable and meaningfully challenging, not a guaranteed-sellout tutorial. Do not scale all cities or author the entire advanced campaign before this slice demonstrates the desired loop.

### Phase D Build the lab and factory process activities

Task D1 implements research.ts with staged projects, fees, staff time, tests, revisions and release criteria. Proposed tests/v4-research.test.mjs covers failed revisions retaining knowledge, proper sunk/remaining cost, paused projects, shelf-life qualification and no recipe unlock from unpaid testing.

Task D2 implements process.ts and the tempering/commissioning activity. Proposed tests/v4-process.test.mjs covers factory/recipe isolation, equipment-signature changes, retained best valid profile, skill limits, transferred methods, real production-minute effects and equivalent assisted-mode outcomes. Activity input timing must be normalized independently of frame rate.

Task D3 implements the modular factory layout and visible trial, using production.ts as the source of truth. Proposed tests/v4-layout.test.mjs covers blocked routes, utility limits, invalid placements, handoff distance, removal of used equipment and layout reload. Actual screenshots and a played trial must show the bottleneck, not just a numerical bonus after decoration.

Exit gate: commissioning visibly changes a relevant factory-recipe's weekly output under controlled conditions; replay is occasional; inaccessible timing never blocks progress; R&D materially competes with other investments.

### Phase E Complete the founder and network campaign

Task E1 adapts the existing contacts and journey into stages 1 to 3, with 21 chapters, recoverable branches and threshold gates. Implement the first nine side commissions and the opening/middle relationship decisions alongside them. New content lives in game/v4/content/campaign.ts; campaign.ts evaluates conditions. Proposed tests/v4-campaign.test.mjs covers alternative viable routes, repeated meetings, failed orders, declined offers, recovery, optional hints and no false completion.

Task E2 completes the first eight city environments and core interiors in the progressive manifest, including Oaxaca and Salvador, to the accepted San Francisco standard, with distinct geography and gameplay roles. Reuse materials and rendering infrastructure, not identical city layouts. Each city requires actual matched screenshots, place-picking tests, navigation and a real story/sourcing transaction.

Task E3 implements inter-factory transfers, managers and delegated purchasing/production. Proposed tests/v4-delegation.test.mjs covers cash authority, locked suppliers, committed orders, manager absence, interrupted travel and deterministic four-week advancement. The player must retain the option to inspect and override a plan.

Exit gate: a complete stage-1-to-3 playthrough uses world actions and all eight unlocked city roles, survives a supply shock when prepared, exposes clear risks when unprepared, and ends at a meaningful network review rather than a dead button.

### Phase F Deliver the advanced brand campaign

Task F1 builds Istanbul and Mumbai with their regional briefs and implements owned retail and ecommerce with channel-specific costs, forecasts, fulfillment, retention and returns. Proposed tests/v4-channels.test.mjs covers oversold stock, delayed refunds, shipping subsidy, acquisition cost, price conflict and channel contribution reconciliation. Stage 4 story objectives must use these mechanics.

Task F2 builds Accra with its supply/partner arc and implements franchise cohorts, support capacity, commercial terms and brand compliance. Proposed tests/v4-franchise.test.mjs covers partner versus group revenue, fees/deferred obligations, supply margin, support overload, stopped openings and regional spillover. Stage 5 must require a viable operating standard, not merely enough cash to press Open.

Task F3 builds Singapore with the regional-hub arc and implements executive/region views, capital allocation, late-game shocks, long-turn interruption and the fictional valuation milestone. Proposed tests/v4-global.test.mjs covers rolling-window gates, borrowing not inflating valuation, sustained success, downside conditions and the complete finale scene. Stage 6 must introduce allocation/oversight decisions while preserving access to the world.

Task F4 completes the remaining nine regional commissions, all six relationship arcs, the final product/ingredient unlocks and the complete Reports Centre at group/region/channel scale. Test reports under twelve-city operations and several hundred simulated weeks; use lazy aggregation, not an unbounded rendered row for every event.

Exit gate: all 42 main chapters, 18 side commissions and six relationship arcs are playable, the global ending requires a sustainably functioning business, and late-game routine effort falls as delegation grows. Advanced campaign mechanics are launch requirements under the recommended scope, not a post-launch placeholder.

### Phase G Balance accessibility and release candidate

Task G1 runs the scenario and economic tests in section 20, fixes causal problems and records the final balance configuration. Test weak and strong strategies, not just the known winning script. Use accelerated simulation for long horizons and actual played slices for experience.

Task G2 verifies responsive layouts, keyboard and assisted modes, low-quality 3D, no-WebGL fallback, save failure, offline/reload behavior and real-device performance where devices are available. A missing physical-device test remains a disclosed blocker to claiming that device is supported at launch.

Task G3 prepares a release candidate, release notes, migration guidance and rollback artifact. Run typecheck, all tests and production build, then play the built artifact. Release only the complete candidate through the parent's authorized publication workflow; never publish a partial scope as V4. After publication, verify the deployed bytes/version, live saves, representative opening and late-game actions and rollback readiness.

Exit gate: all critical acceptance checks pass, the parent and independent review check the candidate against the approved experience, remaining noncritical limitations are named, and no material scope cut or paid service is introduced.

### Dependencies and review focus

A precedes B. C depends on the kernel but should begin before the full content expansion. D depends on production/people/quality; E depends on C and D; F depends on stable E/delegation; G validates the integrated game. City art can progress alongside economic work only after the style criteria and the city's action map are agreed. Avoid concurrent edits to the same engine or campaign files without an integration owner.

The five highest-risk cross-system cases are an arrival/expiry/contract on the same boundary week; interrupted multiweek advancement; a recipe or equipment revision invalidating a process at only one factory; a warehouse becoming full after an order is placed; and a late-game operation reporting partner revenue as group cash. Their named tests belong respectively to sourcing/sales, delegation/saves, process, sourcing/inventory and franchise/ledger.

## 20 Expanded review loop and finite acceptance gates

Review more than appearance and absence of errors. Each iteration begins with an approved target experience and a reproducible scenario, records the actual build, compares evidence, fixes the largest gap and reruns the affected checks. Do not install or depend on an external review-loop service; this is a workflow using existing capabilities.

### Visual and world review

Capture actual desktop and phone scenes against approved references with the same location, game state, camera intent, viewport, device pixel ratio and motion setting. Judge connected geography, proportions, materials, lighting, landmarks, readable interaction targets and world-state changes. Generated target images are design references, never proof that the running game looks that way.

Every city must pass its own default exterior, important interior and a real interaction. San Francisco must retain its accepted character. No city may ship with placeholder terrain or copied geography merely because another city passed. A screenshot alone cannot establish picking, camera control or performance; play those actions.

### Economic verification

Run at least 200 deterministic seeds for opening and midgame strategies, plus long-horizon network/franchise simulations. The seed count is a proposed minimum for varied scenarios, not proof by itself. Include conservative, premium, volume, debt-heavy, understocked, overexpanded and delegated-policy strategies. Investigate outliers and arithmetic invariants.

Acceptance properties include: all money and inventory reconcile; no negative/invalid stock; no duplicate obligations; higher price does not raise identical-offer demand absent an explicitly modeled signaling rule; finite markets cannot be multiplied by product duplication; bulk savings cannot create resale arbitrage loops; and there are at least two viable strategic routes through each stage. Buying the most expensive option everywhere must not dominate every scenario.

Suggested initial difficulty target: a competent cautious opening survives most ordinary seeds, an aggressive expansion strategy has a meaningful downside, and an uninformed default plan does not automatically fund all early upgrades. Do not set a universal win-rate target until first-time playtests establish what competent means. Distinguish solvability from fun.

### Actual played scenarios

Complete one full ordinary campaign with real interface actions, plus separate focused sessions for the early debt squeeze, R&D failure/revision, factory bottleneck, supplier disruption during travel, packaging mismatch, cash/profit divergence, ecommerce growth at a loss, franchise quality failure and recovery. Accelerated fixtures can test later systems, but cannot substitute for the full campaign route.

For each session record the starting save, intended decision, actual controls used, result and whether the player could explain the cause. At least two fresh reviewers should attempt the opening without instruction beyond the game. Target: both can find the first task, make a viable plan and explain the first result without external coaching. If they cannot, fix guidance rather than adding another permanent paragraph.

Assess strategy and enjoyment directly: Did the choice change the result? Was the tradeoff visible? Was there more than one sensible answer? Did the world interaction add context or agency? Did a repeated task become tedious? A mathematically balanced but boring activity fails the experience gate.

### Performance and accessibility

Proposed support target: current desktop Chrome/Safari and a defined midrange iPhone Safari baseline, with an Android baseline only after device validation. At Phase A, record the actual devices/browser versions available for testing. Missing physical-device access does not block starting implementation, but must remain explicit in the support and release evidence. Test at 390 by 844, 430 by 932, 768 by 1024, 1196 by 852 and 1440 by 1000, including large text and safe areas. Viewport emulation is layout evidence, not physical-phone certification.

Proposed performance gates on the selected real devices: stable interactive scenes at a median 30 frames per second or better, typical input response under 100 milliseconds, ordinary sheet openings under 250 milliseconds after assets are ready, and no progressive memory growth across a 30-minute navigation/production session. Record p95 frame/input behavior and thermal degradation as well as averages. Tune or revise these targets through an explicit support decision if the chosen baseline cannot meet them; do not quietly substitute software-GPU measurements.

Use adaptive detail, batching, lazy city loading and bounded background animation. Avoid adding expensive reflections or asset density merely to chase a still image. Reduced motion must stop unnecessary animation. Keyboard users can reach every strategic action; focus is restored on closing sheets; text does not rely on color alone; timing alternatives preserve the campaign and economic ceiling; fallback actions retain clear location context.

### Duration and new scope acceptance

Test the long campaign as a game, not only a ledger. Record active decision time, distinct choices, travel/encounter time, activity time and repeated maintenance separately. Exclude loading failures, assistant reasoning/tool latency, idle time and forced waiting from active-play duration. Use actual complete ordinary play sessions and fresh-player feedback where available. A fast scripted/agent route is useful for solvability and identifying shortcuts but is not a measurement of typical human completion time. Until measured, describe 24 to 36 hours only as an internal target.

If the complete campaign can be rushed through in a few hours using normal controls because chapters are token clicks, fail the pacing gate. Check that the 42 main chapters apply new decisions and consequences and cannot be skipped through future-turn delegation. If active-play evidence falls short of the intended multi-session depth, rework weak scenarios and bring forward meaningful optional branches; do not solve it with higher cash gates, slower clocks or compulsory repeated activities. If the target cannot be validated with available testers, disclose the missing evidence and do not make a measured-duration marketing claim.

All twelve cities require real scene and interaction evidence. All 37 ingredient varieties require at least one valid recipe or commercial role, non-identical relevant behavior and mature dual sourcing. All eight cocoa-origin profiles need a controlled comparison against another origin under a recipe brief. All 24 recipes need valid ingredient paths, process commissioning, cost/yield/shelf-life treatment and reachable release criteria. Reports must reconcile to the same simulation state across company, factory, channel and region scopes and survive save/reload with historical actuals unchanged.

Add report-focused UI scenarios: investigate a profitable but cash-short week; explain a demand miss caused by stock reservations; find an impending seasonal shortage; trace one loan installment; compare two factories' calibrated recipe costs; and identify franchise partner sales versus group revenue. The player must reach the responsible world entity in one drill-down from the explanation. On phone, changing the period or scope must not strand the totals above a long scroll or hide the selected basis.

### Completion rule

Release is ready only when required content exists, all severity-1 and severity-2 defects are closed, economic invariants and campaign routes pass, each city meets its approved visual criteria, the defined device/support gates are satisfied or explicitly narrowed by Bilal, saves are protected and the parent accepts the candidate against these gates. Severity 1 covers data loss, crashes and blocked campaigns; severity 2 covers materially wrong economics, unusable required interactions or missing approved content.

Stop polishing when these criteria pass and remaining issues are cosmetic or optional enhancements with named tradeoffs. A new artistic preference or feature idea returns to review rather than silently extending the build. If a target is infeasible, present the evidence and the smallest scope/quality choice; do not keep iterating without a decision or pretend it passed.

## 21 Settled defaults and immediate handoff

The owner has approved the summary and the build. These defaults are settled for execution under that approval and delegated judgment:

1. Launch the complete six-stage game. Build 42 main chapters, 18 regional commissions, six relationship arcs, 12 explorable cities, 24 recipes, 37 ingredient varieties, eight cocoa origins and 24 suppliers. No smaller or early-access substitute.
2. Use Standard difficulty with recoverable debt trouble, visible arrears and costly restructuring before terminal bankruptcy. Strict and relaxed settings are optional variants of the same systems, not separate campaigns.
3. Advance weekly early, then offer interruptible four-week management turns and later 13-week reviews. Never skip unresolved story or exception decisions.
4. Preserve legacy saves and their rules in an isolated mode, alongside separate new V4 slots. Carry identity only into a fresh campaign; do not silently convert old economics.
5. Timed per-factory/per-recipe commissioning materially controls production efficiency. Preserve a better valid profile, allow retraining and provide an equally capable untimed mode. Qualified staff can take over routine processes and later commissioning within budgets.
6. Start one shared campaign with two or three viable equipment/funding packages and three gradually introduced commercial supplier options. The wider supplier catalog unlocks through world progress.
7. Use a fictional $2 billion enterprise-value milestone sustained through four quarterly reviews with cash-flow, service, quality and debt conditions. Its coefficients and gate thresholds are provisional; do not count borrowing or partner turnover as group value creation.
8. Build browser-first with local saves and included tools. No real payments, ad integrations, paid services or cloud-sync account system are added. Record actual device availability during Phase A and validate support before making device claims.
9. Keep optional buyer tasting a short commercial encounter only if it adds a meaningful decision. Supplier-testing minigames remain excluded.

Immediate execution packet for the fresh Sol 6.1 Medium task:

- A1: Read this complete revision and the repository's instructions; inspect current main, working-tree status, package scripts and test inventory. Use the assigned saved-cloud environment and an isolated feature branch. Record the baseline and preserve hosting identity. Run baseline typecheck, tests and build before modifying the product; record any pre-existing failure.
- A2: Define the minimal versioned V4 save envelope in game/v4/model.ts, then add a version-6 legacy fixture, new-slot fixture and corrupt/future-save fixtures; A3 extends that same model file. Write tests/v4-save-boundary.test.mjs first and implement the minimal isolated boot/save boundary in the verified App integration seam. Prove legacy data is unchanged and a V4 slot cannot overwrite it.
- A3: Add game/v4/model.ts, catalog.ts and content/launchManifest.ts with the shared contracts and the exact launch counts/reachability rules. Add tests/v4-content.test.mjs for catalog references, ingredient compatibility, seasonal windows and staged access. Do not scatter new IDs across component-local lists.
- B1: Implement atomic commands, monetary/quantity units, the ledger and one weekly tick behind tests/v4-ledger.test.mjs. First prove deposits, loan principal and internal transfers cannot manufacture revenue, and a repeated tick cannot book twice.
- B2 to B5: Implement sourcing/inventory, production/people/quality, demand/sales and reports against the contracts in section 18 and the report contracts in section 7. Only then connect the first complete world-action slice. Do not build 12 scenes before the early loop is working.

Use npm run typecheck, npm test and npm run build for aggregate verification. Run a new Node test file directly with node --experimental-strip-types --test tests/v4-content.test.mjs or its owning test file while developing. Each task starts with a failing assertion, implements the contract, reruns the affected suite and ends with a focused reviewed commit. The roadmap names the exact proposed source/test locations; inspect existing files before integration edits rather than inventing line numbers.

Send progress at meaningful outcomes: baseline/save protection proven; first playable opening with an actual screenshot and observed economy; lab/commissioning working; first new regional destination; network campaign complete; advanced channels and full Reports Centre working; complete-campaign/pacing evidence; release candidate. Share a blocker as soon as it materially affects scope, access, risk or timing. Routine activity logs and repeated unchanged summaries are unnecessary.

No additional routine approval gate belongs between this pass and the build. Escalate a genuine material reduction of the full-game scope, an external purchase/service or new consequential commitment, inaccessible required resources, or a failed quality target that cannot be resolved within the agreed approach. Continue independent authorized work meanwhile. The planning pass itself makes no product or repository changes.

## 22 Requirement traceability

Every item below is accounted for in the design and a build phase. R means owner requirement; P means an earlier discussion proposal whose current disposition is stated; E means current-build evidence. Section references are to this document.

R01 Harder competitive opening and a less generous local market: sections 6, 12 and 20; phases B and C. Prove it with controlled demand tests and actual opening play, without replacing clear guidance with obscurity.

R02 Player-created name, logo and colors: sections 6 and 15; phase C. Extend existing identity support and show it in world/packaging assets.

R03 Initial factory configuration with equipment/team quality, speed and capacity tradeoffs: sections 6 and 9; phases C and D. A visible trial must expose a real bottleneck.

R04 More expensive tiered machines and expansion: section 9; phases B, D and E. Capacity, space, staffing, quality and operating cost remain separate constraints.

R05 Two or three steps of changeover improvement rather than 8 to zero: section 9; phases B and D. Test each tier and compatible sequencing.

R06 Loans, interest and weekly repayment pressure: section 14; phases B and C. Financing includes a calendar, cash protection, arrears and recovery decisions.

R07 Every ingredient has quality and distinct suppliers; worldwide/progressive access; initial count flexible: section 8; phases B and E. One catalog serves manual and automatic sourcing.

R08 Ingredients, suppliers, people and equipment jointly affect quality, cost, price viability and demand: sections 7, 9 to 12; phases B and D. One evaluation pipeline supplies previews and actual outcomes.

R09 A readable business view beyond repeated panels: sections 7, 15 and 16; phases C and F. The overview explains causes and links back to their world locations.

R10 Named staff, skills, cost, hours, training and workload: section 9; phases B, C and E. Late-game cohorts retain named leaders and meaningful staffing choices.

R11 Bulk discounts and meaningful expandable storage rather than a one-week cap: section 8; phase B. Verify cash, shelf life, arrival-date capacity and overflow behavior.

R12 Remove arbitrary purchase and price caps; dynamic availability, seasonal effects and demand constraints: sections 8, 12 and 13; phase B. Technical validation must not recreate hidden gameplay caps.

R13 Economic, social and consumer-psychology forces with planning opportunities: sections 12 and 13; phases B, E and F. Signals, affected segments, duration and outcomes are explained.

R14 More nuanced direct sales and orders, especially later: section 12; phases B and F. Different channel costs, terms, service and cash cycles make decisions distinct.

R15 Demand forecasts that communicate uncertainty and more than one unexplained number: sections 7 and 12; phases B and C. Separate demand, feasible sales and unserved causes.

R16 Premium wrappers integrated through cost and customer preference: section 12; phases B and F. Packaging is not a universal bonus; it affects stock, packing time and product fit.

R17 Warm modern professional 2026/Gen Z presentation and email rather than old letters: section 15; phases C and E. Apply to people, copy, environments and interface language.

R18 All cities follow the accepted detailed San Francisco standard while supporting gameplay: sections 5, 15 and 20; phase E. Distinct geography and actual interactions are checked for each city.

R19 World-first play with panels assisting: sections 4 and 15; phases C to F. Factory trials, discoveries, meetings, launches and visible consequences take place in the world.

R20 Nadia/assistant guided opening plus explanations at unlock: section 15; phases C and E. Real-action completion, skip/resume and contextual email replace lectures.

R21 Clear goals and city/person leads with local discovery: sections 5 and 15; phase E. Optional hints prevent opaque objectives while preserving exploration.

R22 A longer original campaign, threshold transitions and advanced higher management toward a multibillion brand: sections 5 and 16; phases E and F. Franchising, high-end marketing, retail and ecommerce are in the approved full launch scope; the expanded content manifest and pacing gates apply.

R23 New stages introduce new decisions and delegation rather than only larger numbers: sections 4, 5 and 16; phases E and F. Playtests assess reduced routine work and genuinely different choices.

R24 Recipe Lab with substantial lab, specialist, pilot, taste-panel, expiry/stability and revision costs: section 10; phase D. It is a strategic abstraction with no real regulatory claims.

R25 Factory setup activity with excellent graphics and substantive mechanics: sections 9, 15 and 20; phase D. Decoration alone cannot pass acceptance.

R26 Supplier testing activity rejected: sections 3 and 10; all phases. Exclude it from content, task lists and later feature creep.

R27 Tempering liked; some timed activities materially set hours for each factory and recipe: section 10; phase D. Saved profiles change real schedule capacity under controlled tests.

R28 Strategy remains primary; activities occasional rather than mandatory weekly chores: sections 10, 11 and 16; phases D and F. Staff repeat certified methods and later experts can commission.

R29 Buyer tasting tentative, left to judgment: sections 10 and 21; optional phase-D experiment. Do not make it a compulsory core pillar.

R30 Owner feedback outranks conflicting Luna findings: sections 2, 3 and 20; all reviews. Positive panel findings do not waive world, guidance or campaign requirements.

P01 Retryable calibration, no permanent penalty from one bad attempt and later staff execution: section 10; selected phase D. P02 Untimed accessibility alternative: sections 10 and 20; approved summary default. P03 Recoverable trouble and preserved legacy saves: sections 14 and 17; approved summary defaults. Physical-device evidence remains a release verification responsibility, not a claim already established.

E01 Existing grades, capacity, staff tiers, upgrades, orders/deposits/payment delays, dynamic quotes and stock rules: sections 3 and 18; retain or deliberately rework, never claim absent. E02 Known supplier inconsistency and pricing overlap: sections 8 and 15; mandatory regressions. E03 Travel stockout with warning is meaningful risk: sections 3 and 11; preserve. E04 Existing finale button fails its promise: sections 3 and 5; replace with an actual scene. E05 3D and physical-phone limits of earlier testing: sections 3 and 20; do not overclaim verification.

R31 Full game at initial launch, not a smaller or early-access version: sections 1, 5, 19 and 21; all phases through the complete release gate.

R32 Much longer than a few hours or an ordinary single-day session without grinding: sections 5 and 20; 42 consequential main chapters, 18 side commissions, continuing relationships and measured pacing verification. The 24-to-36-hour target is provisional, not a measured claim.

R33 Progressively expanding world beyond the initial cities: sections 5 and 15; phases E and F. Twelve fully explorable cities include six new destinations, each with a strategic/story role and actual visual/interaction acceptance.

R34 Many ingredients, nuts, cocoa origins, regional flavor profiles, harvest seasons and supply differences: section 8; phases B, D, E and F. The 37-variety catalog, eight origins, twenty-four recipes and seasonal contracts must change actual decisions.

R35 Dedicated reports for news, updates, weekly position, cash flow, P&L, sales/demand, supply/inventory/production and obligations: section 7; phases B5, C2 and F4. Historical snapshots, forecast labels, reconciled drivers and world drill-downs are explicit contracts and acceptance tests.

R36 Start the build after this incorporated planning pass with meaningful progress updates: sections 1, 19 and 21. Fresh Sol 6.1 Medium is the selected execution setting; no further routine plan-approval pause.

## 23 Sources and implementation handoff

Primary design sources are Bilal's review and discussion on 5 October 2026: the full review at 15:44 PKT, the terms and depth discussion at 16:16 PKT, the activities and expansion choices at 21:47 PKT, and planning approval with owner-feedback priority at 22:03 PKT. Those messages established the design. The later ChatGPT notes and approval on the same date expand the world, ingredients, duration and reports and authorize implementation after this incorporated pass.

- Full review: https://bilal-crn5773.slack.com/archives/D0C64UB3HCZ/p1791197053874109
- Depth and terminology: https://bilal-crn5773.slack.com/archives/D0C64UB3HCZ/p1791199009381979
- Activities and advanced campaign: https://bilal-crn5773.slack.com/archives/D0C64UB3HCZ/p1791218876213279
- Planning approval and priority: https://bilal-crn5773.slack.com/archives/D0C64UB3HCZ/p1791219824309729
- Current playable site: https://cacao-house-maravel.dev-ashish-10-code.chatgpt.site
- Inspected source revision: https://github.com/bilalmoten/cacao-house/commit/168bdda114a540bcf39498293187309176e7ee8a
- Source entry points: game/engine.ts, game/growth.ts, game/journey.ts, game/travel.ts, game/sourcing.ts and src/App.tsx at that revision.
- Latest ChatGPT direction: Bilal's expansion/reporting/full-launch notes, followed by the approved bullet summary and his 18:28 UTC instruction to proceed, with discretion to incorporate another focused planning pass.
- Supporting playtest: Cacao House six-week playtest, 5 October 2026, 12-page PDF already delivered in the game discussion. Its controlled-test and 3D limitations are carried into this plan.

The implementation handoff is this revised specification, the settled defaults, the repository baseline to verify, the tunable balance configuration and the named phase tests. The fresh implementer should start the section 21 packet and continue through the full roadmap. Do not infer permission for paid services, material scope cuts or unrelated consequential actions from this build authorization.

Routine design review is complete for this incorporated scope. Numerical tuning and quality review now happen through implementation evidence. The intended result is a coherent, demanding, substantially longer business game with an expanding world worth visiting, from the first workshop to the global brand.
