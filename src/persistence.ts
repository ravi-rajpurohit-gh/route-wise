import type { ShoppingCart } from "./shoppingCart";
import { emptyShoppingCart } from "./shoppingCart";

export const STORAGE_KEY = "routewise.shopping-state";
export const STORAGE_VERSION = 1;

export type PersistedShoppingState = {
  version: number;
  selectedStoreId: string;
  cart: ShoppingCart;
};

export const defaultShoppingState = (): PersistedShoppingState => ({
  version: STORAGE_VERSION,
  selectedStoreId: "store-1842",
  cart: emptyShoppingCart(),
});

export function loadShoppingState(storage: Pick<Storage, "getItem">): PersistedShoppingState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return defaultShoppingState();
    const parsed = JSON.parse(raw) as PersistedShoppingState;
    if (parsed.version !== STORAGE_VERSION || !parsed.cart || !parsed.selectedStoreId) return defaultShoppingState();
    return parsed;
  } catch {
    return defaultShoppingState();
  }
}

export function saveShoppingState(storage: Pick<Storage, "setItem">, state: PersistedShoppingState): void {
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: STORAGE_VERSION }));
}
