import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAnalyticsAction,
  PortalAnalyticsActorType,
  PortalAnalyticsEventItem,
  PortalAnalyticsMetricItem,
  PortalAnalyticsSurface,
  PortalAnalyticsTargetKind,
} from "../../types/portal-analytics-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let analyticsEvents: PortalAnalyticsEventItem[] = [];

const deriveActorType = (session: PortalSessionSummary): PortalAnalyticsActorType => {
  if (
    session.isLoggedIn &&
    session.entityType === "human" &&
    session.contractTier === "business" &&
    session.affiliations.includes("operator")
  ) {
    return "operator";
  }

  if (session.isLoggedIn) {
    return "member";
  }

  return "guest";
};

const deriveActorKey = (session: PortalSessionSummary): string => {
  if (session.isLoggedIn && session.civilizationUserId) {
    return session.civilizationUserId;
  }

  return `guest:${session.region || "unknown"}:${session.entityType || "guest"}`;
};

const sortMetrics = (items: PortalAnalyticsMetricItem[]): PortalAnalyticsMetricItem[] =>
  [...items].sort((a, b) => {
    if (a.count !== b.count) {
      return b.count - a.count;
    }
    return a.key.localeCompare(b.key);
  });

const sortRecentEvents = (items: PortalAnalyticsEventItem[]): PortalAnalyticsEventItem[] =>
  [...items].sort((a, b) => {
    if (a.occurredAt < b.occurredAt) return 1;
    if (a.occurredAt > b.occurredAt) return -1;
    return a.targetTitle.localeCompare(b.targetTitle);
  });

const buildMetricItems = (values: string[]): PortalAnalyticsMetricItem[] => {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return sortMetrics(
    Array.from(counts.entries()).map(([key, count]) => ({
      key,
      count,
    })),
  );
};

export const appendAnalyticsEvent = (input: {
  session: PortalSessionSummary;
  surface: PortalAnalyticsSurface;
  action: PortalAnalyticsAction;
  targetCode: string;
  targetTitle: string;
  targetKind: PortalAnalyticsTargetKind;
  metadata?: string;
}): PortalAnalyticsEventItem => {
  const item: PortalAnalyticsEventItem = {
    id: crypto.randomUUID(),
    actorType: deriveActorType(input.session),
    actorKey: deriveActorKey(input.session),
    surface: input.surface,
    action: input.action,
    targetCode: input.targetCode,
    targetTitle: input.targetTitle,
    targetKind: input.targetKind,
    metadata: input.metadata || undefined,
    occurredAt: nowIso(),
  };

  analyticsEvents = [item, ...analyticsEvents].slice(0, 1000);
  return clone(item);
};

export const getAnalyticsReport = (input: {
  rangeDays: number;
  limit: number;
}): {
  summary: {
    rangeDays: number;
    totalEvents: number;
    uniqueActors: number;
  };
  bySurface: PortalAnalyticsMetricItem[];
  byAction: PortalAnalyticsMetricItem[];
  byTargetKind: PortalAnalyticsMetricItem[];
  recentEvents: PortalAnalyticsEventItem[];
} => {
  const cutoff = Date.now() - input.rangeDays * 24 * 60 * 60 * 1000;

  const filtered = analyticsEvents.filter((item) => {
    const occurredAtMs = Date.parse(item.occurredAt);
    if (Number.isNaN(occurredAtMs)) {
      return false;
    }
    return occurredAtMs >= cutoff;
  });

  const uniqueActors = new Set(filtered.map((item) => item.actorKey)).size;

  return {
    summary: {
      rangeDays: input.rangeDays,
      totalEvents: filtered.length,
      uniqueActors,
    },
    bySurface: buildMetricItems(filtered.map((item) => item.surface)),
    byAction: buildMetricItems(filtered.map((item) => item.action)),
    byTargetKind: buildMetricItems(filtered.map((item) => item.targetKind)),
    recentEvents: clone(sortRecentEvents(filtered).slice(0, input.limit)),
  };
};
