import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const styles = readFileSync(new URL("./styles.css", import.meta.url), "utf8");

describe("responsive UI contract", () => {
  it("retains mobile, tablet, and desktop layout rules", () => {
    expect(styles).toContain("@media (max-width: 420px)");
    expect(styles).toContain("@media (max-width: 680px)");
    expect(styles).toContain("@media (max-width: 780px)");
    expect(styles).toContain("min-width: 320px");
  });

  it("keeps mobile interaction and overflow safeguards", () => {
    expect(styles).toContain("min-height: 44px");
    expect(styles).toContain("overflow-x: auto");
    expect(styles).toContain(".product-grid { grid-template-columns: 1fr;");
    expect(styles).not.toContain(".route-map { overflow-x: auto;");
  });
});
