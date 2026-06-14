// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import axe from "axe-core";
import App from "./App";

afterEach(cleanup);

describe("accessibility", () => {
  it("has no automatically detectable critical or serious violations", async () => {
    render(<App />);
    const results = await axe.run(document.body, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
    const highImpact = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
    expect(highImpact).toEqual([]);
  });
});
