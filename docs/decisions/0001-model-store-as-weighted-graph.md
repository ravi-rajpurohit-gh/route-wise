# ADR 0001: Model the Store as a Weighted Graph

- Status: Accepted
- Date: 2026-06-13

## Context

Aisle labels alone cannot represent valid walking paths, aisle openings,
entrances, checkouts, or blocked connections. Route optimization requires a
model that distinguishes geometric proximity from actual walkability.

## Decision

Represent each store as a weighted undirected graph. Nodes represent entrances,
checkouts, intersections, and pick locations. Edges represent valid walkable
segments. Edge weights are physical distance after applying a store-specific
map scale.

## Consequences

- Shortest-path algorithms can calculate valid walking distance.
- Store graph versions can evolve independently from carts.
- Product locations can be mapped to graph nodes.
- Building and maintaining accurate store graphs becomes a required input.
- Future one-way or restricted paths may require directed edges.

## Alternatives considered

- **Sort by aisle label:** Simple but does not represent walkability.
- **Use straight-line distance:** Underestimates routes through aisles and
  barriers.
- **Use a raster occupancy grid:** More detailed but unnecessarily expensive
  for the first validation phase.
