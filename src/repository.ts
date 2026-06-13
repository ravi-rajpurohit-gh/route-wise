import type { Product, ProductPlacement, Store, StoreLayoutVersion } from "./domain";

export interface StoreRepository {
  listStores(): Promise<Store[]>;
  getStore(storeId: string): Promise<Store>;
  getActiveLayout(storeId: string): Promise<StoreLayoutVersion>;
  getProducts(productIds: string[]): Promise<Product[]>;
  getPlacements(storeId: string, productIds: string[]): Promise<ProductPlacement[]>;
}

export type FixtureData = {
  stores: Store[];
  layouts: StoreLayoutVersion[];
  products: Product[];
  placements: ProductPlacement[];
};

export class FixtureStoreRepository implements StoreRepository {
  constructor(private readonly data: FixtureData) {
    validateFixtureData(data);
  }

  async listStores(): Promise<Store[]> {
    return [...this.data.stores];
  }

  async getStore(storeId: string): Promise<Store> {
    const store = this.data.stores.find((candidate) => candidate.id === storeId);
    if (!store) throw new Error(`Unknown store: ${storeId}`);
    return store;
  }

  async getActiveLayout(storeId: string): Promise<StoreLayoutVersion> {
    const store = await this.getStore(storeId);
    const layout = this.data.layouts.find((candidate) => candidate.id === store.activeLayoutVersionId);
    if (!layout) throw new Error(`Missing active layout ${store.activeLayoutVersionId} for store ${storeId}`);
    return layout;
  }

  async getProducts(productIds: string[]): Promise<Product[]> {
    const requested = new Set(productIds);
    return this.data.products.filter((product) => requested.has(product.id));
  }

  async getPlacements(storeId: string, productIds: string[]): Promise<ProductPlacement[]> {
    const requested = new Set(productIds);
    return this.data.placements.filter((placement) => placement.storeId === storeId && requested.has(placement.productId));
  }
}

export function validateFixtureData(data: FixtureData): void {
  const storeIds = new Set(data.stores.map((store) => store.id));
  const layoutIds = new Set(data.layouts.map((layout) => layout.id));
  const productIds = new Set(data.products.map((product) => product.id));
  if (storeIds.size !== data.stores.length) throw new Error("Fixture data contains duplicate store IDs");
  if (layoutIds.size !== data.layouts.length) throw new Error("Fixture data contains duplicate layout IDs");
  if (productIds.size !== data.products.length) throw new Error("Fixture data contains duplicate product IDs");

  for (const store of data.stores) {
    const layout = data.layouts.find((candidate) => candidate.id === store.activeLayoutVersionId);
    if (!layout) throw new Error(`Store ${store.id} references missing active layout ${store.activeLayoutVersionId}`);
    if (layout.storeId !== store.id) throw new Error(`Layout ${layout.id} does not belong to store ${store.id}`);
  }

  for (const layout of data.layouts) {
    if (!storeIds.has(layout.storeId)) throw new Error(`Layout ${layout.id} references unknown store ${layout.storeId}`);
    const nodeIds = new Set(layout.nodes.map((node) => node.id));
    if (nodeIds.size !== layout.nodes.length) throw new Error(`Layout ${layout.id} contains duplicate node IDs`);
    for (const edge of layout.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new Error(`Layout ${layout.id} contains invalid edge ${edge.from} -> ${edge.to}`);
    }
    for (const nodeId of [...layout.entryNodeIds, ...layout.checkoutNodeIds]) {
      if (!nodeIds.has(nodeId)) throw new Error(`Layout ${layout.id} references invalid entry or checkout ${nodeId}`);
    }
    if (layout.entryNodeIds.length === 0) throw new Error(`Layout ${layout.id} has no entry nodes`);
    if (layout.checkoutNodeIds.length === 0) throw new Error(`Layout ${layout.id} has no checkout nodes`);
  }

  const placementKeys = new Set<string>();
  for (const placement of data.placements) {
    if (!storeIds.has(placement.storeId)) throw new Error(`Placement references unknown store ${placement.storeId}`);
    if (!layoutIds.has(placement.layoutVersionId)) throw new Error(`Placement references unknown layout ${placement.layoutVersionId}`);
    if (!productIds.has(placement.productId)) throw new Error(`Placement references unknown product ${placement.productId}`);
    const layout = data.layouts.find((candidate) => candidate.id === placement.layoutVersionId)!;
    if (layout.storeId !== placement.storeId) throw new Error(`Placement store ${placement.storeId} does not match layout ${layout.id}`);
    if (!layout.nodes.some((node) => node.id === placement.nodeId)) throw new Error(`Placement for ${placement.productId} references invalid node ${placement.nodeId}`);
    const key = `${placement.layoutVersionId}:${placement.productId}`;
    if (placementKeys.has(key)) throw new Error(`Duplicate placement for ${placement.productId} in layout ${placement.layoutVersionId}`);
    placementKeys.add(key);
  }
}
