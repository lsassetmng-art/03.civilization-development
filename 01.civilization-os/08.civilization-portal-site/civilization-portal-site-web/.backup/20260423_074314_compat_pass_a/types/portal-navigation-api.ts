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
