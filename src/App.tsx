import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Info,
  MapPin,
  PackageCheck,
  Route,
  ShoppingBasket,
  Snowflake,
} from "lucide-react";
import type { ResolvedPickItem, RouteResult } from "./domain";
import { aisleOrderRoute, optimizedRoute, routeSavings } from "./optimizer";
import { sampleCart, sampleStore } from "./storeData";

const walkingMinutes = (distance: number) => Math.round(distance / 75);

function StoreMap({ route, mode }: { route: RouteResult; mode: "optimized" | "baseline" }) {
  const nodeById = new Map(sampleStore.nodes.map((node) => [node.id, node]));
  const routePoints = route.path.map((id) => nodeById.get(id)!).map((node) => `${node.x},${node.y}`).join(" ");

  return (
    <div className="map-panel">
      <div className="panel-header">
        <div>
          <span className="section-label">Store floor plan</span>
          <h2>{mode === "optimized" ? "Constraint-aware route" : "Aisle-order baseline"}</h2>
        </div>
        <span className="route-state"><span /> Route calculated</span>
      </div>
      <div className="map-canvas">
        <svg className="store-map" viewBox="0 0 670 610" role="img" aria-label="Store pick route">
          <rect x="32" y="34" width="606" height="544" rx="8" className="floor" />
          <text x="70" y="68" className="zone-label">PRODUCE</text>
          <text x="438" y="68" className="zone-label">DAIRY</text>
          {[130, 250, 390, 520].map((x, index) => (
            <g key={x}>
              <rect x={x - 22} y="126" width="44" height="298" rx="3" className="aisle-block" />
              <text x={x} y="450" textAnchor="middle" className="aisle-label">A{String(index * 5 + 3).padStart(2, "0")}</text>
            </g>
          ))}
          <rect x="566" y="126" width="50" height="298" rx="3" className="cold-block" />
          <text x="591" y="275" textAnchor="middle" className="vertical-label">FROZEN</text>
          {sampleStore.edges.map((edge) => {
            const from = nodeById.get(edge.from)!;
            const to = nodeById.get(edge.to)!;
            return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="walkway" />;
          })}
          <polyline points={routePoints} className={`route-line ${mode}`} />
          {route.stops.slice(1, -1).map((id, index) => {
            const node = nodeById.get(id)!;
            return (
              <g key={id}>
                <circle cx={node.x} cy={node.y} r="14" className={`stop-circle ${mode}`} />
                <text x={node.x} y={node.y + 4} textAnchor="middle" className="stop-number">{index + 1}</text>
              </g>
            );
          })}
          <g><circle cx="74" cy="540" r="18" className="entry-circle" /><text x="74" y="545" textAnchor="middle" className="entry-text">IN</text></g>
          <g><circle cx="594" cy="540" r="18" className="exit-circle" /><text x="594" y="545" textAnchor="middle" className="entry-text">OUT</text></g>
        </svg>
      </div>
      <div className="map-legend">
        <span><i className={`legend-route ${mode}`} /> Active path</span>
        <span><i className={`legend-stop ${mode}`} /> Pick stop</span>
        <span><Snowflake size={14} /> Cold items deferred</span>
      </div>
    </div>
  );
}

function ItemRow({ item, order, picked, onToggle }: { item: ResolvedPickItem; order: number; picked: boolean; onToggle: () => void }) {
  return (
    <button className={`item-row ${picked ? "picked" : ""}`} onClick={onToggle}>
      <span className="order-number">{picked ? <Check size={14} /> : order}</span>
      <span className="item-copy"><strong>{item.name}</strong><small>{item.category}</small></span>
      {item.handling === "frozen" || item.handling === "chilled" ? <Snowflake size={14} className="cold-icon" /> : null}
      <span className="aisle-pill">{item.aisleLabel}</span>
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
  const savedDistance = Math.round(baseline.distance - optimized.distance);
  const progress = Math.round((picked.size / sampleCart.length) * 100);

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
      <header className="topbar">
        <a className="brand" href="#"><span>RW</span><strong>RouteWise</strong><small>Fulfillment routing study</small></a>
        <nav><a href="#workspace">Route workspace</a><a href="#evidence">Evidence</a><a href="#method">Method</a></nav>
        <span className="prototype-tag">Research prototype</span>
      </header>

      <main>
        <section className="page-heading">
          <div>
            <span className="section-label">Pick-path analysis / Store 1842</span>
            <h1>Route comparison</h1>
            <p>Evaluate a constraint-aware pick sequence against a transparent aisle-order baseline.</p>
          </div>
          <div className="heading-actions">
            <button className="quiet-button"><Info size={15} /> Methodology</button>
            <button className="store-button"><MapPin size={15} /> {sampleStore.name} <ChevronDown size={15} /></button>
          </div>
        </section>

        <section className="summary-strip" id="evidence">
          <article className="primary-finding">
            <span className="section-label">Sample-cart finding</span>
            <div><strong>{savings}%</strong><p>less walking distance than aisle-order sorting</p></div>
            <small>Synthetic store graph · 7-item cart · cold items deferred</small>
          </article>
          <article><span>Optimized route</span><strong>{Math.round(optimized.distance)} ft</strong><small>{walkingMinutes(optimized.distance)} min estimated walk</small></article>
          <article><span>Aisle-order route</span><strong>{Math.round(baseline.distance)} ft</strong><small>{walkingMinutes(baseline.distance)} min estimated walk</small></article>
          <article><span>Distance avoided</span><strong>{savedDistance} ft</strong><small>One deterministic sample</small></article>
        </section>

        <section className="store-context">
          <div className="store-identity"><span><MapPin size={17} /></span><div><strong>{sampleStore.name}</strong><small>{sampleStore.location} · Graph version 1.4</small></div></div>
          <div className="progress-copy"><span>{picked.size} of {sampleCart.length} picks complete</span><div><i style={{ width: `${progress}%` }} /></div></div>
        </section>

        <section className="workspace" id="workspace">
          <StoreMap route={activeRoute} mode={mode} />
          <aside className="pick-panel">
            <div className="panel-header">
              <div><span className="section-label">Pick sequence</span><h2>{sampleCart.length} cart items</h2></div>
              <ShoppingBasket size={19} />
            </div>
            <div className="mode-control" aria-label="Route strategy">
              <button className={mode === "optimized" ? "active" : ""} onClick={() => setMode("optimized")}><strong>Optimized</strong><span>{Math.round(optimized.distance)} ft</span></button>
              <button className={mode === "baseline" ? "active" : ""} onClick={() => setMode("baseline")}><strong>Aisle order</strong><span>{Math.round(baseline.distance)} ft</span></button>
            </div>
            <div className="sequence-note"><Info size={14} /><span>{mode === "optimized" ? "Ambient picks first; chilled and frozen picks deferred." : "Items sorted by aisle label without route optimization."}</span></div>
            <div className="item-list">
              {orderedItems.map((item, index) => <ItemRow key={item.productId} item={item} order={index + 1} picked={picked.has(item.productId)} onToggle={() => togglePicked(item.productId)} />)}
            </div>
            <button className="primary-action"><Route size={16} /> Begin simulated pick <ArrowRight size={16} /></button>
          </aside>
        </section>

        <section className="evidence-grid">
          <article><Clock3 /><div><span>Estimated walk-time change</span><strong>-{walkingMinutes(baseline.distance) - walkingMinutes(optimized.distance)} min</strong><small>Distance-derived estimate, not observed time</small></div></article>
          <article><PackageCheck /><div><span>Handling constraints</span><strong>2 active</strong><small>Chilled and frozen items deferred</small></div></article>
          <article><Route /><div><span>Current algorithm</span><strong>Nearest neighbor</strong><small>Dijkstra shortest paths between stops</small></div></article>
        </section>

        <section className="method" id="method">
          <div><span className="section-label">Method and limitations</span><h2>Designed to make the claim inspectable.</h2><p>The interface exposes the baseline, constraints, and synthetic-data caveat so the route result can be evaluated rather than merely presented.</p></div>
          <ol>
            <li><span>01</span><div><strong>Model walkable paths</strong><p>Represent entrances, intersections, product positions, and checkout as a weighted graph.</p></div></li>
            <li><span>02</span><div><strong>Sequence under constraints</strong><p>Find a practical item order while deferring temperature-sensitive products.</p></div></li>
            <li><span>03</span><div><strong>Compare with a baseline</strong><p>Report distance against aisle-order sorting and clearly label simulated estimates.</p></div></li>
          </ol>
        </section>
      </main>
    </div>
  );
}

export default App;
