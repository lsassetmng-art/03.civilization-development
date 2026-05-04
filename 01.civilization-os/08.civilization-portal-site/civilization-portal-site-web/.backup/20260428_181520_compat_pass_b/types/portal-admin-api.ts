import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalNoticeLevel = "info" | "warning" | "success";
export type PortalNoticeVisibility = "public" | "member" | "operator";

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
  visibility: PortalNoticeVisibility;
  sortOrder: number;
  lastUpdatedAt: string;
};

export type PortalMaintenanceItem = {
  id: string;
  code: string;
  title: string;
  summary: string;
  status: "scheduled" | "active" | "resolved";
  visibility: PortalNoticeVisibility;
  startsAt?: string;
  endsAt?: string;
  lastUpdatedAt: string;
};

export type PortalPublicListingListRequest = {
  session?: PortalSessionSummary;
};

export type PortalPublicListingListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalListingItem[];
  };
};

export type PortalAdminListingListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminListingListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalListingItem[];
  };
};

export type PortalAdminListingUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  title: string;
  summary: string;
  href: string;
  visibility: PortalNoticeVisibility;
  sortOrder: number;
};

export type PortalAdminListingUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalListingItem;
  };
};

export type PortalPublicMaintenanceListRequest = {
  session?: PortalSessionSummary;
};

export type PortalPublicMaintenanceListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalMaintenanceItem[];
  };
};

export type PortalAdminMaintenanceListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminMaintenanceListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalMaintenanceItem[];
  };
};

export type PortalAdminMaintenanceUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  title: string;
  summary: string;
  status: "scheduled" | "active" | "resolved";
  visibility: PortalNoticeVisibility;
  startsAt?: string;
  endsAt?: string;
};

export type PortalAdminMaintenanceUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalMaintenanceItem;
  };
};

export type PortalPublicNoticesListRequest = {
  session?: PortalSessionSummary;
};

export type PortalPublicNoticesListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalNoticeItem[];
  };
};

export type PortalAdminNoticesListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminNoticesListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalNoticeItem[];
  };
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
  data: {
    item: PortalNoticeItem;
  };
};
