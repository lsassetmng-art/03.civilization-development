import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalSearchIndexKind =
  | "page"
  | "os"
  | "auth"
  | "launcher"
  | "admin";

export type PortalSearchIndexVisibility = "public" | "admin";

export type PortalSearchIndexItem = {
  id: string;
  code: string;
  kind: PortalSearchIndexKind;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
  visibility: PortalSearchIndexVisibility;
  sortOrder: number;
  lastUpdatedAt: string;
};

export type PortalSearchResultItem = PortalSearchIndexItem & {
  score: number;
  matchedTerms: string[];
};

export type PortalPublicSearchQueryRequest = {
  query: string;
  limit: number;
};

export type PortalPublicSearchQueryResponse = {
  meta: PortalApiMeta;
  data: {
    normalizedQuery: string;
    items: PortalSearchResultItem[];
  };
};

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
  kind: PortalSearchIndexKind;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
  visibility: PortalSearchIndexVisibility;
  sortOrder: number;
};

export type PortalAdminSearchIndexUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalSearchIndexItem;
  };
};
