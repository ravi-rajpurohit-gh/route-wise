import { describe, expect, it } from "vitest";
import { defaultShoppingState, loadShoppingState, saveShoppingState, STORAGE_KEY } from "./persistence";

describe("shopping-state persistence", () => {
  it("round-trips versioned state", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    const state = { ...defaultShoppingState(), selectedStoreId: "store-2751" };
    saveShoppingState(storage, state);
    expect(loadShoppingState(storage)).toEqual(state);
  });

  it("falls back safely for incompatible state", () => {
    const storage = { getItem: (key: string) => key === STORAGE_KEY ? JSON.stringify({ version: 999 }) : null };
    expect(loadShoppingState(storage)).toEqual(defaultShoppingState());
  });
});
