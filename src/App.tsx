import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Info,
  MapPin,
  PackageCheck,
  RotateCcw,
  Route,
  ShoppingBasket,
  SkipForward,
  Snowflake,
} from "lucide-react";
import type { ResolvedPickItem, RouteContext, RouteResult, Store } from "./domain";
import { optimizedRoute } from "./optimizer";
import {
  completedCount,
  createPickSession,
  markItemPicked,
  markItemSkipped,
  pendingItems,
  startPickSession,
  type PickSession,
} from "./pickSession";
import { planRouteForStore, type StoreRoutePlan } from "./routeService";
import { fixtureRepository, sampleCartDefinition } from "./storeData";
import { products } from "./data/fixtures";

const walkingMinutes = (distance: number) => Math.round(distance / 75);
const productById = new Map(products.map((product) => [product.id, product]));

function StoreMap({ route, mode, context }: { route: RouteResult; mode: "optimized" | "baseline"; context: RouteContext }) {
  const nodeById = new Map(context.nodes.map((node) => [node.id, node]));
  const routePoints = route.path.map((id) => nodeById.get(id)!).filter(Boolean).map((node) => `${node.x},${node.y}`).join(" ");
  const entry = nodeById.get(context.startNodeId);
  const checkout = nodeById.get(context.endNodeId);

  return (
    <div className="map-panel">
      <div className="panel-header">
        <div>
          <span className="section-label">Store floor plan</span>
          <h2>{mode === "optimized" ? "Recommended route" : "Aisle-order route"}</h2>
        </div>
        <span className="route-state"><span /> Route ready</span>
      </div>
      <div className="map-canvas">
        <svg className="store-map" viewBox="0 0 670 610" role="img" aria-label="Store pick route">
          <rect x="32" y="34" width="606" height="544" rx="8" className="floor" />
          {context.edges.map((edge) => {
            const from = nodeById.get(edge.from)!;
            const to = nodeById.get(edge.to)!;
            return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="walkway" />;
          })}
          {context.nodes.filter((node) => node.kind === "item").map((node) => (
            <g key={node.id}>
              <rect x={node.x - 18} y={node.y - 12} width="36" height="24" rx="3" className="location-block" />
              <text x={node.x} y={node.y + 3} textAnchor="middle" className="location-label">{node.label}</text>
            </g>
          ))}
          <polyline points={routePoints} className={`route-line ${mode}`} />
          {route.stops.slice(1, -1).map((id, index) => {
            const node = nodeById.get(id);
            return node ? (
              <g key={id}>
                <circle cx={node.x} cy={node.y} r="14" className={`stop-circle ${mode}`} />
                <text x={node.x} y={node.y + 4} textAnchor="middle" className="stop-number">{index + 1}</text>
              </g>
            ) : null;
          })}
          {entry ? <g><circle cx={entry.x} cy={entry.y} r="18" className="entry-circle" /><text x={entry.x} y={entry.y + 4} textAnchor="middle" className="entry-text">START</text></g> : null}
          {checkout ? <g><circle cx={checkout.x} cy={checkout.y} r="18" className="exit-circle" /><text x={checkout.x} y={checkout.y + 4} textAnchor="middle" className="entry-text">OUT</text></g> : null}
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

function ItemRow({
  item,
  order,
  status,
  sessionActive,
  onPicked,
  onSkipped,
}: {
  item: ResolvedPickItem;
  order: number;
  status: "pending" | "picked" | "skipped";
  sessionActive: boolean;
  onPicked: () => void;
  onSkipped: () => void;
}) {
  return (
    <article className={`item-row ${status}`}>
      <span className="order-number">{status === "picked" ? <Check size={14} /> : order}</span>
      <span className="item-copy"><strong>{item.name}</strong><small>{item.category} · Qty {item.quantity}</small></span>
      {item.handling === "frozen" || item.handling === "chilled" ? <Snowflake size={14} className="cold-icon" /> : null}
      <span className="aisle-pill">{item.aisleLabel}</span>
      <span className="item-actions">
        <button onClick={onSkipped} disabled={!sessionActive || status !== "pending"}><SkipForward size={13} /> Skip</button>
        <button className="picked-action" onClick={onPicked} disabled={!sessionActive || status !== "pending"}><Check size={13} /> Picked</button>
      </span>
    </article>
  );
}

function App() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("store-1842");
  const [plan, setPlan] = useState<StoreRoutePlan | null>(null);
  const [session, setSession] = useState<PickSession | null>(null);
  const [mode, setMode] = useState<"optimized" | "baseline">("optimized");
  const [error, setError] = useState("");

  useEffect(() => {
    fixtureRepository.listStores().then(setStores).catch((reason: Error) => setError(reason.message));
  }, []);

  useEffect(() => {
    let current = true;
    setError("");
    planRouteForStore(fixtureRepository, sampleCartDefinition, selectedStoreId)
      .then((nextPlan) => {
        if (!current) return;
        setPlan(nextPlan);
        setSession(createPickSession(nextPlan.resolvedCart.items, nextPlan.context.startNodeId));
        setMode("optimized");
      })
      .catch((reason: Error) => { if (current) setError(reason.message); });
    return () => { current = false; };
  }, [selectedStoreId]);

  const pending = useMemo(() => plan && session ? pendingItems(session, plan.resolvedCart.items) : [], [plan, session]);
  const remainingRoute = useMemo(() => {
    if (!plan || !session || !session.active) return null;
    return optimizedRoute({ ...plan.context, startNodeId: session.currentNodeId }, pending);
  }, [plan, session, pending]);

  if (error) return <main className="state-page"><h1>Unable to load route</h1><p>{error}</p></main>;
  if (!plan || !session) return <main className="state-page"><h1>Loading route...</h1></main>;

  const activeRoute = session.active && remainingRoute ? remainingRoute : mode === "optimized" ? plan.optimized : plan.baseline;
  const activeContext = session.active ? { ...plan.context, startNodeId: session.currentNodeId } : plan.context;
  const mapMode = session.active ? "optimized" : mode;
  const itemByNode = new Map(plan.resolvedCart.items.map((item) => [item.nodeId, item]));
  const routeItems = activeRoute.stops.slice(1, -1).map((id) => itemByNode.get(id)).filter((item): item is ResolvedPickItem => Boolean(item));
  const completed = completedCount(session);
  const total = plan.resolvedCart.items.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const savedDistance = Math.round(plan.baseline.distance - plan.optimized.distance);

  const resetSession = () => setSession(createPickSession(plan.resolvedCart.items, plan.context.startNodeId));

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#"><span>RW</span><strong>RouteWise</strong><small>Store fulfillment routing</small></a>
        <nav><a href="#workspace">Pick route</a><a href="#performance">Performance</a><a href="#method">How it works</a></nav>
        <span className="environment-tag">Operations console</span>
      </header>

      <main>
        <section className="page-heading">
          <div>
            <span className="section-label">Active pick route</span>
            <h1>{plan.resolvedCart.store.name}</h1>
            <p>{plan.resolvedCart.store.location} · Layout {plan.resolvedCart.layout.version}</p>
          </div>
          <label className="store-select"><MapPin size={15} /><span>Store</span><select value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name} · {store.location}</option>)}</select></label>
        </section>

        <section className="summary-strip" id="performance">
          <article className="primary-finding"><span className="section-label">Route improvement</span><div><strong>{plan.savingsPercent}%</strong><p>less walking distance than aisle-order routing</p></div><small>{total} routed items · temperature-sensitive items deferred</small></article>
          <article><span>Recommended route</span><strong>{Math.round(plan.optimized.distance)} ft</strong><small>{walkingMinutes(plan.optimized.distance)} min estimated walk</small></article>
          <article><span>Aisle-order route</span><strong>{Math.round(plan.baseline.distance)} ft</strong><small>{walkingMinutes(plan.baseline.distance)} min estimated walk</small></article>
          <article><span>Distance avoided</span><strong>{savedDistance} ft</strong><small>For the selected store and cart</small></article>
        </section>

        <section className="store-context">
          <div className="store-identity"><span><MapPin size={17} /></span><div><strong>{session.active ? "Pick session active" : "Route ready"}</strong><small>{pending.length} items remaining · {plan.resolvedCart.unresolved.length} unavailable</small></div></div>
          <div className="progress-copy"><span>{completed} of {total} items handled</span><div><i style={{ width: `${progress}%` }} /></div></div>
        </section>

        <section className="workspace" id="workspace">
          <StoreMap route={activeRoute} mode={mapMode} context={activeContext} />
          <aside className="pick-panel">
            <div className="panel-header"><div><span className="section-label">Pick sequence</span><h2>{total} available items</h2></div><ShoppingBasket size={19} /></div>
            {!session.active ? <div className="mode-control" aria-label="Route strategy"><button className={mode === "optimized" ? "active" : ""} onClick={() => setMode("optimized")}><strong>Recommended</strong><span>{Math.round(plan.optimized.distance)} ft</span></button><button className={mode === "baseline" ? "active" : ""} onClick={() => setMode("baseline")}><strong>Aisle order</strong><span>{Math.round(plan.baseline.distance)} ft</span></button></div> : null}
            <div className="sequence-note"><Info size={14} /><span>{session.active ? "Mark items picked or skipped. The remaining route updates from your last confirmed pick." : "Review the recommended sequence, then start picking."}</span></div>
            <div className="item-list">{routeItems.map((item, index) => <ItemRow key={item.productId} item={item} order={index + 1} status={session.statuses[item.productId]} sessionActive={session.active} onPicked={() => setSession(markItemPicked(session, item))} onSkipped={() => setSession(markItemSkipped(session, item))} />)}</div>
            {plan.resolvedCart.unresolved.length > 0 ? <section className="unavailable-list"><span className="section-label">Needs attention</span>{plan.resolvedCart.unresolved.map((line) => <div key={line.productId}><strong>{productById.get(line.productId)?.name ?? line.productId}</strong><small>{line.reason.replace("-", " ")}</small></div>)}</section> : null}
            <button className="primary-action" onClick={() => { if (session.active) resetSession(); else { setMode("optimized"); setSession(startPickSession(session)); } }}>{session.active ? <RotateCcw size={16} /> : <Route size={16} />}{session.active ? "Reset pick session" : "Start picking"}</button>
          </aside>
        </section>

        <section className="evidence-grid"><article><Clock3 /><div><span>Estimated walk-time change</span><strong>-{walkingMinutes(plan.baseline.distance) - walkingMinutes(plan.optimized.distance)} min</strong><small>Based on route distance</small></div></article><article><PackageCheck /><div><span>Handling rules</span><strong>2 active</strong><small>Chilled and frozen items deferred</small></div></article><article><Route /><div><span>Routing method</span><strong>Nearest neighbor</strong><small>Shortest paths between pick locations</small></div></article></section>

        <section className="method" id="method"><div><span className="section-label">How it works</span><h2>A store-specific route for every cart.</h2><p>RouteWise resolves the cart to the selected store, applies item-handling rules, and updates the remaining path as the pick progresses.</p></div><ol><li><span>01</span><div><strong>Select a store</strong><p>Resolve each cart item to its aisle and pick location for that store.</p></div></li><li><span>02</span><div><strong>Follow the route</strong><p>Mark items picked or skipped while the remaining sequence recalculates.</p></div></li><li><span>03</span><div><strong>Complete the cart</strong><p>Review unavailable products and finish at checkout.</p></div></li></ol></section>
      </main>
    </div>
  );
}

export default App;
