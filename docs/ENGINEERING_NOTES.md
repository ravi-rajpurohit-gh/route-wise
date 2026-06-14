# RouteWise Engineering Notes

This log records implementation reasoning, investigations, fixes, and material
technical observations. Durable architectural choices belong in ADRs; planned
work belongs in the project tracker.

## 2026-06-13: Deliver the guided-pick workflow

### Product behavior

- Added a functional store selector that resolves the same cart for each store.
- Defined `Start picking` as the transition from route review to an active pick session.
- Added explicit `Picked` and `Skip` actions for each pending item.
- A picked item advances the confirmed shopper location and recalculates the remaining route.
- A skipped item leaves shopper location unchanged and removes the item from the active route.
- Store changes and session reset clear all pick progress.
- Unavailable and unresolved items are displayed outside the active route.

### Production-facing language

Removed internal development labels from the application interface. Technical documentation continues to record data provenance and validation limitations.

### Map direction

The map now renders the selected layout instead of Store 1842 directly. It remains a routing-oriented diagram; a customer-friendly store-map visualization is tracked as a later visual-design milestone.

### Verification

- Added pure pick-session tests for starting, picking, skipping, and location updates.
- Added UI integration tests for store selection, unavailable items, starting a session, picking, skipping, and progress reset.
- All 22 tests, lint, production build, formatting checks, and production dependency audit pass.

## 2026-06-13: Test checkpoint and next-step assessment

### Verification performed

- Ran lint, 15 automated tests, and the production build successfully.
- Confirmed zero known vulnerabilities in production dependencies.
- Started one temporary Vite server on port 5173 and confirmed the application and source modules were served successfully.
- Audited current UI integration points against the multi-store route-planning service.

### Findings

- Multi-store resolution and route planning are working in tested product logic.
- The current UI still reads `sampleStore` and `sampleCart` directly.
- The store control is static and unresolved products are not displayed.
- `StoreMap` reads Store 1842 edges directly and hardcodes aisle blocks and zone labels, so a store selector alone would produce incorrect map rendering for other layouts.
- Browser-driven screenshot and click automation could not reconnect after the repository relocation; interaction smoke tests need a repaired browser session or dedicated UI test harness.

### Correct next order

1. Define layout visualization metadata or a derivation rule.
2. Refactor the map to receive the selected layout.
3. Connect store selection to `planRouteForStore`.
4. Display unresolved items and reset progress on store changes.
5. Add UI integration and responsive visual tests.

## 2026-06-13: Build the multi-store domain foundation

### Objective

Allow one store-independent cart to resolve into different product placements and route inputs for multiple stores before adding store-selection UI.

### Implementation

- Separated products, carts, stores, layout versions, placements, and resolved pick items.
- Added a fixture-backed repository behind a persistence-independent interface.
- Added three stores with distinct layout transforms and product placements.
- Added cart resolution with explicit unknown-product, missing-placement, and unavailable states.
- Added a route-planning service that returns resolved cart state, route context, baseline, optimized route, and savings in one call.
- Added fixture validation for stores, layouts, nodes, edges, entrances, checkouts, products, and placements.
- Tightened fixture validation to reject duplicate store, layout, product, and per-layout product-placement identifiers.
- Updated the optimizer contract to accept only a route context and resolved pick items.
- Preserved the current Store 1842 UI through a compatibility fixture export.

### Verification

- Tests verify fixture validity, invalid cross-layout and duplicate placements, store-specific aisle resolution, unavailable and missing-placement states, store-isolated route nodes, different product pick sequences, and complete route plans.
- UI store selection remains intentionally deferred to the next UI milestone.

## 2026-06-13: Initial product and engineering framing

### Objective

Turn an in-store cart-sorting idea into a credible optimization product that
can be evaluated by engineering and technology leaders.

### Analysis

An aisle label solves product discovery but does not sequence an entire cart.
The primary business case is fulfillment efficiency, not merely convenience
for ordinary shoppers. The solution must therefore compare itself against
transparent baselines and respect product-handling constraints.

The MVP intentionally avoids claiming live aisle-level GPS. It assumes a known
entrance, versioned graph, and product locations. This keeps the first claim
testable and avoids depending on inaccessible retailer systems.

### Implementation

- Created a React and TypeScript vertical slice.
- Modeled the store as a weighted undirected graph.
- Implemented Dijkstra shortest paths and nearest-neighbor sequencing.
- Deferred chilled and frozen items.
- Added aisle-order comparison, route visualization, and pick progress.
- Added tests for core route invariants.

### Result

The deterministic sample route is 32% shorter than aisle-order sorting.

### Follow-up

Generalize the claim through generated carts, stronger heuristics, and exact
small-cart comparisons before presenting the percentage as evidence.

## 2026-06-13: Correct route-distance units

### Problem

The first UI displayed raw SVG coordinate distance as feet. The relative
comparison remained internally consistent, but the absolute distance and time
claims were not defensible.

### Fix

Added `feetPerMapUnit` to the store domain model and applied it while weighting
graph edges. The sample optimized route changed from an unrealistic `2,793 ft`
to `698 ft`, while preserving the 32% relative improvement.

### Verification

- Unit tests passed.
- Production build passed.
- Browser inspection confirmed the corrected distance and time.

## 2026-06-13: Establish executable quality gates

### Problem

The initial lint configuration used JavaScript parsing rules and could not
parse TypeScript source. Build and tests passed, but lint was not a functioning
quality gate.

### Fix

- Added the TypeScript ESLint parser and recommended rules.
- Added `npm run check` to run lint, tests, and production build.
- Separated runtime dependencies from development tooling.

### Verification

- `npm run check` passes.
- Runtime dependency audit reports zero known vulnerabilities.
- Build-tool advisories remain in development dependencies and require a
  future major Vite upgrade assessment rather than an unreviewed forced update.

## 2026-06-13: Repository relocation and documentation standards

### Objective

Move the project to the long-term development workspace and establish durable,
production-grade documentation practices.

### Implementation

- Moved the complete repository to
  `/Users/ravirajpurohit/Downloads/Developer/routewise`.
- Added architecture, tracker, engineering notes, ADRs, contribution guidance,
  and changelog.
- Documented definition of done and documentation ownership.

### Rationale

Production-grade documentation should preserve decisions and evidence without
dumping transient internal reasoning into code comments. The chosen records
separate product intent, architecture, decisions, progress, investigations,
and externally meaningful changes.


## 2026-06-14: Mobile shopping foundation

### Objective

Turn the route optimizer into a store-first shopping journey that works for regular and delivery shoppers on mobile devices without requiring accounts or price data.

### Product decisions

- Require store selection context before product availability and placement are resolved.
- Keep product prices outside the current scope.
- Persist state on the current device using a versioned storage envelope.
- Replace ambiguous skip behavior with cart save, remove, or cancel actions; use cannot-find only during active shopping.
- Offer added order, aisle order, and recommended route as explicit user choices.

### Implementation

- Added a mobile-first application shell with Shop, Search, Cart, and Route navigation.
- Added store-scoped search and availability-aware quick add.
- Added cart quantity, remove, save-for-later, restore, clear, and ordering behavior.
- Connected active cart lines to store-specific route planning and guided picking.
- Added current-device persistence with safe fallback for invalid or incompatible state.
- Added cart, persistence, and end-to-end UI integration tests.

### Verification

- 27 automated tests pass across seven test files.
- TypeScript production build passes.
- ESLint and whitespace checks pass.
- Live server smoke check passes at `http://127.0.0.1:5173/`.

### Remaining work

- Perform visual QA at 320px, tablet, and desktop widths when browser automation is available.
- Enforce 44px minimum touch targets throughout the interface.
- Add explicit migrations when a second persisted-state schema is introduced.
- Replace the node-derived route graphic with a customer-friendly store map.


## 2026-06-14: Production presentation and accessibility checkpoint

### Objective

Make the deployed proof of concept understandable to a hiring manager without requiring them to read the repository first, while improving interaction quality for mobile and keyboard users.

### Implementation

- Added an About navigation destination with the problem, solution, target users, route method, objective function, current evidence, and limitations.
- Added links to the deployed application and source repository.
- Added production search metadata and Open Graph metadata.
- Added a no-results search state, clear-cart confirmation, and completed-shopping state.
- Added visible keyboard focus treatment, meaningful product and cart control labels, active-navigation semantics, and 44px minimum interaction targets.
- Added narrow-screen behavior for the About content and five-item navigation.
- Added integration coverage for the About narrative, empty search results, and completed shopping.

### Verification

- 30 automated tests pass across seven test files.
- ESLint, TypeScript production build, and whitespace validation pass.
- Production build completes without CSS warnings.

### Remaining work

- Capture and review exact 320px, tablet, and desktop screenshots when browser automation is available.
- Add automated accessibility scanning and resolve findings.
- Create the longer external portfolio case study using measured benchmark results and interface screenshots.
