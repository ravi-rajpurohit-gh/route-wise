import { describe, expect, it } from "vitest";
import type { ResolvedPickItem } from "./domain";
import {
  completedCount,
  createPickSession,
  markItemPicked,
  markItemSkipped,
  pendingItems,
  startPickSession,
  undoLastAction,
} from "./pickSession";

const items: ResolvedPickItem[] = [
  { productId: "a", name: "A", category: "Test", handling: "ambient", quantity: 1, nodeId: "entry:a", aisleLabel: "A1" },
  { productId: "b", name: "B", category: "Test", handling: "ambient", quantity: 1, nodeId: "entry:b", aisleLabel: "A2" },
];

describe("pick session", () => {
  it("starts with every resolved item pending", () => {
    const session = createPickSession(items, "entry");
    expect(session.active).toBe(false);
    expect(pendingItems(session, items)).toEqual(items);
    expect(completedCount(session)).toBe(0);
  });

  it("moves current location when an item is picked", () => {
    const session = markItemPicked(startPickSession(createPickSession(items, "entry")), items[0]);
    expect(session.currentNodeId).toBe(items[0].nodeId);
    expect(session.statuses.a).toBe("picked");
  });

  it("does not move current location when an item is skipped", () => {
    const session = markItemSkipped(startPickSession(createPickSession(items, "entry")), items[0]);
    expect(session.currentNodeId).toBe("entry");
    expect(session.statuses.a).toBe("skipped");
    expect(pendingItems(session, items)).toEqual([items[1]]);
  });

  it("undoes the last picked or cannot-find action and restores location", () => {
    const started = startPickSession(createPickSession(items, "entry"));
    const picked = markItemPicked(started, items[0]);
    const skipped = markItemSkipped(picked, items[1]);
    const undoSkipped = undoLastAction(skipped);
    expect(undoSkipped.statuses.b).toBe("pending");
    expect(undoSkipped.currentNodeId).toBe(items[0].nodeId);
    const undoPicked = undoLastAction(undoSkipped);
    expect(undoPicked.statuses.a).toBe("pending");
    expect(undoPicked.currentNodeId).toBe("entry");
  });
});
