# RouteWise Engineering Notes

This log records implementation reasoning, investigations, fixes, and material
technical observations. Durable architectural choices belong in ADRs; planned
work belongs in the project tracker.

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
