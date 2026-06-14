import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  ExternalLink,
  Github,
  Info,
  Map as MapIcon,
  MapPin,
  Minus,
  MoreHorizontal,
  Navigation,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import type { Product, ResolvedPickItem, Store } from "./domain";
import { placements, products } from "./data/fixtures";
import { addedOrderRoute, aisleOrderRoute, optimizedRoute } from "./optimizer";
import { defaultShoppingState, loadShoppingState, saveShoppingState } from "./persistence";
import { createPickSession, markItemPicked, markItemSkipped, pendingItems, startPickSession, undoLastAction, type PickSession } from "./pickSession";
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
import { StoreMap } from "./StoreMap";

type Tab = "shop" | "search" | "cart" | "route" | "about";

const productById = new Map(products.map((product) => [product.id, product]));
const orderLabels: Record<CartOrdering, string> = {
  "added-order": "Added order",
  "aisle-order": "Aisle order",
  recommended: "Recommended route",
};

function itemCountLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

function StorePicker({ stores, value, onChange }: { stores: Store[]; value: string; onChange: (id: string) => void }) {
  return <label className="store-picker"><MapPin size={18} /><span><small>Selected store</small><select aria-label="Store" value={value} onChange={(event) => onChange(event.target.value)}>{stores.map((store) => <option key={store.id} value={store.id}>{store.name} · {store.location}</option>)}</select></span></label>;
}

function QuantityControl({ product, quantity, onChange }: { product: Product; quantity: number; onChange: (quantity: number) => void }) {
  return <div className="quantity" aria-label={`${product.name} quantity`}><button aria-label={`Decrease ${product.name}`} onClick={() => onChange(quantity - 1)}><Minus size={14} /></button><span aria-live="polite">{quantity}</span><button aria-label={`Increase ${product.name}`} onClick={() => onChange(quantity + 1)}><Plus size={14} /></button></div>;
}

function ProductCard({ product, aisleLabel, available, quantity, onAdd, onQuantityChange }: { product: Product; aisleLabel?: string; available: boolean; quantity: number; onAdd: () => void; onQuantityChange: (quantity: number) => void }) {
  return <article className="product-card"><div className="product-art">{product.name.slice(0, 1)}</div><div className="product-copy"><strong>{product.name}</strong><span>{product.category}</span><small>{available ? `${aisleLabel} · In stock` : "Unavailable at this store"}</small></div>{quantity > 0 ? <QuantityControl product={product} quantity={quantity} onChange={onQuantityChange} /> : <button className="add-product" aria-label={`Add ${product.name}`} onClick={onAdd} disabled={!available}>Add</button>}</article>;
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
  const orderedActiveLines = useMemo(() => {
    const activeByProduct = new Map(active.map((line) => [line.productId, line]));
    const ordered = orderedItems.map((item) => activeByProduct.get(item.productId)).filter((line): line is ShoppingCartState["lines"][number] => Boolean(line));
    const orderedIds = new Set(ordered.map((line) => line.id));
    return [...ordered, ...active.filter((line) => !orderedIds.has(line.id))];
  }, [active, orderedItems]);
  const previewRoute = useMemo(() => {
    if (!plan) return null;
    if (cart.ordering === "added-order") return addedOrderRoute(plan.context, plan.resolvedCart.items);
    return cart.ordering === "aisle-order" ? aisleOrderRoute(plan.context, plan.resolvedCart.items) : optimizedRoute(plan.context, plan.resolvedCart.items);
  }, [cart.ordering, plan]);
  const pending = plan && session ? pendingItems(session, plan.resolvedCart.items) : [];
  const activeSessionRoute = plan && session?.active ? optimizedRoute({ ...plan.context, startNodeId: session.currentNodeId }, pending) : previewRoute;
  const nextItem = session?.active ? orderedItems.find((item) => session.statuses[item.productId] === "pending") : undefined;
  const shoppingComplete = Boolean(session?.active && plan?.resolvedCart.items.length && pending.length === 0);
  const stopNumbers = useMemo(() => new Map(orderedItems.map((item, index) => [item.nodeId, index + 1])), [orderedItems]);
  const lastAction = session?.history[session.history.length - 1];
  const lastActionItem = lastAction ? productById.get(lastAction.productId) : undefined;

  const clearCart = () => {
    if (window.confirm("Remove all active items from your cart? Saved items will remain.")) setCart(clearActiveCart(cart));
  };

  const changeStore = (storeId: string) => {
    if (session?.active && !window.confirm("Changing stores will end the current shopping session. Continue?")) return;
    setSelectedStoreId(storeId);
    setTab("shop");
  };

  return (
    <div className="mobile-app">
      <header className="app-header"><a className="wordmark" href="#">RouteWise</a><StorePicker stores={stores} value={selectedStoreId} onChange={changeStore} /><button aria-label={"Open cart with " + itemCountLabel(active.length)} className="cart-shortcut" onClick={() => setTab("cart")}><ShoppingCart size={19} /><span>{active.length}</span></button></header>
      <main className="app-main">
        {tab === "shop" ? <section className="screen">
          <div className="welcome"><span>Plan less. Pick faster.</span><h1>What do you need today?</h1><button onClick={() => setTab("search")}><Search size={18} /> Search products</button></div>
          <div className="section-heading"><div><small>Trip overview</small><h2>{itemCountLabel(active.length)} ready to plan</h2></div><button onClick={() => setTab("cart")}>Manage cart <ChevronRight size={15} /></button></div>
          {active.length === 0 ? <div className="empty-state"><ShoppingCart /><strong>Your cart is empty</strong><span>Add products from the selected store to build your route.</span><button onClick={() => setTab("search")}>Browse products</button></div> : <div className="trip-summary"><div><span>Shopping order</span><strong>{orderLabels[cart.ordering]}</strong></div><div><span>Selected store</span><strong>{plan?.resolvedCart.store.name}</strong></div><div><span>Estimated savings</span><strong>{plan?.savingsPercent ?? 0}% vs. aisle order</strong></div></div>}
          {active.length > 0 ? <button className="wide-action" onClick={() => setTab("route")}><Navigation size={18} /> Review shopping route</button> : null}
        </section> : null}

        {tab === "search" ? <section className="screen"><div className="screen-title"><small>Selected-store catalog</small><h1>Find products</h1></div><label className="search-field"><Search size={18} /><input autoFocus aria-label="Search products" placeholder="Search products or categories" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="product-grid">{searchResults.map((product) => { const line = active.find((activeLine) => activeLine.productId === product.id); return <ProductCard key={product.id} product={product} aisleLabel={storePlacements.get(product.id)?.aisleLabel} available={storePlacements.get(product.id)?.status === "available"} quantity={line?.quantity ?? 0} onAdd={() => setCart(addProduct(cart, product))} onQuantityChange={(quantity) => setCart(line ? updateQuantity(cart, line.id, quantity) : addProduct(cart, product))} />; })}</div>{searchResults.length === 0 ? <div className="empty-state compact-empty"><Search /><strong>No products found</strong><span>Try a product name or category available in the selected store catalog.</span></div> : null}</section> : null}

        {tab === "cart" ? <section className="screen"><div className="screen-title row"><div><small>Cart and shopping order</small><h1>{itemCountLabel(active.length)}</h1></div>{active.length ? <button className="text-danger" onClick={clearCart}>Clear cart</button> : null}</div>
          <label className="order-control"><span><strong>Shopping order</strong><small>Reorders this list and the route preview.</small></span><select aria-label="Shopping order" value={cart.ordering} onChange={(event) => setCart(setCartOrdering(cart, event.target.value as CartOrdering))}>{Object.entries(orderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="cart-list" aria-label="Cart items">{orderedActiveLines.map((line, index) => { const product = productById.get(line.productId)!; const placement = placementByProduct.get(line.productId); return <article key={line.id} className="cart-line"><b className="order-index">{index + 1}</b><div className="product-art">{product.name[0]}</div><div><strong>{product.name}</strong><span>{placement?.aisleLabel ?? "Needs attention"}</span></div><QuantityControl product={product} quantity={line.quantity} onChange={(quantity) => setCart(updateQuantity(cart, line.id, quantity))} /><button aria-label={`More actions for ${product.name}`} onClick={() => setActionsFor(actionsFor === line.id ? null : line.id)}><MoreHorizontal /></button>{actionsFor === line.id ? <div className="line-menu"><button onClick={() => { setCart(saveForLater(cart, line.id)); setActionsFor(null); }}>Save for later</button><button onClick={() => { setCart(removeLine(cart, line.id)); setActionsFor(null); }}>Remove</button><button onClick={() => setActionsFor(null)}>Cancel</button></div> : null}</article>; })}</div>
          {saved.length ? <><div className="section-heading"><div><small>Saved for later</small><h2>{itemCountLabel(saved.length)}</h2></div></div><div className="compact-list saved-list">{saved.map((line) => <div key={line.id}><strong>{productById.get(line.productId)?.name}</strong><button className="secondary-button" onClick={() => setCart(moveToCart(cart, line.id))}>Move to cart</button></div>)}</div></> : null}
          {active.length ? <button className="wide-action" onClick={() => setTab("route")}><Navigation size={18} /> Review {orderLabels[cart.ordering]}</button> : null}
        </section> : null}

        {tab === "about" ? <section className="screen about-screen"><div className="about-hero"><small>Product and engineering brief</small><h1>Faster in-store picking starts with the entire cart.</h1><p>Aisle labels tell shoppers where products are. RouteWise determines the order to collect them using the selected store layout, availability, and handling constraints.</p><div className="about-links"><a href="https://github.com/ravi-rajpurohit-gh/route-wise" target="_blank" rel="noreferrer"><Github size={18} /> View source <ExternalLink size={14} /></a><a href="https://route-wise-mocha.vercel.app/" target="_blank" rel="noreferrer">Live deployment <ExternalLink size={14} /></a></div></div><div className="about-grid"><article><small>Problem</small><h2>Location is not sequence</h2><p>A cart with aisle labels still leaves the shopper to determine an efficient path across a large store.</p></article><article><small>Solution</small><h2>Store-specific cart ordering</h2><p>Resolve products against the selected store, then sequence available items from entry to checkout.</p></article><article><small>Primary users</small><h2>Speed-sensitive shoppers</h2><p>Delivery shoppers, fulfillment associates, and customers who value a shorter, predictable trip.</p></article></div><section className="method-section"><div className="screen-title"><small>How it works</small><h2>From cart to route</h2></div><ol className="method-steps"><li><b>1</b><div><strong>Resolve the cart</strong><span>Match every product to availability and placement in the selected store.</span></div></li><li><b>2</b><div><strong>Model walkable paths</strong><span>Represent aisles and intersections as a weighted graph and calculate shortest paths between stops.</span></div></li><li><b>3</b><div><strong>Sequence the trip</strong><span>Choose nearby items while deferring chilled and frozen products until later in the trip.</span></div></li></ol><div className="formula"><span>Route objective</span><code>minimize Σ distance(stopᵢ, stopᵢ₊₁)</code><small>subject to entry, checkout, availability, and handling constraints</small></div></section><section className="evidence-section"><div className="screen-title"><small>Current evidence</small><h2>Transparent comparison</h2></div><div className="evidence-grid"><div><span>Baseline</span><strong>Aisle-order route</strong></div><div><span>Current store</span><strong>{plan?.resolvedCart.store.name ?? "Loading"}</strong></div><div><span>Current cart savings</span><strong>{active.length ? String(plan?.savingsPercent ?? 0) + "%" : "Add items to measure"}</strong></div></div><p>Results use maintained store-layout and product-placement fixtures. The current heuristic is not guaranteed to be globally optimal; broader benchmarks and live retailer integrations remain future work.</p></section></section> : null}

        {tab === "route" && plan && session && activeSessionRoute ? <section className="screen route-screen"><div className="screen-title row"><div><small>{session.active ? "Shopping in progress" : orderLabels[cart.ordering]}</small><h1>{session.active ? `${pending.length} items remaining` : "Route preview"}</h1></div><button className="secondary-action" onClick={() => { setSession(createPickSession(plan.resolvedCart.items, plan.context.startNodeId)); setTab("cart"); }}>Edit cart</button></div>
          {lastAction && lastActionItem ? <div className="undo-banner" role="status"><span><strong>{lastAction.status === "picked" ? "Item marked as picked" : "Item marked as not found"}</strong>{lastActionItem.name}</span><button onClick={() => setSession(undoLastAction(session))}>Undo</button></div> : null}
          {shoppingComplete ? <article className="completion-state"><Check size={24} /><small>Shopping complete</small><h2>All route items are resolved</h2><p>Continue to checkout, or undo the last action if something needs correction.</p><button onClick={() => { setSession(createPickSession(plan.resolvedCart.items, plan.context.startNodeId)); setTab("shop"); }}>Finish trip</button></article> : nextItem ? <article className="next-item"><small>Stop {stopNumbers.get(nextItem.nodeId)} · {nextItem.aisleLabel}</small><h2>{nextItem.name}</h2><span>{nextItem.category}</span><button onClick={() => setSession(markItemPicked(session, nextItem))}><Check size={18} /> Mark picked</button><button className="cannot-find" onClick={() => setSession(markItemSkipped(session, nextItem))}>Cannot find item</button></article> : null}
          <StoreMap route={activeSessionRoute} context={plan.context} store={plan.resolvedCart.store} stopNumbers={stopNumbers} />
          {!session.active ? <div className="route-sequence"><span>Shopping order</span>{orderedItems.map((item, index) => <div key={item.productId}><b>{index + 1}</b><strong>{item.name}</strong><small>{item.aisleLabel}</small></div>)}</div> : null}
          <button className="wide-action sticky-action" onClick={() => setSession(session.active ? createPickSession(plan.resolvedCart.items, plan.context.startNodeId) : startPickSession(session))}><Navigation size={18} /> {session.active ? "End shopping session" : "Start shopping"}</button>
        </section> : null}
      </main>
      <nav aria-label="Primary navigation" className="mobile-nav">{([["shop", MapPin, "Shop"], ["search", Search, "Search"], ["cart", ShoppingCart, "Cart"], ["route", MapIcon, "Route"], ["about", Info, "About"]] as const).map(([id, Icon, label]) => <button key={id} aria-current={tab === id ? "page" : undefined} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
    </div>
  );
}

export default App;
