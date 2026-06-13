import { describe, expect, it } from "vitest";
import type { FixtureData } from "./repository";
import { carts, layouts, placements, products, stores } from "./data/fixtures";
import { optimizedRoute } from "./optimizer";
import { FixtureStoreRepository, validateFixtureData } from "./repository";
import { createRouteContext, resolveCartForStore } from "./resolver";

const data: FixtureData = { stores, layouts, products, placements };

describe("multi-store fixtures", () => {
  it("validates the complete fixture dataset", () => {
    expect(() => validateFixtureData(data)).not.toThrow();
  });

  it("rejects placements that reference nodes outside their layout", () => {
    const invalid: FixtureData = {
      ...data,
      placements: [{ ...placements[0], nodeId: "store-2751:a03" }, ...placements.slice(1)],
    };
    expect(() => validateFixtureData(invalid)).toThrow(/invalid node/);
  });
});

describe("fixture constraints", () => {
  it("rejects duplicate placements for one product in a layout", () => {
    const invalid: FixtureData = { ...data, placements: [placements[0], ...placements] };
    expect(() => validateFixtureData(invalid)).toThrow(/Duplicate placement/);
  });
});

describe("cart resolution", () => {
  const repository = new FixtureStoreRepository(data);
  const cart = carts[0];

  it("resolves the same cart to different placements by store", async () => {
    const plano = await resolveCartForStore(repository, cart, "store-1842");
    const frisco = await resolveCartForStore(repository, cart, "store-2751");
    expect(plano.items.find((item) => item.productId === "detergent")?.aisleLabel).toBe("A18");
    expect(frisco.items.find((item) => item.productId === "detergent")?.aisleLabel).toBe("B03");
  });

  it("reports unavailable products without including them in routing input", async () => {
    const allen = await resolveCartForStore(repository, cart, "store-4103");
    expect(allen.unresolved).toContainEqual({ productId: "coffee", quantity: 1, reason: "unavailable" });
    expect(allen.items.some((item) => item.productId === "coffee")).toBe(false);
  });

  it("reports unknown products without failing route resolution", async () => {
    const cartWithUnknownProduct = { ...cart, lines: [...cart.lines, { productId: "unknown", quantity: 1 }] };
    const plano = await resolveCartForStore(repository, cartWithUnknownProduct, "store-1842");
    expect(plano.unresolved).toContainEqual({ productId: "unknown", quantity: 1, reason: "unknown-product" });
  });

  it("reports missing placements without failing route resolution", async () => {
    const repositoryWithoutBread = new FixtureStoreRepository({
      ...data,
      placements: placements.filter((placement) => !(placement.storeId === "store-1842" && placement.productId === "bread")),
    });
    const plano = await resolveCartForStore(repositoryWithoutBread, cart, "store-1842");
    expect(plano.unresolved).toContainEqual({ productId: "bread", quantity: 1, reason: "missing-placement" });
  });

  it("produces store-isolated routes for every fixture store", async () => {
    for (const store of stores) {
      const resolved = await resolveCartForStore(repository, cart, store.id);
      const route = optimizedRoute(createRouteContext(resolved.layout), resolved.items);
      expect(route.path.every((nodeId) => nodeId.startsWith(`${store.id}:`))).toBe(true);
    }
  });

  it("produces different pick sequences for different stores", async () => {
    const plano = await resolveCartForStore(repository, cart, "store-1842");
    const frisco = await resolveCartForStore(repository, cart, "store-2751");
    const planoRoute = optimizedRoute(createRouteContext(plano.layout), plano.items);
    const friscoRoute = optimizedRoute(createRouteContext(frisco.layout), frisco.items);
    const productSequence = (stops: string[], items: typeof plano.items) => {
      const productByNode = new Map(items.map((item) => [item.nodeId, item.productId]));
      return stops.map((nodeId) => productByNode.get(nodeId)).filter(Boolean);
    };
    expect(productSequence(planoRoute.stops, plano.items)).not.toEqual(productSequence(friscoRoute.stops, frisco.items));
  });
});
