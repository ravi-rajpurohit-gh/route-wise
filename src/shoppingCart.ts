import type { Cart, Product } from "./domain";

export type CartLineState = "active" | "saved-for-later";
export type CartOrdering = "added-order" | "aisle-order" | "recommended";

export type ShoppingCartLine = {
  id: string;
  productId: string;
  quantity: number;
  addedAt: string;
  state: CartLineState;
};

export type ShoppingCart = {
  id: string;
  lines: ShoppingCartLine[];
  ordering: CartOrdering;
};

export const emptyShoppingCart = (): ShoppingCart => ({
  id: "current-cart",
  lines: [],
  ordering: "recommended",
});

export function addProduct(cart: ShoppingCart, product: Product, now = new Date().toISOString()): ShoppingCart {
  const existing = cart.lines.find((line) => line.productId === product.id);
  if (existing) return updateQuantity(moveToCart(cart, existing.id), existing.id, existing.quantity + 1);
  return {
    ...cart,
    lines: [...cart.lines, { id: `line-${product.id}`, productId: product.id, quantity: 1, addedAt: now, state: "active" }],
  };
}

export function updateQuantity(cart: ShoppingCart, lineId: string, quantity: number): ShoppingCart {
  if (quantity <= 0) return removeLine(cart, lineId);
  return { ...cart, lines: cart.lines.map((line) => line.id === lineId ? { ...line, quantity } : line) };
}

export function removeLine(cart: ShoppingCart, lineId: string): ShoppingCart {
  return { ...cart, lines: cart.lines.filter((line) => line.id !== lineId) };
}

export function saveForLater(cart: ShoppingCart, lineId: string): ShoppingCart {
  return { ...cart, lines: cart.lines.map((line) => line.id === lineId ? { ...line, state: "saved-for-later" } : line) };
}

export function moveToCart(cart: ShoppingCart, lineId: string): ShoppingCart {
  return { ...cart, lines: cart.lines.map((line) => line.id === lineId ? { ...line, state: "active" } : line) };
}

export function clearActiveCart(cart: ShoppingCart): ShoppingCart {
  return { ...cart, lines: cart.lines.filter((line) => line.state !== "active") };
}

export function setCartOrdering(cart: ShoppingCart, ordering: CartOrdering): ShoppingCart {
  return { ...cart, ordering };
}

export function activeLines(cart: ShoppingCart): ShoppingCartLine[] {
  return cart.lines.filter((line) => line.state === "active");
}

export function savedLines(cart: ShoppingCart): ShoppingCartLine[] {
  return cart.lines.filter((line) => line.state === "saved-for-later");
}

export function toRouteCart(cart: ShoppingCart): Cart {
  return {
    id: cart.id,
    lines: activeLines(cart).map(({ productId, quantity }) => ({ productId, quantity })),
  };
}
