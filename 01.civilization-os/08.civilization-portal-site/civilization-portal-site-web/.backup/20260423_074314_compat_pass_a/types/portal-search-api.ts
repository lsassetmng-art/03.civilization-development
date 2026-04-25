import type { PortalApiMeta } from "./portal-api";

export type PortalSearchVisibility = "public" | "admin";
export type PortalSearchKind =
  | "page"
  | "os"
  | "auth"
  | "launcher"
  | "admin"
  | "search";

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
