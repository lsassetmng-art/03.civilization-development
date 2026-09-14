import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalNotificationSurface = "home" | "launcher";
export type PortalNotificationChannel = "banner" | "inbox" | "announcement";
export type PortalNotificationAudience = "public" | "member" | "operator";
export type PortalNotificationTone = "info" | "warning" | "success";
export type PortalNotificationVisibility = "visible" | "hidden";

export type PortalNotificationCenterItem = {
  id: string;
  code: string;
  channel: PortalNotificationChannel;
  surface: PortalNotificationSurface;
  audience: PortalNotificationAudience;
  title: string;
  body: string;
  href?: string;
  tone: PortalNotificationTone;
  priority: number;
  visibility: PortalNotificationVisibility;
  ackRequired: boolean;
  dismissible: boolean;
  lastUpdatedAt: string;
};

export type PortalAnnouncementAckState = {
  code: string;
  ackedAt: string;
};

export type PortalPublicNotificationCenterGetRequest = {
  surface: PortalNotificationSurface;
  session: PortalSessionSummary;
  limit: number;
};

export type PortalPublicNotificationCenterGetResponse = {
  meta: PortalApiMeta;
  data: {
    bannerItems: PortalNotificationCenterItem[];
    inboxItems: PortalNotificationCenterItem[];
    announcementItems: PortalNotificationCenterItem[];
    ackedItems: PortalAnnouncementAckState[];
  };
};

export type PortalPublicNotificationAnnouncementAckRequest = {
  session: PortalSessionSummary;
  code: string;
  surface: PortalNotificationSurface;
};

export type PortalPublicNotificationAnnouncementAckResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalAnnouncementAckState;
  };
};

export type PortalAdminNotificationCenterListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminNotificationCenterListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalNotificationCenterItem[];
  };
};

export type PortalAdminNotificationCenterUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  code: string;
  channel: PortalNotificationChannel;
  surface: PortalNotificationSurface;
  audience: PortalNotificationAudience;
  title: string;
  body: string;
  href?: string;
  tone: PortalNotificationTone;
  priority: number;
  visibility: PortalNotificationVisibility;
  ackRequired: boolean;
  dismissible: boolean;
};

export type PortalAdminNotificationCenterUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalNotificationCenterItem;
  };
};
