import type {
  Cart,
  Product,
  ProductPlacement,
  Store,
  StoreEdge,
  StoreLayoutVersion,
  StoreNode,
} from "../domain";

type LogicalNode = Omit<StoreNode, "id"> & { id: string };

const baseNodes: LogicalNode[] = [
  { id: "entry", label: "Entry", kind: "entry", x: 74, y: 540 },
  { id: "checkout", label: "Checkout", kind: "checkout", x: 594, y: 540 },
  { id: "front-left", label: "Front left", kind: "intersection", x: 74, y: 470 },
  { id: "front-mid", label: "Front middle", kind: "intersection", x: 334, y: 470 },
  { id: "front-right", label: "Front right", kind: "intersection", x: 594, y: 470 },
  { id: "back-left", label: "Back left", kind: "intersection", x: 74, y: 90 },
  { id: "back-mid", label: "Back middle", kind: "intersection", x: 334, y: 90 },
  { id: "back-right", label: "Back right", kind: "intersection", x: 594, y: 90 },
  { id: "a03", label: "A03", kind: "item", x: 132, y: 390 },
  { id: "a08", label: "A08", kind: "item", x: 252, y: 210 },
  { id: "a12", label: "A12", kind: "item", x: 392, y: 330 },
  { id: "a18", label: "A18", kind: "item", x: 520, y: 160 },
  { id: "produce", label: "Produce", kind: "item", x: 130, y: 90 },
  { id: "dairy", label: "Dairy", kind: "item", x: 470, y: 90 },
  { id: "frozen", label: "Frozen", kind: "item", x: 594, y: 280 },
];

const baseEdges: StoreEdge[] = [
  { from: "entry", to: "front-left" },
  { from: "front-left", to: "front-mid" },
  { from: "front-mid", to: "front-right" },
  { from: "front-right", to: "checkout" },
  { from: "front-left", to: "back-left" },
  { from: "front-mid", to: "back-mid" },
  { from: "front-right", to: "back-right" },
  { from: "back-left", to: "back-mid" },
  { from: "back-mid", to: "back-right" },
  { from: "a03", to: "front-left" },
  { from: "a03", to: "back-left" },
  { from: "a08", to: "front-mid" },
  { from: "a08", to: "back-mid" },
  { from: "a12", to: "front-mid" },
  { from: "a12", to: "back-mid" },
  { from: "a18", to: "front-right" },
  { from: "a18", to: "back-right" },
  { from: "produce", to: "back-left" },
  { from: "dairy", to: "back-mid" },
  { from: "dairy", to: "back-right" },
  { from: "frozen", to: "front-right" },
  { from: "frozen", to: "back-right" },
];

const prefix = (storeId: string, nodeId: string) => `${storeId}:${nodeId}`;

function createLayout(
  storeId: string,
  version: string,
  transform: (point: { x: number; y: number }) => { x: number; y: number },
  feetPerMapUnit: number,
): StoreLayoutVersion {
  const id = `${storeId}-${version}`;
  return {
    id,
    storeId,
    version,
    feetPerMapUnit,
    nodes: baseNodes.map((node) => ({ ...node, id: prefix(storeId, node.id), ...transform(node) })),
    edges: baseEdges.map((edge) => ({ from: prefix(storeId, edge.from), to: prefix(storeId, edge.to) })),
    entryNodeIds: [prefix(storeId, "entry")],
    checkoutNodeIds: [prefix(storeId, "checkout")],
  };
}

export const products: Product[] = [
  { id: "bananas", name: "Organic Bananas", category: "Produce", handling: "ambient" },
  { id: "pasta", name: "Penne Pasta", category: "Pantry", handling: "ambient" },
  { id: "detergent", name: "Laundry Detergent", category: "Household", handling: "ambient" },
  { id: "milk", name: "Whole Milk", category: "Dairy", handling: "chilled" },
  { id: "bread", name: "Whole Wheat Bread", category: "Bakery", handling: "fragile" },
  { id: "pizza", name: "Frozen Pizza", category: "Frozen", handling: "frozen" },
  { id: "coffee", name: "Ground Coffee", category: "Pantry", handling: "ambient" },
];

export const carts: Cart[] = [{
  id: "sample-cart",
  lines: products.map((product) => ({ productId: product.id, quantity: 1 })),
}];

export const stores: Store[] = [
  { id: "store-1842", name: "Supercenter #1842", location: "Plano, Texas", activeLayoutVersionId: "store-1842-v1" },
  { id: "store-2751", name: "Supercenter #2751", location: "Frisco, Texas", activeLayoutVersionId: "store-2751-v1" },
  { id: "store-4103", name: "Neighborhood Market #4103", location: "Allen, Texas", activeLayoutVersionId: "store-4103-v1" },
];

export const layouts: StoreLayoutVersion[] = [
  createLayout("store-1842", "v1", ({ x, y }) => ({ x, y }), 0.25),
  createLayout("store-2751", "v1", ({ x, y }) => ({ x: 668 - x, y }), 0.27),
  createLayout("store-4103", "v1", ({ x, y }) => ({ x: 100 + (x - 74) * 0.78, y: 100 + (y - 90) * 0.78 }), 0.22),
];

const placement = (
  storeId: string,
  productId: string,
  logicalNodeId: string,
  aisleLabel: string,
  status: ProductPlacement["status"] = "available",
): ProductPlacement => ({
  storeId,
  layoutVersionId: `${storeId}-v1`,
  productId,
  nodeId: prefix(storeId, logicalNodeId),
  aisleLabel,
  status,
});

export const placements: ProductPlacement[] = [
  placement("store-1842", "bananas", "produce", "Produce"),
  placement("store-1842", "pasta", "a08", "A08"),
  placement("store-1842", "detergent", "a18", "A18"),
  placement("store-1842", "milk", "dairy", "Dairy"),
  placement("store-1842", "bread", "a03", "A03"),
  placement("store-1842", "pizza", "frozen", "Frozen"),
  placement("store-1842", "coffee", "a12", "A12"),
  placement("store-2751", "bananas", "produce", "Produce"),
  placement("store-2751", "pasta", "a18", "B18"),
  placement("store-2751", "detergent", "a03", "B03"),
  placement("store-2751", "milk", "dairy", "Dairy"),
  placement("store-2751", "bread", "a12", "B12"),
  placement("store-2751", "pizza", "frozen", "Frozen"),
  placement("store-2751", "coffee", "a08", "B08"),
  placement("store-4103", "bananas", "a03", "N03"),
  placement("store-4103", "pasta", "a08", "N08"),
  placement("store-4103", "detergent", "a12", "N12"),
  placement("store-4103", "milk", "dairy", "Dairy"),
  placement("store-4103", "bread", "produce", "Bakery"),
  placement("store-4103", "pizza", "frozen", "Frozen"),
  placement("store-4103", "coffee", "a18", "N18", "unavailable"),
];
