// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
    await user.click(screen.getByRole("button", { name: "Add" }));
    await navigateTo(user, "Cart");
    expect(await screen.findByText("Organic Bananas")).toBeTruthy();
  });

  it("supports quantity and save-for-later actions", async () => {
    const user = userEvent.setup();
    render(<App />);
    await navigateTo(user, "Search");
    await user.click((await screen.findAllByRole("button", { name: "Add" }))[0]);
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
    await user.click((await screen.findAllByRole("button", { name: "Add" }))[0]);
    await waitFor(() => expect(localStorage.getItem("routewise.shopping-state")).toContain("store-2751"));
    first.unmount();
    render(<App />);
    expect((await screen.findByLabelText("Store") as HTMLSelectElement).value).toBe("store-2751");
    expect(await screen.findByText("1 active items")).toBeTruthy();
  });
});

function productsFirstName() {
  return "Organic Bananas";
}
