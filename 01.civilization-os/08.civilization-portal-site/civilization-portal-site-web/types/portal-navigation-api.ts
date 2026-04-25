import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalNavigationPlacement = "header" | "footer";
export type PortalNavigationAudience = "public" | "member" | "operator";

export type PortalPageManifestItem = {
  id: string;
  code: string;
  title: string;
  href: string;
  placement: PortalNavigationPlacement;
  audience: PortalNavigationAudience;
  visibility: "visible" | "hidden";
  sortOrder: number;
  description: string;
  requiresLogin: boolean;
  operatorOnly: boolean;
  lastUpdatedAt: string;
};

export type PortalNavigationMenuResolveRequest = {
  placement: PortalNavigationPlacement;
  session: PortalSessionSummary;
};

export type PortalNavigationMenuResolveResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalPageManifestItem[];
  };
};

export type PortalPublicNavigationManifestListRequest = {
  placement?: PortalNavigationPlacement | "all";
  session?: PortalSessionSummary;
};

export type PortalPublicNavigationManifestListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalPageManifestItem[];
  };
};

export type PortalPublicMenuResolveRequest = PortalNavigationMenuResolveRequest;
export type PortalPublicMenuResolveResponse = PortalNavigationMenuResolveResponse;

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
  visibility: "visible" | "hidden";
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
