import type { CartItem, Store, StoreEdge, StoreNode } from "./domain";

const nodes: StoreNode[] = [
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

const edges: StoreEdge[] = [
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

export const sampleStore: Store = {
  id: "store-1842",
  name: "Supercenter #1842",
  location: "Plano, Texas",
  feetPerMapUnit: 0.25,
  nodes,
  edges,
  startNodeId: "entry",
  endNodeId: "checkout",
};

export const sampleCart: CartItem[] = [
  { id: "bananas", name: "Organic Bananas", category: "Produce", aisle: "Produce", nodeId: "produce" },
  { id: "pasta", name: "Penne Pasta", category: "Pantry", aisle: "A08", nodeId: "a08" },
  { id: "detergent", name: "Laundry Detergent", category: "Household", aisle: "A18", nodeId: "a18" },
  { id: "milk", name: "Whole Milk", category: "Dairy", aisle: "Dairy", nodeId: "dairy", handling: "chilled" },
  { id: "bread", name: "Whole Wheat Bread", category: "Bakery", aisle: "A03", nodeId: "a03", handling: "fragile" },
  { id: "pizza", name: "Frozen Pizza", category: "Frozen", aisle: "Frozen", nodeId: "frozen", handling: "frozen" },
  { id: "coffee", name: "Ground Coffee", category: "Pantry", aisle: "A12", nodeId: "a12" },
];
