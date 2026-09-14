import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalNavigationPlacement =
  | "header"
  | "footer"
  | "launcher"
  | "admin";

export type PortalNavigationAudience =
  | "public"
  | "member"
  | "operator";

export type PortalNavigationVisibility =
  | "visible"
  | "hidden";

export type PortalPageManifestItem = {
  id: string;
  code: string;
  title: string;
  href: string;
  placement: PortalNavigationPlacement;
  audience: PortalNavigationAudience;
  visibility: PortalNavigationVisibility;
  sortOrder: number;
  description: string;
  requiresLogin: boolean;
  operatorOnly: boolean;
  lastUpdatedAt: string;
};

export type PortalPublicNavigationManifestListRequest = {
  placement: PortalNavigationPlacement | "all";
};

export type PortalPublicNavigationManifestListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalPageManifestItem[];
  };
};

export type PortalPublicMenuResolveRequest = {
  placement: "header" | "footer";
  session: PortalSessionSummary;
};

export type PortalPublicMenuResolveResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalPageManifestItem[];
  };
};

export type PortalAdminNavigationManifestListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminNavigationManifestListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalPageManifestItem[];
  };
};

export type PortalAdminNavigationManifestUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  title: string;
  href: string;
  placement: PortalNavigationPlacement;
  audience: PortalNavigationAudience;
  visibility: PortalNavigationVisibility;
  sortOrder: number;
  description: string;
  requiresLogin: boolean;
  operatorOnly: boolean;
};

export type PortalAdminNavigationManifestUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalPageManifestItem;
  };
};
