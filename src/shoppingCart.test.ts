import { describe, expect, it } from "vitest";
import { products } from "./data/fixtures";
import {
  activeLines,
  addProduct,
  clearActiveCart,
  emptyShoppingCart,
  moveToCart,
  removeLine,
  saveForLater,
  savedLines,
  setCartOrdering,
  toRouteCart,
  updateQuantity,
} from "./shoppingCart";

describe("shopping cart", () => {
  it("adds products and increments existing quantities", () => {
    const once = addProduct(emptyShoppingCart(), products[0], "2026-01-01");
    const twice = addProduct(once, products[0], "2026-01-02");
    expect(twice.lines).toHaveLength(1);
    expect(twice.lines[0].quantity).toBe(2);
  });

  it("supports quantity, remove, save, restore, and clear actions", () => {
    let cart = addProduct(addProduct(emptyShoppingCart(), products[0]), products[1]);
    cart = updateQuantity(cart, "line-bananas", 3);
    cart = saveForLater(cart, "line-bananas");
    expect(savedLines(cart)).toHaveLength(1);
    cart = moveToCart(cart, "line-bananas");
    expect(activeLines(cart)).toHaveLength(2);
    cart = removeLine(cart, "line-pasta");
    expect(cart.lines).toHaveLength(1);
    expect(clearActiveCart(cart).lines).toHaveLength(0);
  });

  it("creates route input from active lines only", () => {
    let cart = addProduct(addProduct(emptyShoppingCart(), products[0]), products[1]);
    cart = saveForLater(cart, "line-pasta");
    cart = setCartOrdering(cart, "added-order");
    expect(toRouteCart(cart).lines).toEqual([{ productId: "bananas", quantity: 1 }]);
    expect(cart.ordering).toBe("added-order");
  });
});
