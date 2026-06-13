import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Navigation,
  PackageCheck,
  Route,
  ShoppingBasket,
  Snowflake,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import type { CartItem, RouteResult } from "./domain";
import { aisleOrderRoute, optimizedRoute, routeSavings } from "./optimizer";
import { sampleCart, sampleStore } from "./storeData";

const walkingMinutes = (distance: number) => Math.round(distance / 75);

function StoreMap({ route }: { route: RouteResult }) {
  const nodeById = new Map(sampleStore.nodes.map((node) => [node.id, node]));
  const routePoints = route.path.map((id) => nodeById.get(id)!).map((node) => `${node.x},${node.y}`).join(" ");

  return (
    <div className="map-shell">
      <div className="map-toolbar">
        <div>
          <span className="eyebrow">Live route preview</span>
          <h2>Pick path</h2>
        </div>
        <span className="map-status"><span /> Route ready</span>
      </div>
      <svg className="store-map" viewBox="0 0 670 610" role="img" aria-label="Optimized store route">
        <defs>
          <filter id="route-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="32" y="34" width="606" height="544" rx="22" className="floor" />
        <text x="70" y="68" className="zone-label">PRODUCE</text>
        <text x="438" y="68" className="zone-label">DAIRY</text>
        {[130, 250, 390, 520].map((x, index) => (
          <g key={x}>
            <rect x={x - 22} y="126" width="44" height="298" rx="8" className="aisle-block" />
            <text x={x} y="450" textAnchor="middle" className="aisle-label">A{String(index * 5 + 3).padStart(2, "0")}</text>
          </g>
        ))}
        <rect x="566" y="126" width="50" height="298" rx="8" className="cold-block" />
        <text x="591" y="275" textAnchor="middle" className="vertical-label">FROZEN</text>
        {sampleStore.edges.map((edge) => {
          const from = nodeById.get(edge.from)!;
          const to = nodeById.get(edge.to)!;
          return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="walkway" />;
        })}
        <polyline points={routePoints} className="route-glow" />
        <polyline points={routePoints} className="route-line" />
        {route.stops.slice(1, -1).map((id, index) => {
          const node = nodeById.get(id)!;
          return (
            <g key={id}>
              <circle cx={node.x} cy={node.y} r="14" className="stop-circle" />
              <text x={node.x} y={node.y + 4} textAnchor="middle" className="stop-number">{index + 1}</text>
            </g>
          );
        })}
        <g><circle cx="74" cy="540" r="18" className="entry-circle" /><text x="74" y="545" textAnchor="middle" className="entry-text">IN</text></g>
        <g><circle cx="594" cy="540" r="18" className="exit-circle" /><text x="594" y="545" textAnchor="middle" className="entry-text">OUT</text></g>
      </svg>
      <div className="map-legend">
        <span><i className="legend-route" /> Optimized path</span>
        <span><i className="legend-stop" /> Pick stop</span>
        <span><Snowflake size={14} /> Cold items last</span>
      </div>
    </div>
  );
}

function ItemRow({ item, order, picked, onToggle }: { item: CartItem; order: number; picked: boolean; onToggle: () => void }) {
  return (
    <button className={`item-row ${picked ? "picked" : ""}`} onClick={onToggle}>
      <span className="order-number">{picked ? <Check size={15} /> : order}</span>
      <span className="item-copy"><strong>{item.name}</strong><small>{item.category}</small></span>
      {item.handling === "frozen" || item.handling === "chilled" ? <Snowflake size={15} className="cold-icon" /> : null}
      <span className="aisle-pill">{item.aisle}</span>
    </button>
  );
}

function App() {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"optimized" | "baseline">("optimized");
  const baseline = useMemo(() => aisleOrderRoute(sampleStore, sampleCart), []);
  const optimized = useMemo(() => optimizedRoute(sampleStore, sampleCart), []);
  const activeRoute = mode === "optimized" ? optimized : baseline;
  const itemByNode = new Map(sampleCart.map((item) => [item.nodeId, item]));
  const orderedItems = activeRoute.stops.slice(1, -1).map((id) => itemByNode.get(id)!).filter(Boolean);
  const savings = routeSavings(baseline, optimized);

  const togglePicked = (id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="app">
      <header>
        <a className="brand" href="#"><span><Navigation size={18} /></span>RouteWise</a>
        <nav><a href="#solution">Solution</a><a href="#metrics">Impact</a><a href="#method">Method</a></nav>
        <button className="profile">RR</button>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="hero-kicker"><Sparkles size={14} /> Constraint-aware pick-path optimization</span>
            <h1>Every pick.<br /><em>One smart path.</em></h1>
            <p>Turn a shopping list into an efficient route through the store, reducing walking time while handling cold-chain and product constraints.</p>
          </div>
          <div className="hero-metric">
            <span>Estimated distance reduction</span>
            <strong>{savings}%</strong>
            <small><TrendingDown size={14} /> versus aisle-order baseline</small>
          </div>
        </section>

        <section className="store-bar">
          <div className="store-identity"><span><MapPin size={19} /></span><div><small>Active store</small><strong>{sampleStore.name}</strong><em>{sampleStore.location}</em></div></div>
          <button>Store graph v1.4 <ChevronDown size={16} /></button>
          <div className="progress-copy"><span>{picked.size} of {sampleCart.length} picked</span><div><i style={{ width: `${(picked.size / sampleCart.length) * 100}%` }} /></div></div>
        </section>

        <section className="workspace" id="solution">
          <StoreMap route={activeRoute} />
          <aside className="pick-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">Sequenced cart</span><h2>{sampleCart.length} items</h2></div>
              <ShoppingBasket size={22} />
            </div>
            <div className="mode-toggle">
              <button className={mode === "optimized" ? "active" : ""} onClick={() => setMode("optimized")}>Optimized</button>
              <button className={mode === "baseline" ? "active" : ""} onClick={() => setMode("baseline")}>Aisle order</button>
            </div>
            <div className="item-list">
              {orderedItems.map((item, index) => <ItemRow key={item.id} item={item} order={index + 1} picked={picked.has(item.id)} onToggle={() => togglePicked(item.id)} />)}
            </div>
            <button className="primary-action"><Route size={17} /> Start guided pick <ArrowRight size={17} /></button>
          </aside>
        </section>

        <section className="metrics" id="metrics">
          <article><span><Route /></span><small>Optimized distance</small><strong>{Math.round(optimized.distance).toLocaleString()} ft</strong><em>{savings}% shorter route</em></article>
          <article><span><Clock3 /></span><small>Estimated pick time</small><strong>{walkingMinutes(optimized.distance)} min</strong><em>{walkingMinutes(baseline.distance) - walkingMinutes(optimized.distance)} min saved</em></article>
          <article><span><PackageCheck /></span><small>Cart constraints</small><strong>2 applied</strong><em>Cold items sequenced last</em></article>
        </section>

        <section className="method" id="method">
          <div><span className="eyebrow">How it works</span><h2>A measurable optimization system, not just a sorted list.</h2></div>
          <ol>
            <li><span>01</span><div><strong>Model the store</strong><p>Convert walkable paths, product positions, entrances, and checkouts into a weighted graph.</p></div></li>
            <li><span>02</span><div><strong>Apply constraints</strong><p>Sequence picks while respecting cold-chain, fragile-item, availability, and fulfillment rules.</p></div></li>
            <li><span>03</span><div><strong>Measure the impact</strong><p>Compare route distance and estimated pick time against transparent operational baselines.</p></div></li>
          </ol>
        </section>
      </main>
    </div>
  );
}

export default App;
