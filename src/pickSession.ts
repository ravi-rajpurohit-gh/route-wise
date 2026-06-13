import type { ResolvedPickItem } from "./domain";

export type PickItemStatus = "pending" | "picked" | "skipped";

export type PickSession = {
  active: boolean;
  currentNodeId: string;
  statuses: Record<string, PickItemStatus>;
};

export function createPickSession(items: ResolvedPickItem[], startNodeId: string): PickSession {
  return {
    active: false,
    currentNodeId: startNodeId,
    statuses: Object.fromEntries(items.map((item) => [item.productId, "pending"])),
  };
}

export function startPickSession(session: PickSession): PickSession {
  return { ...session, active: true };
}

export function markItemPicked(session: PickSession, item: ResolvedPickItem): PickSession {
  return {
    ...session,
    active: true,
    currentNodeId: item.nodeId,
    statuses: { ...session.statuses, [item.productId]: "picked" },
  };
}

export function markItemSkipped(session: PickSession, item: ResolvedPickItem): PickSession {
  return {
    ...session,
    active: true,
    statuses: { ...session.statuses, [item.productId]: "skipped" },
  };
}

export function pendingItems(session: PickSession, items: ResolvedPickItem[]): ResolvedPickItem[] {
  return items.filter((item) => session.statuses[item.productId] === "pending");
}

export function completedCount(session: PickSession): number {
  return Object.values(session.statuses).filter((status) => status !== "pending").length;
}
