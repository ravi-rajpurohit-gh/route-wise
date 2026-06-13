# RouteWise Product Brief

## Problem

Retail applications can identify a store and show an item's aisle, but a list
of aisle labels does not provide an efficient route through a large store.
Fulfillment shoppers therefore spend avoidable time walking and backtracking.

## Target user

RouteWise serves both regular shoppers and delivery or fulfillment shoppers. They share one core store-aware cart and guided-shopping journey; delivery-focused efficiency capabilities may be introduced as optional features.

## Value proposition

RouteWise sequences a cart into a practical entry-to-checkout path that reduces
walking distance while respecting operational constraints.

## Product journey

The product uses a mobile-first, store-first journey: select a store, search products, build and manage a cart, choose a shopping order, preview the route, and complete a guided shopping session.

## MVP boundaries

The MVP deliberately does not claim live indoor positioning. It assumes a
known starting entrance, a versioned store graph, and item-to-location data.
Users can mark items picked, report cannot-find states, save items for later, or remove items. Cart state persists on the current device. Prices, accounts, and cross-device sync are outside the current scope.

## Success metrics

| Metric | Initial target |
| --- | ---: |
| Median distance reduction vs. aisle-order baseline | >= 15% |
| Constraint violations | 0 |
| Route computation for carts up to 100 items | < 500 ms |
| Successful route generation on connected graphs | 100% |

Distance reduction is the primary technical metric. Actual pick-time reduction
must eventually be validated through observed shopping sessions rather than
claimed from simulation alone.

## Technical approach

The store is a weighted, undirected graph. Entrances, aisle intersections,
pick locations, and checkouts are nodes. Walkable segments are edges, and each
store graph defines a map-unit-to-feet scale for defensible distance reporting.
Dijkstra computes shortest paths between stops. The first heuristic uses
nearest neighbor sequencing and defers cold items. The next iteration should
add 2-opt route improvement and benchmark it against aisle order, nearest
neighbor, and small-cart exact solutions.

## Key risks

- Retail store graph and shelf-location data may not be publicly accessible.
- GPS does not provide reliable aisle-level indoor location.
- Shortest distance is not always shortest time because congestion and search
  time matter.
- Product handling and fulfillment policies can conflict with pure distance
  optimization.
- A simulated improvement is not evidence of operational impact until tested
  with real users.

## Portfolio narrative

The project should be presented as an operations-research and product-
engineering case study, not as a claim that a retailer has overlooked routing.
The strongest evidence will be reproducible benchmarks, transparent
assumptions, polished interaction design, and thoughtful handling of real
constraints.
