// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("mobile shopping journey", () => {
  const navigateTo = async (user: ReturnType<typeof userEvent.setup>, tab: string) => {
    const navigation = await screen.findByRole("navigation", { name: "Primary navigation" });
    await user.click(within(navigation).getByRole("button", { name: tab }));
  };

  it("searches and adds a product to the cart", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.type(screen.getByLabelText("Search products"), "banana");
    await user.click(screen.getByRole("button", { name: "Add Organic Bananas" }));
    await navigateTo(user, "Cart");
    expect(await screen.findByText("Organic Bananas")).toBeTruthy();
  });

  it("supports quantity and save-for-later actions", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.click((await screen.findAllByRole("button", { name: /^Add / }))[0]);
    await navigateTo(user, "Cart");
    const name = productsFirstName();
    await user.click(screen.getByLabelText(`Increase ${name}`));
    await user.click(screen.getByLabelText(`More actions for ${name}`));
    await user.click(screen.getByRole("button", { name: "Save for later" }));
    expect(await screen.findByText("Saved for later")).toBeTruthy();
  });

  it("persists cart and store selection on the current device", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.selectOptions(await screen.findByLabelText("Store"), "store-2751");
    await navigateTo(user, "Search");
    await user.click((await screen.findAllByRole("button", { name: /^Add / }))[0]);
    await waitFor(() => expect(localStorage.getItem("routewise.shopping-state")).toContain("store-2751"));
    first.unmount();
    render(<App />);
    expect((await screen.findByLabelText("Store") as HTMLSelectElement).value).toBe("store-2751");
    expect(await screen.findByText("1 item ready to plan")).toBeTruthy();
  });

  it("confirms before clearing active cart items", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<App />);
    await navigateTo(user, "Search");
    await user.click((await screen.findAllByRole("button", { name: /^Add / }))[0]);
    await navigateTo(user, "Cart");
    await user.click(screen.getByRole("button", { name: "Clear cart" }));
    expect(await screen.findByText("Organic Bananas")).toBeTruthy();
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Clear cart" }));
    expect(await screen.findByText("0 items")).toBeTruthy();
    confirm.mockRestore();
  });

  it("explains the product problem, method, evidence, and limitations", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "About");
    expect(await screen.findByText("Location is not sequence")).toBeTruthy();
    expect(screen.getByText("From cart to route")).toBeTruthy();
    expect(screen.getByText("Transparent comparison")).toBeTruthy();
    expect(screen.getByText(/not guaranteed to be globally optimal/)).toBeTruthy();
  });

  it("shows an empty search result and a completed shopping state", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.type(screen.getByLabelText("Search products"), "not in catalog");
    expect(await screen.findByText("No products found")).toBeTruthy();
    await user.clear(screen.getByLabelText("Search products"));
    await user.type(screen.getByLabelText("Search products"), "banana");
    await user.click(screen.getByRole("button", { name: "Add Organic Bananas" }));
    await navigateTo(user, "Route");
    await user.click(await screen.findByRole("button", { name: "Start shopping" }));
    await user.click(await screen.findByRole("button", { name: "Mark picked" }));
    expect(await screen.findByText("All route items are resolved")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByRole("button", { name: "Mark picked" })).toBeTruthy();
  });

  it("renders a customer-friendly store map with landmarks and a legend", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.click(screen.getByRole("button", { name: "Add Organic Bananas" }));
    await navigateTo(user, "Route");
    expect(await screen.findByText("Store map")).toBeTruthy();
    expect(screen.getByText("Your route")).toBeTruthy();
    expect(screen.getByText("Pick stop")).toBeTruthy();
    expect(screen.getByText(/Stop numbers stay fixed throughout the trip/)).toBeTruthy();
  });

  it("shows inline product quantities and updates them from search", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.click(screen.getByRole("button", { name: "Add Organic Bananas" }));
    expect(screen.getByLabelText("Organic Bananas quantity")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Increase Organic Bananas" }));
    await navigateTo(user, "Cart");
    expect(within(screen.getByLabelText("Organic Bananas quantity")).getByText("2")).toBeTruthy();
  });

  it("reorders visible cart items when shopping order changes", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.click(screen.getByRole("button", { name: "Add Laundry Detergent" }));
    await user.click(screen.getByRole("button", { name: "Add Penne Pasta" }));
    await navigateTo(user, "Cart");
    await user.selectOptions(screen.getByLabelText("Shopping order"), "aisle-order");
    const cartItems = screen.getByLabelText("Cart items");
    await waitFor(() => expect(cartItems.textContent?.indexOf("Penne Pasta")).toBeLessThan(cartItems.textContent?.indexOf("Laundry Detergent") ?? 0));
  });

  it("keeps original stop numbers and fixed store landmarks after an action", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.click(screen.getByRole("button", { name: "Add Organic Bananas" }));
    await user.click(screen.getByRole("button", { name: "Add Penne Pasta" }));
    await navigateTo(user, "Route");
    await user.click(screen.getByRole("button", { name: "Start shopping" }));
    const routeMap = screen.getByRole("img", { name: /Shopping route through/ });
    expect(within(routeMap).getByText("IN")).toBeTruthy();
    expect(within(routeMap).getByText("OUT")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Mark picked" }));
    expect(screen.getByText("Stop 2 · A08")).toBeTruthy();
    expect(within(routeMap).getByText("2")).toBeTruthy();
    expect(within(routeMap).getByText("IN")).toBeTruthy();
    expect(within(routeMap).getByText("OUT")).toBeTruthy();
  });
});

function productsFirstName() {
  return "Organic Bananas";
}
