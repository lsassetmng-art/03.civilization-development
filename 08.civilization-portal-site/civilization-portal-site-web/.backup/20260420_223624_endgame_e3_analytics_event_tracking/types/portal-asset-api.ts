import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalAssetKind = "image" | "file";
export type PortalAssetVisibility = "public" | "admin";
export type PortalAssetUsageScope = "cms";

export type PortalAssetManifestItem = {
  id: string;
  code: string;
  kind: PortalAssetKind;
  title: string;
  description: string;
  sourceUrl: string;
  altText?: string;
  fileLabel?: string;
  mimeType?: string;
  visibility: PortalAssetVisibility;
  usageScope: PortalAssetUsageScope;
  sortOrder: number;
  lastUpdatedAt: string;
};

export type PortalPublicAssetManifestListRequest = {
  usageScope: PortalAssetUsageScope;
};

export type PortalPublicAssetManifestListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalAssetManifestItem[];
  };
};

export type PortalAdminAssetManifestListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminAssetManifestListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalAssetManifestItem[];
  };
};

export type PortalAdminAssetManifestUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  kind: PortalAssetKind;
  title: string;
  description: string;
  sourceUrl: string;
  altText?: string;
  fileLabel?: string;
  mimeType?: string;
  visibility: PortalAssetVisibility;
  usageScope: PortalAssetUsageScope;
  sortOrder: number;
};

export type PortalAdminAssetManifestUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalAssetManifestItem;
  };
};
