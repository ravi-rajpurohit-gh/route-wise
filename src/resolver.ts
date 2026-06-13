import type { Cart, ResolvedCart, ResolvedPickItem, RouteContext, StoreLayoutVersion } from "./domain";
import type { StoreRepository } from "./repository";

export async function resolveCartForStore(repository: StoreRepository, cart: Cart, storeId: string): Promise<ResolvedCart> {
  const productIds = cart.lines.map((line) => line.productId);
  const [store, layout, products, placements] = await Promise.all([
    repository.getStore(storeId),
    repository.getActiveLayout(storeId),
    repository.getProducts(productIds),
    repository.getPlacements(storeId, productIds),
  ]);
  const productById = new Map(products.map((product) => [product.id, product]));
  const placementByProductId = new Map(placements.map((placement) => [placement.productId, placement]));
  const items: ResolvedPickItem[] = [];
  const unresolved: ResolvedCart["unresolved"] = [];

  for (const line of cart.lines) {
    const product = productById.get(line.productId);
    const placement = placementByProductId.get(line.productId);
    if (!product) {
      unresolved.push({ ...line, reason: "unknown-product" });
    } else if (!placement) {
      unresolved.push({ ...line, reason: "missing-placement" });
    } else if (placement.status === "unavailable") {
      unresolved.push({ ...line, reason: "unavailable" });
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        handling: product.handling,
        quantity: line.quantity,
        nodeId: placement.nodeId,
        aisleLabel: placement.aisleLabel,
      });
    }
  }

  return { store, layout, items, unresolved };
}

export function createRouteContext(layout: StoreLayoutVersion, entryNodeId?: string, checkoutNodeId?: string): RouteContext {
  const startNodeId = entryNodeId ?? layout.entryNodeIds[0];
  const endNodeId = checkoutNodeId ?? layout.checkoutNodeIds[0];
  if (!layout.entryNodeIds.includes(startNodeId)) throw new Error(`Invalid entry ${startNodeId} for layout ${layout.id}`);
  if (!layout.checkoutNodeIds.includes(endNodeId)) throw new Error(`Invalid checkout ${endNodeId} for layout ${layout.id}`);
  return {
    feetPerMapUnit: layout.feetPerMapUnit,
    nodes: layout.nodes,
    edges: layout.edges,
    startNodeId,
    endNodeId,
  };
}
