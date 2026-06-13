# ADR 0005: Use a Store-First Mobile Shopping Journey

- Status: Accepted
- Date: 2026-06-13

## Context

RouteWise began as a route-analysis experience. The target product now includes
store selection, product search, cart management, shopping-order choice, and
guided shopping for both regular and delivery shoppers.

Availability, aisle placement, and route calculation depend on the selected
store. The initial product also needs to work well on a phone while a shopper
moves through the store.

## Decision

Use a mobile-first, store-first shopping journey. Require store selection
before store-scoped search and active-cart building. Support regular and
delivery shoppers through one shared experience rather than an upfront role
choice.

Persist the selected store and cart on the current device. Defer accounts,
cross-device sync, prices, and delivery-specific batch capabilities.

Replace destructive Skip behavior with explicit choices: save for later,
remove from cart, or cancel. Treat cannot-find as a separate session action.

## Consequences

- Search results can show meaningful availability and aisle placement.
- Cart ordering and route previews remain tied to a known store.
- Store changes require availability resolution and session reset.
- Mobile interaction requirements influence every screen from the start.
- A future fulfillment mode can change defaults without duplicating the core
  product.
- Local cart persistence needs versioning and migration rules.

## Alternatives considered

- **Select store after building the cart:** More flexible browsing, but creates
  unavailable-item surprises and delays useful aisle information.
- **Require shopper-role selection:** Adds onboarding friction and splits a
  largely shared workflow.
- **Use Skip as immediate removal:** Fast but ambiguous and unexpectedly
  destructive.
- **Add accounts now:** Enables cross-device state but adds infrastructure
  before the local shopping workflow is validated.
