# RouteWise Project Tracker

Last updated: June 13, 2026

## Objective

Build a credible, production-minded demonstration that measures how much a
constraint-aware pick path can reduce in-store walking distance and clearly
states the assumptions required to achieve that result.

## Current phase

**Phase 1: Validate the optimization claim and establish product credibility**

The end-to-end vertical slice is complete. The current work focuses on making
the interface credible and proving algorithmic performance beyond one
deterministic cart.

## Milestones

| Milestone | Status | Exit criteria |
| --- | --- | --- |
| M0: Product framing | Complete | Problem, user, MVP boundaries, risks, and success metrics documented |
| M1: End-to-end vertical slice | Complete | Store graph, optimizer, baseline, interactive UI, tests, and scaled metrics |
| M1.1: Visual credibility pass | In progress | Operations-oriented interface, clear evidence hierarchy, responsive QA, no decorative product fiction |
| M1.2: Multi-store foundation | Complete | Store-independent cart, versioned layouts, product placements, three validated fixture stores, functional store selector |
| M1.3: Customer-friendly store map | Planned | Department zones, aisle geometry, landmarks, route overlay, and visual QA across stores |
| M2: Algorithm validation | In progress | Generated-cart benchmarks, 2-opt, exact small-cart comparison, performance report |
| M3: Operational behavior | Planned | Unavailable items, substitutions, rerouting, multiple entrances, accessibility rules |
| M4: Service architecture | Planned | Versioned API, persisted graphs, observability, validation, and performance budgets |
| M5: Portfolio case study | Planned | Reproducible results, limitations, architecture narrative, and polished walkthrough |

## Current backlog

### Priority 0: Multi-store foundation

- [x] Separate product catalog and cart lines from store placements.
- [x] Introduce versioned `StoreLayoutVersion` and `ProductPlacement` models.
- [x] Introduce a store repository interface and fixture-backed implementation.
- [x] Create three distinct fixture store layouts.
- [x] Map the shared sample cart to each store with different placements.
- [x] Validate graph, placement, entry, checkout, and availability references.
- [x] Define an initial node-derived visualization contract for store-specific layouts.
- [ ] Replace the routing diagram with a customer-friendly store-map visualization.
- [x] Refactor `StoreMap` to receive the selected layout instead of `sampleStore`.
- [x] Replace the static store control with a functional store selector.
- [x] Recompute route, metrics, map, and item sequence on store change.
- [x] Reset pick progress when route context changes.
- [x] Resolve unavailable, missing-placement, and unknown-product states before optimization.
- [x] Display unavailable or unresolved products in the interface.
- [x] Add tests proving routes never mix nodes from different stores.
- [x] Decide to defer persistence until fixture-backed multi-store behavior is validated.

### Priority 0: Visual credibility

- [x] Replace the generic marketing hero with an analysis workspace.
- [x] Put route evidence and baseline comparison above the fold.
- [x] Remove decorative profile UI and unsupported product fiction.
- [x] Establish a restrained operations-oriented color and typography system.
- [x] Present route performance and operational rules without internal development labels.
- [ ] Verify desktop, tablet, and mobile layouts against documented screenshots.
- [ ] Add keyboard focus states and automated accessibility checks.
- [x] Add UI integration tests for store selection, pick progress, skip actions, and store changes.
- [ ] Create a concise portfolio walkthrough using real interface states.

### Priority 0: Validate the claim

- [ ] Add deterministic generated-cart fixtures across multiple cart sizes.
- [ ] Implement a reusable distance matrix to avoid repeated shortest-path work.
- [ ] Add 2-opt improvement after nearest-neighbor initialization.
- [ ] Add an exact solver for small carts to measure heuristic optimality gaps.
- [ ] Produce benchmark output for aisle order, nearest neighbor, 2-opt, and
  exact solutions where feasible.
- [ ] Test disconnected graphs and invalid store definitions.

### Priority 1: Improve operational realism

- [ ] Model unavailable items and substitutions.
- [ ] Recalculate routes from the shopper's current confirmed location.
- [ ] Add configurable entrance and checkout selection.
- [ ] Add fragile and heavy-item handling rules.
- [ ] Separate walking time from item-search and service time.

### Priority 2: Production readiness

- [ ] Define API contracts and structured validation.
- [ ] Add store-graph versioning and migration rules.
- [x] Add CI quality gates.
- [ ] Add performance budgets and benchmark regression checks.
- [ ] Define observability and error taxonomy.
- [ ] Add accessibility and responsive interaction testing.

## Decisions pending

- Whether the next exact-solver comparison should use exhaustive permutation,
  dynamic programming, or OR-Tools.
- Whether route constraints should be hard rules, weighted penalties, or both.
- Whether the portfolio demo should remain a single application or introduce a
  service boundary during M4.

## Known limitations

- The current 32% improvement is based on one deterministic sample cart.
- Store layouts and cart data are maintained fixtures until retailer integrations are available.
- The current heuristic is not guaranteed to be globally optimal.
- Pick-time estimates derive from walking distance and require user validation.
- Indoor positioning and live congestion are outside the current MVP.
