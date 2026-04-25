import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalPersonalTargetKind =
  | "page"
  | "os"
  | "auth"
  | "launcher"
  | "admin"
  | "search";

export type PortalSavedShortcutItem = {
  id: string;
  code: string;
  title: string;
  href: string;
  targetKind: PortalPersonalTargetKind;
  note?: string;
  sortOrder: number;
  lastUpdatedAt: string;
};

export type PortalFavoriteEntryItem = {
  id: string;
  code: string;
  title: string;
  href: string;
  targetKind: PortalPersonalTargetKind;
  reason?: string;
  lastUpdatedAt: string;
};

export type PortalRecentActionItem = {
  id: string;
  actionCode: string;
  actionLabel: string;
  targetCode: string;
  targetTitle: string;
  targetHref: string;
  targetKind: PortalPersonalTargetKind;
  occurredAt: string;
};

export type PortalPersonalEntriesGetRequest = {
  session: PortalSessionSummary;
  limit: number;
};

export type PortalPersonalEntriesGetResponse = {
  meta: PortalApiMeta;
  data: {
    savedShortcuts: PortalSavedShortcutItem[];
    favoriteEntries: PortalFavoriteEntryItem[];
    recentActions: PortalRecentActionItem[];
  };
};

export type PortalPersonalShortcutUpsertRequest = {
  session: PortalSessionSummary;
  code: string;
  title: string;
  href: string;
  targetKind: PortalPersonalTargetKind;
  note?: string;
  sortOrder: number;
};

export type PortalPersonalShortcutUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalSavedShortcutItem;
  };
};

export type PortalPersonalFavoriteUpsertRequest = {
  session: PortalSessionSummary;
  code: string;
  title: string;
  href: string;
  targetKind: PortalPersonalTargetKind;
  reason?: string;
};

export type PortalPersonalFavoriteUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalFavoriteEntryItem;
  };
};

export type PortalPersonalRecentAppendRequest = {
  session: PortalSessionSummary;
  actionCode: string;
  actionLabel: string;
  targetCode: string;
  targetTitle: string;
  targetHref: string;
  targetKind: PortalPersonalTargetKind;
};

export type PortalPersonalRecentAppendResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalRecentActionItem;
  };
};
