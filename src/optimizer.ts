import type { CartItem, RouteResult, Store, StoreNode } from "./domain";

type Graph = Map<string, Array<{ id: string; weight: number }>>;

const distance = (a: StoreNode, b: StoreNode) => Math.hypot(a.x - b.x, a.y - b.y);

function buildGraph(store: Store): Graph {
  const nodes = new Map(store.nodes.map((node) => [node.id, node]));
  const graph: Graph = new Map(store.nodes.map((node) => [node.id, []]));

  for (const edge of store.edges) {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    if (!from || !to) throw new Error(`Invalid store edge: ${edge.from} -> ${edge.to}`);
    const weight = distance(from, to) * store.feetPerMapUnit;
    graph.get(from.id)!.push({ id: to.id, weight });
    graph.get(to.id)!.push({ id: from.id, weight });
  }

  return graph;
}

function shortestPath(graph: Graph, start: string, end: string): RouteResult {
  const distances = new Map<string, number>([...graph.keys()].map((id) => [id, Infinity]));
  const previous = new Map<string, string>();
  const unvisited = new Set(graph.keys());
  distances.set(start, 0);

  while (unvisited.size > 0) {
    const current = [...unvisited].reduce((best, id) =>
      distances.get(id)! < distances.get(best)! ? id : best,
    );
    if (current === end || distances.get(current) === Infinity) break;
    unvisited.delete(current);

    for (const neighbor of graph.get(current) ?? []) {
      if (!unvisited.has(neighbor.id)) continue;
      const candidate = distances.get(current)! + neighbor.weight;
      if (candidate < distances.get(neighbor.id)!) {
        distances.set(neighbor.id, candidate);
        previous.set(neighbor.id, current);
      }
    }
  }

  const path = [end];
  while (path[0] !== start) {
    const next = previous.get(path[0]);
    if (!next) throw new Error(`No route from ${start} to ${end}`);
    path.unshift(next);
  }
  return { stops: [start, end], path, distance: distances.get(end)! };
}

function connectStops(store: Store, stops: string[]): RouteResult {
  const graph = buildGraph(store);
  const route: RouteResult = { stops, path: [], distance: 0 };

  for (let index = 0; index < stops.length - 1; index += 1) {
    const leg = shortestPath(graph, stops[index], stops[index + 1]);
    route.distance += leg.distance;
    route.path.push(...(index === 0 ? leg.path : leg.path.slice(1)));
  }
  return route;
}

export function aisleOrderRoute(store: Store, cart: CartItem[]): RouteResult {
  const stops = [
    store.startNodeId,
    ...[...cart].sort((a, b) => a.aisle.localeCompare(b.aisle)).map((item) => item.nodeId),
    store.endNodeId,
  ];
  return connectStops(store, stops);
}

export function optimizedRoute(store: Store, cart: CartItem[]): RouteResult {
  const graph = buildGraph(store);
  const deferred = new Set(
    cart.filter((item) => item.handling === "chilled" || item.handling === "frozen").map((item) => item.nodeId),
  );
  const remaining = new Set(cart.map((item) => item.nodeId).filter((id) => !deferred.has(id)));
  const stops = [store.startNodeId];
  let current = store.startNodeId;

  const addNearest = (candidates: Set<string>) => {
    while (candidates.size > 0) {
      const next = [...candidates].reduce((best, id) =>
        shortestPath(graph, current, id).distance < shortestPath(graph, current, best).distance ? id : best,
      );
      stops.push(next);
      candidates.delete(next);
      current = next;
    }
  };

  addNearest(remaining);
  addNearest(deferred);
  stops.push(store.endNodeId);
  return connectStops(store, stops);
}

export function routeSavings(baseline: RouteResult, optimized: RouteResult): number {
  return Math.max(0, Math.round((1 - optimized.distance / baseline.distance) * 100));
}
