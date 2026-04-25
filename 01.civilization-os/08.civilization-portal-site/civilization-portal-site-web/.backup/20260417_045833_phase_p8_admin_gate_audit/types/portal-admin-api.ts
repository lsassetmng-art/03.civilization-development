import type { PortalApiMeta } from "./portal-api";

export type PortalNoticeLevel = "info" | "warning" | "maintenance";
export type PortalNoticeVisibility = "public" | "admin";

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

export type PortalMaintenanceTargetType = "global" | "os";

export type PortalMaintenanceItem = {
  id: string;
  targetType: PortalMaintenanceTargetType;
  targetCode: string;
  enabled: boolean;
  title: string;
  message: string;
  startAt?: string;
  endAt?: string;
  lastUpdatedAt: string;
};

export type PortalListingVisibility = "listed" | "hidden" | "featured-only";

export type PortalListingItem = {
  id: string;
  osCode: string;
  name: string;
  category: string;
  visibility: PortalListingVisibility;
  featured: boolean;
  badge?: string;
  sortOrder: number;
  lastUpdatedAt: string;
};

export type PortalPublicNoticesListRequest = {
  channel: "home" | "launcher";
};

export type PortalPublicNoticesListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalNoticeItem[];
  };
};

export type PortalPublicMaintenanceListRequest = {
  targetScope: "portal" | "all";
};

export type PortalPublicMaintenanceListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalMaintenanceItem[];
  };
};

export type PortalPublicListingListRequest = {
  catalog: "os";
};

export type PortalPublicListingListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalListingItem[];
  };
};

export type PortalAdminNoticesListRequest = {
  scope: "admin";
};

export type PortalAdminNoticesListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalNoticeItem[];
  };
};

export type PortalAdminNoticePublishRequest = {
  title: string;
  summary: string;
  level: PortalNoticeLevel;
  visibility: PortalNoticeVisibility;
  publishedOn: string;
};

export type PortalAdminNoticePublishResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalNoticeItem;
  };
};

export type PortalAdminMaintenanceListRequest = {
  scope: "admin";
};

export type PortalAdminMaintenanceListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalMaintenanceItem[];
  };
};

export type PortalAdminMaintenanceUpsertRequest = {
  targetType: PortalMaintenanceTargetType;
  targetCode: string;
  enabled: boolean;
  title: string;
  message: string;
  startAt?: string;
  endAt?: string;
};

export type PortalAdminMaintenanceUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalMaintenanceItem;
  };
};

export type PortalAdminListingListRequest = {
  scope: "admin";
};

export type PortalAdminListingListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalListingItem[];
  };
};

export type PortalAdminListingUpsertRequest = {
  osCode: string;
  visibility: PortalListingVisibility;
  featured: boolean;
  badge?: string;
  sortOrder: number;
};

export type PortalAdminListingUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalListingItem;
  };
};
