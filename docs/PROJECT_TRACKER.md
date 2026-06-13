# RouteWise Project Tracker

Last updated: June 13, 2026

## Objective

Build a credible, production-minded demonstration that measures how much a
constraint-aware pick path can reduce in-store walking distance and clearly
states the assumptions required to achieve that result.

## Current phase

**Phase 1: Validate the optimization claim**

The first vertical slice is complete. It proves the end-to-end experience on a
deterministic store and cart, but it does not yet establish general algorithmic
performance.

## Milestones

| Milestone | Status | Exit criteria |
| --- | --- | --- |
| M0: Product framing | Complete | Problem, user, MVP boundaries, risks, and success metrics documented |
| M1: End-to-end vertical slice | Complete | Store graph, optimizer, baseline, interactive UI, tests, and scaled metrics |
| M2: Algorithm validation | In progress | Generated-cart benchmarks, 2-opt, exact small-cart comparison, performance report |
| M3: Operational behavior | Planned | Unavailable items, substitutions, rerouting, multiple entrances, accessibility rules |
| M4: Service architecture | Planned | Versioned API, persisted graphs, observability, validation, and performance budgets |
| M5: Portfolio case study | Planned | Reproducible results, limitations, architecture narrative, and polished walkthrough |

## Current backlog

### Priority 0: Validate the claim

- Add deterministic generated-cart fixtures across multiple cart sizes.
- Implement a reusable distance matrix to avoid repeated shortest-path work.
- Add 2-opt improvement after nearest-neighbor initialization.
- Add an exact solver for small carts to measure heuristic optimality gaps.
- Produce benchmark output for aisle order, nearest neighbor, 2-opt, and exact
  solutions where feasible.
- Test disconnected graphs and invalid store definitions.

### Priority 1: Improve operational realism

- Model unavailable items and substitutions.
- Recalculate routes from the shopper's current confirmed location.
- Add configurable entrance and checkout selection.
- Add fragile and heavy-item handling rules.
- Separate walking time from item-search and service time.

### Priority 2: Production readiness

- Define API contracts and structured validation.
- Add store-graph versioning and migration rules.
- Add CI quality gates.
- Add performance budgets and benchmark regression checks.
- Define observability and error taxonomy.
- Add accessibility and responsive interaction testing.

## Decisions pending

- Whether the next exact-solver comparison should use exhaustive permutation,
  dynamic programming, or OR-Tools.
- Whether route constraints should be hard rules, weighted penalties, or both.
- Whether the portfolio demo should remain a single application or introduce a
  service boundary during M4.

## Known limitations

- The current 32% improvement is based on one deterministic sample cart.
- The store graph and cart are synthetic.
- The current heuristic is not guaranteed to be globally optimal.
- Pick-time estimates derive from walking distance and require user validation.
- Indoor positioning and live congestion are outside the current MVP.
