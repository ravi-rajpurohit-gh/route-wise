import { describe, expect, it } from "vitest";
import { aisleOrderRoute, optimizedRoute, routeSavings } from "./optimizer";
import { sampleCart, sampleStore } from "./storeData";

describe("route optimizer", () => {
  it("starts at entry and ends at checkout", () => {
    const result = optimizedRoute(sampleStore, sampleCart);
    expect(result.stops[0]).toBe(sampleStore.startNodeId);
    expect(result.stops[result.stops.length - 1]).toBe(sampleStore.endNodeId);
  });

  it("visits every cart location", () => {
    const result = optimizedRoute(sampleStore, sampleCart);
    const required = new Set(sampleCart.map((item) => item.nodeId));
    expect(result.stops.filter((id) => required.has(id))).toHaveLength(required.size);
  });

  it("defers chilled and frozen items until after ambient items", () => {
    const result = optimizedRoute(sampleStore, sampleCart);
    const cold = new Set(sampleCart.filter((item) => item.handling === "chilled" || item.handling === "frozen").map((item) => item.nodeId));
    const picks = result.stops.slice(1, -1);
    const firstColdIndex = picks.findIndex((id) => cold.has(id));
    expect(picks.slice(firstColdIndex).every((id) => cold.has(id))).toBe(true);
  });

  it("outperforms the aisle-order baseline for the sample cart", () => {
    const baseline = aisleOrderRoute(sampleStore, sampleCart);
    const result = optimizedRoute(sampleStore, sampleCart);
    expect(result.distance).toBeLessThan(baseline.distance);
    expect(routeSavings(baseline, result)).toBeGreaterThan(0);
  });
});
