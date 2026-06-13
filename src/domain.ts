export type Handling = "ambient" | "chilled" | "frozen" | "fragile";

export type Point = {
  x: number;
  y: number;
};

export type StoreNode = Point & {
  id: string;
  label: string;
  kind: "entry" | "checkout" | "intersection" | "item";
};

export type StoreEdge = {
  from: string;
  to: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  handling: Handling;
};

export type CartLine = {
  productId: string;
  quantity: number;
};

export type Cart = {
  id: string;
  lines: CartLine[];
};

export type Store = {
  id: string;
  name: string;
  location: string;
  activeLayoutVersionId: string;
};

export type StoreLayoutVersion = {
  id: string;
  storeId: string;
  version: string;
  feetPerMapUnit: number;
  nodes: StoreNode[];
  edges: StoreEdge[];
  entryNodeIds: string[];
  checkoutNodeIds: string[];
};

export type ProductPlacement = {
  storeId: string;
  layoutVersionId: string;
  productId: string;
  nodeId: string;
  aisleLabel: string;
  status: "available" | "unavailable";
};

export type ResolvedPickItem = {
  productId: string;
  name: string;
  category: string;
  handling: Handling;
  quantity: number;
  nodeId: string;
  aisleLabel: string;
};

export type UnresolvedCartLine = {
  productId: string;
  quantity: number;
  reason: "unknown-product" | "missing-placement" | "unavailable";
};

export type ResolvedCart = {
  store: Store;
  layout: StoreLayoutVersion;
  items: ResolvedPickItem[];
  unresolved: UnresolvedCartLine[];
};

export type RouteContext = {
  feetPerMapUnit: number;
  nodes: StoreNode[];
  edges: StoreEdge[];
  startNodeId: string;
  endNodeId: string;
};

export type RouteResult = {
  stops: string[];
  path: string[];
  distance: number;
};
