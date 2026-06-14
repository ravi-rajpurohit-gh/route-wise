import type { RouteContext, RouteResult, Store } from "./domain";

type StoreMapProps = {
  context: RouteContext;
  route: RouteResult;
  store: Store;
  stopNumbers: Map<string, number>;
};

const aisleFixtures = [
  { x: 112, label: "03" },
  { x: 202, label: "08" },
  { x: 292, label: "12" },
  { x: 382, label: "15" },
  { x: 472, label: "18" },
];

export function StoreMap({ route, context, store, stopNumbers }: StoreMapProps) {
  const nodeById = new Map(context.nodes.map((node) => [node.id, node]));
  const points = route.path.map((id) => nodeById.get(id)).filter(Boolean).map((node) => `${node!.x},${node!.y}`).join(" ");
  const entry = nodeById.get(context.startNodeId);
  const checkout = nodeById.get(context.endNodeId);
  const aislePrefix = context.nodes.map((node) => node.label).find((label) => /^[A-Z]\d+$/.test(label))?.slice(0, 1) ?? "A";

  return (
    <figure className="route-map">
      <figcaption>
        <div><small>Store map</small><strong>{store.name}</strong></div>
        <div className="map-legend"><span><i className="legend-route" /> Your route</span><span><i className="legend-stop" /> Pick stop</span></div>
      </figcaption>
      <svg viewBox="0 0 670 610" role="img" aria-label={`Shopping route through ${store.name}`}>
        <rect x="32" y="34" width="606" height="544" rx="16" className="floor" />
        <g className="department-zones">
          <rect x="54" y="52" width="156" height="72" rx="10" className="department produce-zone" />
          <text x="72" y="79">Produce & bakery</text>
          <rect x="224" y="52" width="164" height="72" rx="10" className="department dairy-zone" />
          <text x="242" y="79">Dairy</text>
          <rect x="402" y="52" width="214" height="72" rx="10" className="department frozen-zone" />
          <text x="420" y="79">Frozen & chilled</text>
        </g>
        <g className="aisle-fixtures">
          {aisleFixtures.map((aisle) => <g key={aisle.x}><rect x={aisle.x} y="158" width="54" height="250" rx="7" /><text x={aisle.x + 27} y="185" textAnchor="middle">{aislePrefix}{aisle.label}</text></g>)}
        </g>
        <g className="store-landmarks">
          <rect x="400" y="482" width="190" height="42" rx="8" />
          <text x="495" y="508" textAnchor="middle">Checkout</text>
          <text x="335" y="556" textAnchor="middle" className="front-label">Front of store</text>
        </g>
        <polyline points={points} className="active-route route-halo" />
        <polyline points={points} className="active-route" />
        {route.stops.slice(1, -1).map((id) => {
          const node = nodeById.get(id);
          return node ? <g key={id} className="map-stop"><circle cx={node.x} cy={node.y} r="16" className="route-stop" /><text x={node.x} y={node.y + 4} textAnchor="middle" className="route-stop-label">{stopNumbers.get(id) ?? "•"}</text></g> : null;
        })}
        {entry ? <g className="entry-marker"><circle cx={entry.x} cy={entry.y} r="18" /><text x={entry.x} y={entry.y + 4} textAnchor="middle">IN</text></g> : null}
        {checkout ? <g className="checkout-marker"><circle cx={checkout.x} cy={checkout.y} r="18" /><text x={checkout.x} y={checkout.y + 4} textAnchor="middle">OUT</text></g> : null}
      </svg>
      <p className="map-note">Stop numbers stay fixed throughout the trip while the remaining route recalculates from your last confirmed location.</p>
    </figure>
  );
}
