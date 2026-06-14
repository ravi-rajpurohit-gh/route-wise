# RouteWise Product Experience

## Product direction

RouteWise is a mobile-first shopping companion that helps regular shoppers and
delivery shoppers build a store-aware cart and complete it efficiently.

The route optimizer is one capability within the shopping journey. It is not
the application's landing experience.

## Product principles

1. **Mobile first, desktop complete:** The primary experience must work
   one-handed while a shopper moves through a store. Desktop supports planning
   and review without defining the mobile interaction model.
2. **Store first:** A selected store defines availability, aisle placement, and
   route calculation before products enter the active cart.
3. **One core journey:** Regular shoppers and delivery shoppers use the same
   basic workflow. Delivery-focused efficiency features can be introduced as
   optional capabilities rather than an upfront role choice.
4. **Cart before route:** Users build and manage a useful cart before choosing
   how to order or navigate it.
5. **Explicit actions:** Destructive or ambiguous actions require clear
   choices. Skip must not silently remove an item.
6. **Useful without accounts:** Initial persistence stays on the current
   device. Accounts and cross-device carts are deferred.
7. **No price scope:** Product price and checkout payment are outside the
   current product scope.

## Primary journey

```text
Select store
→ Search products
→ Add and manage cart
→ Review availability
→ Choose shopping order
→ Preview route
→ Start guided shopping
→ Pick, defer, remove, or report unavailable items
→ Complete shopping
```

## Mobile information architecture

Primary mobile navigation:

```text
Shop | Search | Cart | Route
```

### Shop

- Lightweight trip overview, selected store, preferred shopping order, and estimated route impact
- Entry points to product search, full cart management, and route review
- Cart progress when a shopping session is active
- Does not duplicate the full cart-management list

### Search

- Store-scoped product search
- Availability and aisle label
- Inline add and quantity controls that reflect active-cart state
- Saved-for-later action

### Cart

- Single full-management surface for active items
- Saved-for-later items
- Unavailable or unresolved items
- Quantity changes and removal
- Shopping-order selection that visibly reorders the cart list and route preview

### Route

- Route preview before shopping
- Next-item focus during shopping
- Full map as a secondary view
- Pick, cannot-find, and defer actions

## Shopper types

Do not ask users to choose a role during onboarding.

The shared experience supports both audiences:

| Need | Regular shopper | Delivery shopper |
| --- | --- | --- |
| Build cart | Yes | Yes |
| Store availability | Yes | Yes |
| Recommended route | Optional | Default |
| Guided next-item view | Yes | Yes |
| Dense efficiency metrics | Secondary | Prominent |
| Batch orders and service metrics | Not needed | Future capability |

An optional fulfillment mode may later change defaults, density, and metrics
without creating two separate products.

## Store selection

Store selection occurs before product search and cart building.

Benefits:

- Product availability is known before adding.
- Aisle placement is immediately useful.
- Cart ordering and route preview remain stable.
- Saved-for-later items can remain store independent.

Changing stores with an existing cart must:

1. Warn that availability and aisle positions may change.
2. Resolve every active cart line against the new store.
3. Move unavailable items into a needs-attention section.
4. Reset any active shopping session.

A future browse-without-store mode may exist, but it is not required for the
current milestone.

## Cart model

```ts
type CartLineState =
  | "active"
  | "saved-for-later"
  | "picked"
  | "unavailable";

type CartLine = {
  id: string;
  productId: string;
  quantity: number;
  addedAt: string;
  state: CartLineState;
};

type CartOrdering = "added-order" | "aisle-order" | "recommended";
```

Core cart capabilities:

- Add product
- Increase or decrease quantity
- Remove product
- Save for later
- Move saved item to cart
- Clear active cart
- Resolve availability after store change
- Persist on the current device

## Shopping-order choices

Use the phrase **Shopping order**, not generic sort.

- **Added order:** Preserve the user's original cart-entry sequence.
- **Aisle order:** Sort by the selected store's aisle labels.
- **Recommended route:** Sequence by store layout, availability, current
  location, and item-handling rules.

Before starting, show the selected order and its estimated route impact.

## Guided shopping actions

During an active shopping session, the next item is the primary interface.

- Keep the store's entry and checkout landmarks fixed. They describe the
  physical layout, not the shopper's current route.
- Assign stop numbers when the session begins and keep them stable throughout
  the trip. Completed or skipped stops may leave gaps while the remaining route
  recalculates from the shopper's last confirmed location.
- Make the most recent picked or cannot-find action undoable.
- Use sentence case for action labels, including **Mark picked**.

### Picked

- Mark the item complete.
- Advance the shopper's confirmed location.
- Recalculate the remaining recommended route.
- Offer Undo so an accidental confirmation restores the item and prior
  confirmed location.

### Cannot find item

- Mark the item unavailable for this session.
- Recalculate the route.
- Offer Undo so the item can return to the active route.
- Offer substitutions in a later milestone.

### More actions

Opening more actions presents:

- Save for later
- Remove from cart
- Cancel

Do not use a standalone destructive Skip action. The current Skip behavior is a
temporary implementation and should be replaced by this explicit action sheet.

## Device persistence

Use versioned `localStorage` persistence for:

- Selected store
- Active cart lines
- Saved-for-later items
- Preferred shopping order

Do not persist active navigation progress across long periods until session
recovery behavior is deliberately designed.

## Mobile acceptance criteria

- Core shopping actions are usable at `320px` width.
- Primary actions meet a minimum `44px` touch target.
- Guided shopping emphasizes one next item and one primary action.
- Users can operate the active-shopping screen without horizontal scrolling.
- Store changes clearly communicate availability impact.
- Cart state survives page refresh on the same device.
- Desktop retains the same concepts and state transitions.

## Out of scope

- Product prices and payment
- User accounts and cross-device sync
- Batch delivery orders
- Retailer API integration
- Live indoor positioning
- Substitution recommendations
