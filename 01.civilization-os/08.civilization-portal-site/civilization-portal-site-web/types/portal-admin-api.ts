import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalNoticeLevel = "info" | "warning" | "success";
export type PortalNoticeVisibility = "public" | "member" | "operator";
export type PortalContentVisibility = PortalNoticeVisibility;

export type PortalNoticeItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: PortalNoticeLevel;
  visibility: PortalNoticeVisibility;
  publishedOn: string;
  lastUpdatedAt: string;
};

export type PortalListingItem = {
  id: string;
  code: string;
  title: string;
  summary: string;
  href: string;
  visibility: PortalContentVisibility;
  sortOrder: number;
  lastUpdatedAt: string;
};

export type PortalMaintenanceItem = {
  id: string;
  code: string;
  title: string;
  summary: string;
  status: "scheduled" | "active" | "resolved";
  visibility: PortalContentVisibility;
  startsAt?: string;
  endsAt?: string;
  lastUpdatedAt: string;
};

export type PortalCmsPageItem = {
  id: string;
  slug: string;
  title: string;
  body: string;
  summary: string;
  visibility: PortalContentVisibility;
  lastUpdatedAt: string;
};

export type PortalAssetManifestItem = {
  id: string;
  code: string;
  title: string;
  href: string;
  assetType: "image" | "document" | "other";
  visibility: PortalContentVisibility;
  lastUpdatedAt: string;
};

export type PortalSeoPageItem = {
  id: string;
  path: string;
  title: string;
  description: string;
  noindex: boolean;
  lastUpdatedAt: string;
};

export type PortalPublicListingListRequest = {
  session?: PortalSessionSummary;
};

export type PortalPublicListingListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalListingItem[] };
};

export type PortalAdminListingListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminListingListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalListingItem[] };
};

export type PortalAdminListingUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  title: string;
  summary: string;
  href: string;
  visibility: PortalContentVisibility;
  sortOrder: number;
};

export type PortalAdminListingUpsertResponse = {
  meta: PortalApiMeta;
  data: { item: PortalListingItem };
};

export type PortalPublicMaintenanceListRequest = {
  session?: PortalSessionSummary;
};

export type PortalPublicMaintenanceListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalMaintenanceItem[] };
};

export type PortalAdminMaintenanceListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminMaintenanceListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalMaintenanceItem[] };
};

export type PortalAdminMaintenanceUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  title: string;
  summary: string;
  status: "scheduled" | "active" | "resolved";
  visibility: PortalContentVisibility;
  startsAt?: string;
  endsAt?: string;
};

export type PortalAdminMaintenanceUpsertResponse = {
  meta: PortalApiMeta;
  data: { item: PortalMaintenanceItem };
};

export type PortalPublicNoticesListRequest = {
  session?: PortalSessionSummary;
};

export type PortalPublicNoticesListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalNoticeItem[] };
};

export type PortalAdminNoticesListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminNoticesListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalNoticeItem[] };
};

export type PortalAdminNoticePublishRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  slug: string;
  title: string;
  summary: string;
  level: PortalNoticeLevel;
  visibility: PortalNoticeVisibility;
};

export type PortalAdminNoticePublishResponse = {
  meta: PortalApiMeta;
  data: { item: PortalNoticeItem };
};

export type PortalPublicCmsPageGetRequest = {
  slug: string;
  session?: PortalSessionSummary;
};

export type PortalPublicCmsPageGetResponse = {
  meta: PortalApiMeta;
  data: { item: PortalCmsPageItem | null };
};

export type PortalAdminCmsPageListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminCmsPageListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalCmsPageItem[] };
};

export type PortalAdminCmsPageUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  slug: string;
  title: string;
  summary: string;
  body: string;
  visibility: PortalContentVisibility;
};

export type PortalAdminCmsPageUpsertResponse = {
  meta: PortalApiMeta;
  data: { item: PortalCmsPageItem };
};

export type PortalPublicAssetManifestListRequest = {
  session?: PortalSessionSummary;
};

export type PortalPublicAssetManifestListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalAssetManifestItem[] };
};

export type PortalAdminAssetManifestListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminAssetManifestListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalAssetManifestItem[] };
};

export type PortalAdminAssetManifestUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  title: string;
  href: string;
  assetType: "image" | "document" | "other";
  visibility: PortalContentVisibility;
};

export type PortalAdminAssetManifestUpsertResponse = {
  meta: PortalApiMeta;
  data: { item: PortalAssetManifestItem };
};

export type PortalPublicSeoPageGetRequest = {
  path: string;
  session?: PortalSessionSummary;
};

export type PortalPublicSeoPageGetResponse = {
  meta: PortalApiMeta;
  data: { item: PortalSeoPageItem | null };
};

export type PortalAdminSeoPageListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminSeoPageListResponse = {
  meta: PortalApiMeta;
  data: { items: PortalSeoPageItem[] };
};

export type PortalAdminSeoPageUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  path: string;
  title: string;
  description: string;
  noindex: boolean;
};

export type PortalAdminSeoPageUpsertResponse = {
  meta: PortalApiMeta;
  data: { item: PortalSeoPageItem };
};
