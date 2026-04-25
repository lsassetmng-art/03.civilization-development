import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalAnalyticsSurface =
  | "home"
  | "search"
  | "launcher"
  | "os-detail"
  | "admin";

export type PortalAnalyticsAction =
  | "page_view"
  | "search_query"
  | "open_target"
  | "save_shortcut"
  | "save_favorite"
  | "ack_announcement"
  | "save_profile_settings";

export type PortalAnalyticsTargetKind =
  | "page"
  | "os"
  | "auth"
  | "launcher"
  | "admin"
  | "search";

export type PortalAnalyticsActorType =
  | "guest"
  | "member"
  | "operator";

export type PortalAnalyticsEventItem = {
  id: string;
  actorType: PortalAnalyticsActorType;
  actorKey: string;
  surface: PortalAnalyticsSurface;
  action: PortalAnalyticsAction;
  targetCode: string;
  targetTitle: string;
  targetKind: PortalAnalyticsTargetKind;
  metadata?: string;
  occurredAt: string;
};

export type PortalAnalyticsMetricItem = {
  key: string;
  count: number;
};

export type PortalAnalyticsReportSummary = {
  rangeDays: number;
  totalEvents: number;
  uniqueActors: number;
};

export type PortalPublicAnalyticsEventAppendRequest = {
  session: PortalSessionSummary;
  surface: PortalAnalyticsSurface;
  action: PortalAnalyticsAction;
  targetCode: string;
  targetTitle: string;
  targetKind: PortalAnalyticsTargetKind;
  metadata?: string;
};

export type PortalPublicAnalyticsEventAppendResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalAnalyticsEventItem;
  };
};

export type PortalAdminAnalyticsReportGetRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  rangeDays: number;
  limit: number;
};

export type PortalAdminAnalyticsReportGetResponse = {
  meta: PortalApiMeta;
  data: {
    summary: PortalAnalyticsReportSummary;
    bySurface: PortalAnalyticsMetricItem[];
    byAction: PortalAnalyticsMetricItem[];
    byTargetKind: PortalAnalyticsMetricItem[];
    recentEvents: PortalAnalyticsEventItem[];
  };
};
