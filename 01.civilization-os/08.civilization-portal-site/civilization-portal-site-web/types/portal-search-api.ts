import type { PortalApiMeta } from "./portal-api";
import type { PortalSessionSummary } from "./auth";

export type PortalSearchVisibility = "public" | "admin";
export type PortalSearchKind =
  | "page"
  | "os"
  | "auth"
  | "launcher"
  | "admin"
  | "search";

export type PortalSearchIndexKind = PortalSearchKind;
export type PortalSearchIndexVisibility = PortalSearchVisibility;

export type PortalSearchIndexItem = {
  id: string;
  code: string;
  kind: PortalSearchKind;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
  visibility: PortalSearchVisibility;
  sortOrder: number;
  lastUpdatedAt: string;
};

export type PortalSearchResultItem = PortalSearchIndexItem & {
  score?: number;
};

export type PortalSearchQueryRequest = {
  query: string;
  limit: number;
};

export type PortalSearchQueryResponse = {
  meta: PortalApiMeta;
  data: {
    normalizedQuery: string;
    items: PortalSearchResultItem[];
  };
};

export type PortalPublicSearchQueryRequest = PortalSearchQueryRequest;
export type PortalPublicSearchQueryResponse = PortalSearchQueryResponse;

export type PortalAdminSearchIndexListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminSearchIndexListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalSearchIndexItem[];
  };
};

export type PortalAdminSearchIndexUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  kind: PortalSearchKind;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
  visibility: PortalSearchVisibility;
  sortOrder: number;
};

export type PortalAdminSearchIndexUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalSearchIndexItem;
  };
};
