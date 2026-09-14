import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalRecommendationAnchorPage =
  | "home"
  | "search"
  | "launcher";

export type PortalRecommendationTargetKind =
  | "page"
  | "os"
  | "auth"
  | "launcher"
  | "admin";

export type PortalRecommendationAudience =
  | "public"
  | "member"
  | "operator";

export type PortalRecommendationVisibility =
  | "visible"
  | "hidden";

export type PortalRecommendationRule = {
  id: string;
  code: string;
  anchorPage: PortalRecommendationAnchorPage;
  targetKind: PortalRecommendationTargetKind;
  title: string;
  summary: string;
  href: string;
  audience: PortalRecommendationAudience;
  keywords: string[];
  featured: boolean;
  priority: number;
  visibility: PortalRecommendationVisibility;
  lastUpdatedAt: string;
};

export type PortalResolvedRecommendationItem = PortalRecommendationRule & {
  reason: string;
  score: number;
};

export type PortalPublicRecommendationResolveRequest = {
  anchorPage: PortalRecommendationAnchorPage;
  query?: string;
  session: PortalSessionSummary;
  limit: number;
};

export type PortalPublicRecommendationResolveResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalResolvedRecommendationItem[];
  };
};

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
  anchorPage: PortalRecommendationAnchorPage;
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
