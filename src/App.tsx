import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Map as MapIcon,
  MapPin,
  Minus,
  MoreHorizontal,
  Navigation,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import type { Product, ResolvedPickItem, RouteContext, RouteResult, Store } from "./domain";
import { placements, products } from "./data/fixtures";
import { addedOrderRoute, aisleOrderRoute, optimizedRoute } from "./optimizer";
import { defaultShoppingState, loadShoppingState, saveShoppingState } from "./persistence";
import { createPickSession, markItemPicked, markItemSkipped, pendingItems, startPickSession, type PickSession } from "./pickSession";
import { planRouteForStore, type StoreRoutePlan } from "./routeService";
import {
  activeLines,
  addProduct,
  clearActiveCart,
  moveToCart,
  removeLine,
  saveForLater,
  savedLines,
  setCartOrdering,
  toRouteCart,
  updateQuantity,
  type CartOrdering,
  type ShoppingCart as ShoppingCartState,
} from "./shoppingCart";
import { fixtureRepository } from "./storeData";

type Tab = "shop" | "search" | "cart" | "route";

const productById = new Map(products.map((product) => [product.id, product]));
const orderLabels: Record<CartOrdering, string> = {
  "added-order": "Added order",
  "aisle-order": "Aisle order",
  recommended: "Recommended route",
};

function StoreMap({ route, context }: { route: RouteResult; context: RouteContext }) {
  const nodeById = new Map(context.nodes.map((node) => [node.id, node]));
  const points = route.path.map((id) => nodeById.get(id)).filter(Boolean).map((node) => `${node!.x},${node!.y}`).join(" ");
  return (
    <div className="route-map">
      <svg viewBox="0 0 670 610" role="img" aria-label="Shopping route">
        <rect x="32" y="34" width="606" height="544" rx="16" className="floor" />
        {context.edges.map((edge) => {
          const from = nodeById.get(edge.from)!;
          const to = nodeById.get(edge.to)!;
          return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="walkway" />;
        })}
        {context.nodes.filter((node) => node.kind === "item").map((node) => <g key={node.id}><rect x={node.x - 22} y={node.y - 14} width="44" height="28" rx="5" className="location-block" /><text x={node.x} y={node.y + 3} textAnchor="middle" className="location-label">{node.label}</text></g>)}
        <polyline points={points} className="active-route" />
        {route.stops.slice(1, -1).map((id, index) => {
          const node = nodeById.get(id);
          return node ? <g key={id}><circle cx={node.x} cy={node.y} r="15" className="route-stop" /><text x={node.x} y={node.y + 4} textAnchor="middle" className="route-stop-label">{index + 1}</text></g> : null;
        })}
      </svg>
    </div>
  );
}

function StorePicker({ stores, value, onChange }: { stores: Store[]; value: string; onChange: (id: string) => void }) {
  return <label className="store-picker"><MapPin size={18} /><span><small>Shopping at</small><select aria-label="Store" value={value} onChange={(event) => onChange(event.target.value)}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name} · {store.location}</option>)}</select></span></label>;
}

function ProductCard({ product, aisleLabel, available, inCart, onAdd }: { product: Product; aisleLabel?: string; available: boolean; inCart: boolean; onAdd: () => void }) {
  return <article className="product-card"><div className="product-art">{product.name.slice(0, 1)}</div><div className="product-copy"><strong>{product.name}</strong><span>{product.category}</span><small>{available ? `${aisleLabel} · In stock` : "Unavailable at this store"}</small></div><button onClick={onAdd} disabled={!available}>{inCart ? "Add another" : "Add"}</button></article>;
}

function App() {
  const initial = useMemo(() => loadShoppingState(localStorage), []);
  const [tab, setTab] = useState<Tab>("shop");
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState(initial.selectedStoreId);
  const [cart, setCart] = useState<ShoppingCartState>(initial.cart);
  const [plan, setPlan] = useState<StoreRoutePlan | null>(null);
  const [session, setSession] = useState<PickSession | null>(null);
  const [query, setQuery] = useState("");
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  useEffect(() => { fixtureRepository.listStores().then(setStores); }, []);
  useEffect(() => { saveShoppingState(localStorage, { ...defaultShoppingState(), selectedStoreId, cart }); }, [selectedStoreId, cart]);
  useEffect(() => {
    let current = true;
    planRouteForStore(fixtureRepository, toRouteCart(cart), selectedStoreId).then((next) => {
      if (!current) return;
      setPlan(next);
      setSession(createPickSession(next.resolvedCart.items, next.context.startNodeId));
    });
    return () => { current = false; };
  }, [selectedStoreId, cart]);

  const active = activeLines(cart);
  const saved = savedLines(cart);
  const activeIds = new Set(active.map((line) => line.productId));
  const placementByProduct = new Map(plan?.resolvedCart.items.map((item) => [item.productId, item]) ?? []);
  const storePlacements = new Map(placements.filter((placement) => placement.storeId === selectedStoreId).map((placement) => [placement.productId, placement]));
  const searchResults = products.filter((product) => `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const orderedItems = useMemo(() => {
    if (!plan) return [];
    if (cart.ordering === "added-order") return plan.resolvedCart.items;
    const route = cart.ordering === "aisle-order" ? plan.baseline : plan.optimized;
    const byNode = new Map(plan.resolvedCart.items.map((item) => [item.nodeId, item]));
    return route.stops.map((id) => byNode.get(id)).filter((item): item is ResolvedPickItem => Boolean(item));
  }, [cart.ordering, plan]);
  const previewRoute = useMemo(() => {
    if (!plan) return null;
    if (cart.ordering === "added-order") return addedOrderRoute(plan.context, plan.resolvedCart.items);
    return cart.ordering === "aisle-order" ? aisleOrderRoute(plan.context, plan.resolvedCart.items) : optimizedRoute(plan.context, plan.resolvedCart.items);
  }, [cart.ordering, plan]);
  const pending = plan && session ? pendingItems(session, plan.resolvedCart.items) : [];
  const activeSessionRoute = plan && session?.active ? optimizedRoute({ ...plan.context, startNodeId: session.currentNodeId }, pending) : previewRoute;
  const nextItem = session?.active ? orderedItems.find((item) => session.statuses[item.productId] === "pending") : undefined;

  const changeStore = (storeId: string) => {
    if (session?.active && !window.confirm("Changing stores will end the current shopping session. Continue?")) return;
    setSelectedStoreId(storeId);
    setTab("shop");
  };

  return (
    <div className="mobile-app">
      <header className="app-header"><a className="wordmark" href="#">RouteWise</a><StorePicker stores={stores} value={selectedStoreId} onChange={changeStore} /><button className="cart-shortcut" onClick={() => setTab("cart")}><ShoppingCart size={19} /><span>{active.length}</span></button></header>
      <main className="app-main">
        {tab === "shop" ? <section className="screen">
          <div className="welcome"><span>Plan less. Pick faster.</span><h1>What do you need today?</h1><button onClick={() => setTab("search")}><Search size={18} /> Search products</button></div>
          <div className="section-heading"><div><small>Your cart</small><h2>{active.length} active items</h2></div><button onClick={() => setTab("cart")}>Manage <ChevronRight size={15} /></button></div>
          {active.length === 0 ? <div className="empty-state"><ShoppingCart /><strong>Your cart is empty</strong><span>Add products from the selected store to build your route.</span><button onClick={() => setTab("search")}>Browse products</button></div> : <div className="compact-list">{active.slice(0, 4).map((line) => <div key={line.id}><strong>{productById.get(line.productId)?.name}</strong><span>Qty {line.quantity}</span></div>)}</div>}
          {active.length > 0 ? <button className="wide-action" onClick={() => setTab("route")}><Navigation size={18} /> Review shopping route</button> : null}
        </section> : null}

        {tab === "search" ? <section className="screen"><div className="screen-title"><small>Search</small><h1>Add products</h1></div><label className="search-field"><Search size={18} /><input autoFocus aria-label="Search products" placeholder="Search products or categories" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="product-grid">{searchResults.map((product) => <ProductCard key={product.id} product={product} aisleLabel={storePlacements.get(product.id)?.aisleLabel} available={storePlacements.get(product.id)?.status === "available"} inCart={activeIds.has(product.id)} onAdd={() => setCart(addProduct(cart, product))} />)}</div></section> : null}

        {tab === "cart" ? <section className="screen"><div className="screen-title row"><div><small>Cart</small><h1>{active.length} active items</h1></div>{active.length ? <button className="text-danger" onClick={() => setCart(clearActiveCart(cart))}>Clear cart</button> : null}</div>
          <div className="order-control"><span>Shopping order</span><select aria-label="Shopping order" value={cart.ordering} onChange={(event) => setCart(setCartOrdering(cart, event.target.value as CartOrdering))}>{Object.entries(orderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div className="cart-list">{active.map((line) => { const product = productById.get(line.productId)!; const placement = placementByProduct.get(line.productId); return <article key={line.id} className="cart-line"><div className="product-art">{product.name[0]}</div><div><strong>{product.name}</strong><span>{placement?.aisleLabel ?? "Needs attention"}</span></div><div className="quantity"><button aria-label={`Decrease ${product.name}`} onClick={() => setCart(updateQuantity(cart, line.id, line.quantity - 1))}><Minus size={14} /></button><span>{line.quantity}</span><button aria-label={`Increase ${product.name}`} onClick={() => setCart(updateQuantity(cart, line.id, line.quantity + 1))}><Plus size={14} /></button></div><button aria-label={`More actions for ${product.name}`} onClick={() => setActionsFor(actionsFor === line.id ? null : line.id)}><MoreHorizontal /></button>{actionsFor === line.id ? <div className="line-menu"><button onClick={() => { setCart(saveForLater(cart, line.id)); setActionsFor(null); }}>Save for later</button><button onClick={() => { setCart(removeLine(cart, line.id)); setActionsFor(null); }}>Remove</button><button onClick={() => setActionsFor(null)}>Cancel</button></div> : null}</article>; })}</div>
          {saved.length ? <><div className="section-heading"><div><small>Saved for later</small><h2>{saved.length} items</h2></div></div><div className="compact-list">{saved.map((line) => <div key={line.id}><strong>{productById.get(line.productId)?.name}</strong><button onClick={() => setCart(moveToCart(cart, line.id))}>Move to cart</button></div>)}</div></> : null}
          {active.length ? <button className="wide-action" onClick={() => setTab("route")}><Navigation size={18} /> Review {orderLabels[cart.ordering]}</button> : null}
        </section> : null}

        {tab === "route" && plan && session && activeSessionRoute ? <section className="screen route-screen"><div className="screen-title row"><div><small>{session.active ? "Shopping in progress" : orderLabels[cart.ordering]}</small><h1>{session.active ? `${pending.length} items remaining` : "Route preview"}</h1></div><button className="secondary-action" onClick={() => { setSession(createPickSession(plan.resolvedCart.items, plan.context.startNodeId)); setTab("cart"); }}>Edit cart</button></div>
          {nextItem ? <article className="next-item"><small>Next item · {nextItem.aisleLabel}</small><h2>{nextItem.name}</h2><span>{nextItem.category}</span><button onClick={() => setSession(markItemPicked(session, nextItem))}><Check size={18} /> Mark picked</button><button className="cannot-find" onClick={() => setSession(markItemSkipped(session, nextItem))}>Cannot find item</button></article> : null}
          <StoreMap route={activeSessionRoute} context={session.active ? { ...plan.context, startNodeId: session.currentNodeId } : plan.context} />
          {!session.active ? <div className="route-sequence"><span>Shopping order</span>{orderedItems.map((item, index) => <div key={item.productId}><b>{index + 1}</b><strong>{item.name}</strong><small>{item.aisleLabel}</small></div>)}</div> : null}
          <button className="wide-action sticky-action" onClick={() => setSession(session.active ? createPickSession(plan.resolvedCart.items, plan.context.startNodeId) : startPickSession(session))}><Navigation size={18} /> {session.active ? "End shopping session" : "Start shopping"}</button>
        </section> : null}
      </main>
      <nav aria-label="Primary navigation" className="mobile-nav">{([["shop", MapPin, "Shop"], ["search", Search, "Search"], ["cart", ShoppingCart, "Cart"], ["route", MapIcon, "Route"]] as const).map(([id, Icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
    </div>
  );
}

export default App;
