import { describe, expect, it } from "vitest";
import { carts, layouts, placements, products, stores } from "./data/fixtures";
import { FixtureStoreRepository } from "./repository";
import { planRouteForStore } from "./routeService";

const repository = new FixtureStoreRepository({ stores, layouts, products, placements });

describe("multi-store route planning service", () => {
  it("returns a complete route plan for each store", async () => {
    for (const store of stores) {
      const plan = await planRouteForStore(repository, carts[0], store.id);
      expect(plan.resolvedCart.store.id).toBe(store.id);
      expect(plan.context.startNodeId.startsWith(`${store.id}:`)).toBe(true);
      expect(plan.baseline.distance).toBeGreaterThan(0);
      expect(plan.optimized.distance).toBeGreaterThan(0);
      expect(plan.savingsPercent).toBeGreaterThanOrEqual(0);
    }
  });

  it("carries unavailable products into the plan without routing them", async () => {
    const plan = await planRouteForStore(repository, carts[0], "store-4103");
    expect(plan.resolvedCart.unresolved).toContainEqual({
      productId: "coffee",
      quantity: 1,
      reason: "unavailable",
    });
    expect(plan.optimized.stops.some((nodeId) => nodeId === "store-4103:a18")).toBe(false);
  });
});
