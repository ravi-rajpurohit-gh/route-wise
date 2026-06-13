# RouteWise Engineering Notes

This log records implementation reasoning, investigations, fixes, and material
technical observations. Durable architectural choices belong in ADRs; planned
work belongs in the project tracker.

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
