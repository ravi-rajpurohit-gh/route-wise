# Multi-Store Implementation Plan

## Objective

Allow a shopper to select a store and generate a new pick sequence for the
same cart using that store's layout, entrances, checkout locations, and product
placements.

## Core domain correction

The current `CartItem` model contains `aisle` and `nodeId`. That makes the cart
store-specific. A real cart should identify products and quantities; the
selected store should determine where those products are located.

The target relationship is:

```text
Cart -> Cart lines -> Products
Store -> Active layout version -> Nodes and edges
Store + Product -> Product placement -> Pick node and aisle label
```

## Target data model

### Product

Store-independent catalog identity and handling attributes.

```ts
type Product = {
  id: string;
  name: string;
  category: string;
  handling: "ambient" | "chilled" | "frozen" | "fragile";
};
```

### Cart and cart line

Store-independent shopping intent.

```ts
type Cart = {
  id: string;
  lines: CartLine[];
};

type CartLine = {
  productId: string;
  quantity: number;
};
```

### Store

Store identity and currently active layout.

```ts
type Store = {
  id: string;
  name: string;
  location: string;
  activeLayoutVersionId: string;
};
```

### Store layout version

Versioned walkable graph. Layout changes must not silently rewrite historical
route results.

```ts
type StoreLayoutVersion = {
  id: string;
  storeId: string;
  version: string;
  feetPerMapUnit: number;
  nodes: StoreNode[];
  edges: StoreEdge[];
  entryNodeIds: string[];
  checkoutNodeIds: string[];
};
```

### Product placement

Resolves a catalog product to a pick location in one layout version.

```ts
type ProductPlacement = {
  storeId: string;
  layoutVersionId: string;
  productId: string;
  nodeId: string;
  aisleLabel: string;
  status: "available" | "unavailable";
};
```

### Resolved pick item

The optimizer should receive a resolved, store-specific pick request rather
than catalog or persistence records directly.

```ts
type ResolvedPickItem = {
  productId: string;
  name: string;
  category: string;
  handling: Product["handling"];
  quantity: number;
  nodeId: string;
  aisleLabel: string;
};
```

## Do we need a database now?

**Not for the next milestone.**

The immediate goal is to prove that the same cart produces different valid
routes across multiple store layouts. Static, validated JSON or TypeScript
fixtures are simpler, reproducible, and reviewable. They also avoid hiding
domain-model mistakes behind API and database code.

Introduce a repository interface immediately so the UI and route service do not
depend on how data is stored:

```ts
interface StoreRepository {
  listStores(): Promise<Store[]>;
  getActiveLayout(storeId: string): Promise<StoreLayoutVersion>;
  getPlacements(storeId: string, productIds: string[]): Promise<ProductPlacement[]>;
}
```

Implement `FixtureStoreRepository` first. Add a database-backed repository when
the product needs runtime editing, many layouts, concurrent users, route
history, or an API boundary.

## Mock dataset plan

Create a small but intentionally varied dataset:

| Store | Layout purpose |
| --- | --- |
| Store 1842 | Existing wide supercenter baseline |
| Store 2751 | Mirrored layout with a different entrance and department placement |
| Store 4103 | Compact neighborhood layout with fewer aisles and shorter routes |

Use one shared product catalog and one shared sample cart. Each store should
place the same products in different aisles and nodes. At least one product
should be unavailable in one store to force explicit handling.

Required fixture files:

```text
src/data/products.json
src/data/carts.json
src/data/stores.json
src/data/layouts/store-1842-v1.json
src/data/layouts/store-2751-v1.json
src/data/layouts/store-4103-v1.json
src/data/placements/store-1842-v1.json
src/data/placements/store-2751-v1.json
src/data/placements/store-4103-v1.json
```

Fixture validation must verify:

- Every edge references valid layout nodes.
- Every entry and checkout references a valid node.
- Every available product placement references a valid pick node.
- Placement layout and store identifiers match.
- A cart can report unresolved or unavailable products without crashing.

## User flow

1. Load available stores.
2. User selects a store.
3. Resolve the store's active layout.
4. Resolve cart product IDs to placements for that store.
5. Display unavailable or unresolved products before routing.
6. Generate baseline and optimized routes from resolved items.
7. Recalculate and redraw metrics, sequence, and map.

Changing stores must reset pick progress because prior completion state belongs
to the previous route context.

## Phased implementation

### Phase A: Correct the domain model

- Separate products, carts, stores, layouts, and placements.
- Introduce `ResolvedPickItem`.
- Update optimizer signatures to accept a layout and resolved items.
- Preserve existing behavior with Store 1842 fixtures.

### Phase B: Add fixture repository and validation

- Add repository interface and in-memory fixture implementation.
- Add three mock stores with distinct layouts and placements.
- Add validation errors with useful failure messages.
- Add tests for placement resolution and malformed fixtures.

### Phase C: Add store selection

- Replace the static store button with a real selector.
- Load and resolve the selected store.
- Recompute route, metrics, item sequence, and map.
- Show unavailable items and reset progress on store change.

### Phase D: Validate multi-store behavior

- Assert the same cart generates different route sequences by store.
- Assert route results only use nodes from the selected layout.
- Benchmark route calculations across every fixture store.
- Add visual QA for each layout.

### Phase E: Introduce persistence only when justified

Use SQLite for a local single-process service or PostgreSQL for a deployed,
multi-user API. Persist normalized store metadata, layout versions, products,
placements, and route-run records. Keep graph payloads versioned and immutable
after activation.

## Acceptance criteria

- At least three stores are selectable.
- The same cart resolves to different aisle labels and route sequences.
- Store changes recompute routes without refreshing the application.
- Unavailable products are clearly reported and excluded from routing.
- No route includes nodes from another store's layout.
- All fixture data passes validation.
- Existing optimizer invariants and quality gates remain green.

## Database decision trigger

Add a database when at least one of these is required:

- Store layouts or placements must be edited at runtime.
- More fixture data makes static files difficult to review or load.
- Route runs must be retained for analysis.
- Multiple users or services require concurrent access.
- Authentication and authorization become part of the product.

Until then, fixtures plus a repository abstraction are the lower-risk and more
transparent production-minded choice.
