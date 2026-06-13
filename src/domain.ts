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

export type CartItem = {
  id: string;
  name: string;
  category: string;
  aisle: string;
  nodeId: string;
  handling?: "ambient" | "chilled" | "frozen" | "fragile";
};

export type Store = {
  id: string;
  name: string;
  location: string;
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
