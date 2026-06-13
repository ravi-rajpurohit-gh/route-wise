import type { Cart, ResolvedCart, RouteContext, RouteResult } from "./domain";
import { aisleOrderRoute, optimizedRoute, routeSavings } from "./optimizer";
import type { StoreRepository } from "./repository";
import { createRouteContext, resolveCartForStore } from "./resolver";

export type StoreRoutePlan = {
  resolvedCart: ResolvedCart;
  context: RouteContext;
  baseline: RouteResult;
  optimized: RouteResult;
  savingsPercent: number;
};

export async function planRouteForStore(
  repository: StoreRepository,
  cart: Cart,
  storeId: string,
  entryNodeId?: string,
  checkoutNodeId?: string,
): Promise<StoreRoutePlan> {
  const resolvedCart = await resolveCartForStore(repository, cart, storeId);
  const context = createRouteContext(resolvedCart.layout, entryNodeId, checkoutNodeId);
  const baseline = aisleOrderRoute(context, resolvedCart.items);
  const optimized = optimizedRoute(context, resolvedCart.items);
  return {
    resolvedCart,
    context,
    baseline,
    optimized,
    savingsPercent: routeSavings(baseline, optimized),
  };
}
