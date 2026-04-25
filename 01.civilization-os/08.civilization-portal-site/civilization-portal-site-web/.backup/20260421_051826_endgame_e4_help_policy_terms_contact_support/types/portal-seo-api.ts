import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalSeoPageCode = "home" | "civilization" | "guide";
export type PortalStructuredPageType = "WebPage" | "AboutPage" | "HowToPage";

export type PortalSeoPageDescriptor = {
  id: string;
  pageCode: PortalSeoPageCode;
  pageTitle: string;
  metaDescription: string;
  canonicalPath: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageAssetCode?: string;
  structuredType: PortalStructuredPageType;
  structuredName: string;
  structuredDescription: string;
  lastUpdatedAt: string;
};

export type PortalPublicSeoPageGetRequest = {
  pageCode: PortalSeoPageCode;
};

export type PortalPublicSeoPageGetResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalSeoPageDescriptor;
  };
};

export type PortalAdminSeoPageListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminSeoPageListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalSeoPageDescriptor[];
  };
};

export type PortalAdminSeoPageUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  pageCode: PortalSeoPageCode;
  pageTitle: string;
  metaDescription: string;
  canonicalPath: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageAssetCode?: string;
  structuredType: PortalStructuredPageType;
  structuredName: string;
  structuredDescription: string;
};

export type PortalAdminSeoPageUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalSeoPageDescriptor;
  };
};
