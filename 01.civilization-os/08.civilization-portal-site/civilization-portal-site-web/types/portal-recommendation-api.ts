import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalRecommendationAudience = "public" | "member" | "operator";
export type PortalRecommendationTargetKind =
  | "page"
  | "os"
  | "auth"
  | "launcher"
  | "admin";

export type PortalRecommendationAnchorPage = string;
export type PortalRecommendationVisibility = "visible" | "hidden";

export type PortalRecommendationRule = {
  id: string;
  code: string;
  anchorPage: string;
  targetKind: PortalRecommendationTargetKind;
  title: string;
  summary: string;
  href: string;
  audience: PortalRecommendationAudience;
  keywords: string[];
  featured: boolean;
  priority: number;
  visibility: "visible" | "hidden";
  lastUpdatedAt: string;
};

export type PortalResolvedRecommendationItem = {
  code: string;
  targetKind: PortalRecommendationTargetKind;
  title: string;
  summary: string;
  href: string;
  featured: boolean;
  priority: number;
};

export type PortalRecommendationResolveRequest = {
  anchorPage: string;
  session: PortalSessionSummary;
  limit: number;
  query?: string;
};

export type PortalRecommendationResolveResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalResolvedRecommendationItem[];
  };
};

export type PortalPublicRecommendationResolveRequest = PortalRecommendationResolveRequest;
export type PortalPublicRecommendationResolveResponse = PortalRecommendationResolveResponse;

export type PortalAdminRecommendationRuleListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminRecommendationRuleListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalRecommendationRule[];
  };
};

export type PortalAdminRecommendationRuleUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  anchorPage: string;
  targetKind: PortalRecommendationTargetKind;
  title: string;
  summary: string;
  href: string;
  audience: PortalRecommendationAudience;
  keywords: string[];
  featured: boolean;
  priority: number;
  visibility: PortalRecommendationVisibility;
};

export type PortalAdminRecommendationRuleUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalRecommendationRule;
  };
};
