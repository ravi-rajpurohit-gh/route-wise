import type { ResolvedPickItem, RouteContext } from "./domain";
import { carts, layouts, placements, products, stores } from "./data/fixtures";
import { FixtureStoreRepository } from "./repository";
import { createRouteContext } from "./resolver";

export const fixtureRepository = new FixtureStoreRepository({ stores, layouts, products, placements });
export const sampleCartDefinition = carts[0];
export const sampleStoreMetadata = stores[0];
export const sampleLayout = layouts.find((layout) => layout.id === sampleStoreMetadata.activeLayoutVersionId)!;
export const sampleStore: RouteContext & { id: string; name: string; location: string } = {
  ...createRouteContext(sampleLayout),
  id: sampleStoreMetadata.id,
  name: sampleStoreMetadata.name,
  location: sampleStoreMetadata.location,
};

const productById = new Map(products.map((product) => [product.id, product]));
const placementByProductId = new Map(
  placements.filter((placement) => placement.storeId === sampleStoreMetadata.id).map((placement) => [placement.productId, placement]),
);

export const sampleCart: ResolvedPickItem[] = sampleCartDefinition.lines.map((line) => {
  const product = productById.get(line.productId)!;
  const placement = placementByProductId.get(line.productId)!;
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    handling: product.handling,
    quantity: line.quantity,
    nodeId: placement.nodeId,
    aisleLabel: placement.aisleLabel,
  };
});
