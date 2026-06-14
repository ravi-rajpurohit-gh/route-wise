import type { ResolvedPickItem } from "./domain";

export type PickItemStatus = "pending" | "picked" | "skipped";

export type PickAction = {
  productId: string;
  previousStatus: PickItemStatus;
  previousNodeId: string;
  status: Exclude<PickItemStatus, "pending">;
};

export type PickSession = {
  active: boolean;
  currentNodeId: string;
  statuses: Record<string, PickItemStatus>;
  history: PickAction[];
};

export function createPickSession(items: ResolvedPickItem[], startNodeId: string): PickSession {
  return {
    active: false,
    currentNodeId: startNodeId,
    statuses: Object.fromEntries(items.map((item) => [item.productId, "pending"])),
    history: [],
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
    history: [...session.history, { productId: item.productId, previousStatus: session.statuses[item.productId], previousNodeId: session.currentNodeId, status: "picked" }],
  };
}

export function markItemSkipped(session: PickSession, item: ResolvedPickItem): PickSession {
  return {
    ...session,
    active: true,
    statuses: { ...session.statuses, [item.productId]: "skipped" },
    history: [...session.history, { productId: item.productId, previousStatus: session.statuses[item.productId], previousNodeId: session.currentNodeId, status: "skipped" }],
  };
}

export function undoLastAction(session: PickSession): PickSession {
  const action = session.history[session.history.length - 1];
  if (!action) return session;
  return {
    ...session,
    currentNodeId: action.previousNodeId,
    statuses: { ...session.statuses, [action.productId]: action.previousStatus },
    history: session.history.slice(0, -1),
  };
}

export function pendingItems(session: PickSession, items: ResolvedPickItem[]): ResolvedPickItem[] {
  return items.filter((item) => session.statuses[item.productId] === "pending");
}

export function completedCount(session: PickSession): number {
  return Object.values(session.statuses).filter((status) => status !== "pending").length;
}
