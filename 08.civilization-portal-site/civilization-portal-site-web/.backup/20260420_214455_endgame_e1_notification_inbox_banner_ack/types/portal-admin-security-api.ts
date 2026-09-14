import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalAdminArea = "portal-admin";
export type PortalAdminActorType = "guest" | "member" | "operator";
export type PortalAuditActionType =
  | "notice_publish"
  | "maintenance_upsert"
  | "listing_upsert"
  | "navigation_manifest_upsert"
  | "cms_page_upsert"
  | "asset_manifest_upsert"
  | "seo_page_upsert"
  | "search_index_upsert"
  | "recommendation_rule_upsert"
  | "audit_note_append";
export type PortalAuditStatus = "accepted" | "rejected";

export type PortalAdminAccessCheckRequest = {
  area: PortalAdminArea;
  session: PortalSessionSummary;
};

export type PortalAdminAccessCheckResponse = {
  meta: PortalApiMeta;
  data: {
    area: PortalAdminArea;
    allowed: boolean;
    actorType: PortalAdminActorType;
    reason: string;
  };
};

export type PortalAuditLogItem = {
  id: string;
  area: PortalAdminArea;
  actionType: PortalAuditActionType;
  status: PortalAuditStatus;
  actorDisplayName: string;
  actorUserId?: string;
  actorAffiliations: string[];
  targetCode: string;
  summary: string;
  createdAt: string;
};

export type PortalAdminAuditListRequest = {
  area: PortalAdminArea;
  session: PortalSessionSummary;
  limit: number;
};

export type PortalAdminAuditListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalAuditLogItem[];
  };
};

export type PortalAdminAuditAppendRequest = {
  area: PortalAdminArea;
  session: PortalSessionSummary;
  targetCode: string;
  summary: string;
};

export type PortalAdminAuditAppendResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalAuditLogItem;
  };
};
