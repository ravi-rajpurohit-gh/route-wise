# ADR 0004: Separate Cart Products from Store Placements

- Status: Accepted
- Date: 2026-06-13

## Context

The first vertical slice stores `aisle` and `nodeId` directly on each cart
item. This works for one deterministic store but makes the cart inseparable
from Store 1842. The same product can occupy different aisles, nodes, or
availability states in different stores.

## Decision

Represent carts as store-independent product IDs and quantities. Resolve those
products to versioned store placements after a store is selected. Pass only
resolved pick items and the selected layout to the optimizer.

Introduce a repository interface and use validated static fixtures before
adding database persistence.

## Consequences

- The same cart can be routed through multiple stores.
- Product availability and unresolved placement become explicit states.
- Layout versions and placements can be tested independently.
- The UI must handle asynchronous store selection and resolution.
- Fixture validation becomes a required quality gate.
- A database can be introduced later without coupling the optimizer to it.

## Alternatives considered

- **Duplicate carts per store:** Simple but creates inconsistent shopping intent
  and does not scale.
- **Keep aisle and node on cart lines:** Prevents reliable multi-store routing.
- **Add a database immediately:** Introduces infrastructure before the domain
  model and user flow are validated.
