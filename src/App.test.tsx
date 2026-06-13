// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

afterEach(cleanup);

describe("guided pick workflow", () => {
  it("changes stores and displays unavailable items", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("heading", { name: "Supercenter #1842" });
    await user.selectOptions(screen.getByLabelText("Store"), "store-4103");

    await screen.findByRole("heading", { name: "Neighborhood Market #4103" });
    expect(screen.getByText("Ground Coffee")).toBeTruthy();
    expect(screen.getByText("unavailable")).toBeTruthy();
  });

  it("starts a session and marks an item picked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Start picking" }));
    const pickedActions = await screen.findAllByRole("button", { name: "Picked" });
    await user.click(pickedActions[0]);

    await waitFor(() => expect(screen.getByText("1 of 7 items handled")).toBeTruthy());
    expect(screen.getByRole("button", { name: "Reset pick session" })).toBeTruthy();
  });

  it("skips an item and resets progress when the store changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Start picking" }));
    const skipActions = await screen.findAllByRole("button", { name: "Skip" });
    await user.click(skipActions[0]);
    await waitFor(() => expect(screen.getByText("1 of 7 items handled")).toBeTruthy());

    await user.selectOptions(screen.getByLabelText("Store"), "store-2751");
    await waitFor(() => expect(screen.getByText("0 of 7 items handled")).toBeTruthy());
    expect(screen.getByRole("button", { name: "Start picking" })).toBeTruthy();
  });
});
