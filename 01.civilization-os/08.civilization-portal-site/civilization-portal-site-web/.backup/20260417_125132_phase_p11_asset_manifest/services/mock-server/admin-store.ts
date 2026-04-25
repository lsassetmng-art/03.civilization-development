import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG, findOsByCode } from "../../mocks/os/catalog";
import type {
  PortalListingItem,
  PortalMaintenanceItem,
  PortalNoticeItem,
  PortalNoticeLevel,
  PortalNoticeVisibility,
} from "../../types/portal-admin-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "notice";

const nowIso = (): string => new Date().toISOString();

let noticeItems: PortalNoticeItem[] = HOME_NOTICES.map((item, index) => ({
  id: `notice-seed-${index + 1}`,
  slug: item.slug,
  title: item.title,
  summary: item.summary,
  level: item.level,
  visibility: "public",
  publishedOn: item.publishedOn,
  lastUpdatedAt: item.publishedOn,
}));

let maintenanceItems: PortalMaintenanceItem[] = [
  {
    id: "maintenance-portal-global",
    targetType: "global",
    targetCode: "portal",
    enabled: false,
    title: "Portal maintenance",
    message: "Global portal maintenance is currently disabled.",
    lastUpdatedAt: nowIso(),
  },
  {
    id: "maintenance-life-os",
    targetType: "os",
    targetCode: "life-os",
    enabled: true,
    title: "LifeOS maintenance",
    message: "LifeOS entry is temporarily routed to maintenance handling.",
    lastUpdatedAt: nowIso(),
  },
];

let listingItems: PortalListingItem[] = OS_CATALOG.map((os, index) => ({
  id: `listing-seed-${index + 1}`,
  osCode: os.code,
  name: os.name,
  category: os.category,
  visibility: "listed",
  featured: os.featured,
  badge: os.featured ? "featured" : "",
  sortOrder: index + 1,
  lastUpdatedAt: nowIso(),
}));

const sortNotices = (items: PortalNoticeItem[]): PortalNoticeItem[] =>
  [...items].sort((a, b) => {
    if (a.publishedOn < b.publishedOn) return 1;
    if (a.publishedOn > b.publishedOn) return -1;
    return a.title.localeCompare(b.title);
  });

const sortListings = (items: PortalListingItem[]): PortalListingItem[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.name.localeCompare(b.name);
  });

export const listAdminNotices = (): PortalNoticeItem[] => clone(sortNotices(noticeItems));

export const listPublicNotices = (): PortalNoticeItem[] =>
  clone(sortNotices(noticeItems.filter((item) => item.visibility === "public")));

export const publishAdminNotice = (input: {
  title: string;
  summary: string;
  level: PortalNoticeLevel;
  visibility: PortalNoticeVisibility;
  publishedOn: string;
}): PortalNoticeItem => {
  const timestamp = nowIso();
  const item: PortalNoticeItem = {
    id: crypto.randomUUID(),
    slug: slugify(input.title),
    title: input.title,
    summary: input.summary,
    level: input.level,
    visibility: input.visibility,
    publishedOn: input.publishedOn,
    lastUpdatedAt: timestamp,
  };

  noticeItems = [item, ...noticeItems];
  return clone(item);
};

export const listAdminMaintenance = (): PortalMaintenanceItem[] =>
  clone([...maintenanceItems].sort((a, b) => a.targetCode.localeCompare(b.targetCode)));

export const listPublicMaintenance = (): PortalMaintenanceItem[] =>
  clone(
    [...maintenanceItems]
      .filter((item) => item.enabled)
      .sort((a, b) => a.targetCode.localeCompare(b.targetCode)),
  );

export const upsertMaintenance = (input: {
  targetType: "global" | "os";
  targetCode: string;
  enabled: boolean;
  title: string;
  message: string;
  startAt?: string;
  endAt?: string;
}): PortalMaintenanceItem => {
  const existingIndex = maintenanceItems.findIndex(
    (item) =>
      item.targetType === input.targetType &&
      item.targetCode === input.targetCode,
  );

  const item: PortalMaintenanceItem = {
    id:
      existingIndex >= 0
        ? maintenanceItems[existingIndex].id
        : crypto.randomUUID(),
    targetType: input.targetType,
    targetCode: input.targetCode,
    enabled: input.enabled,
    title: input.title,
    message: input.message,
    startAt: input.startAt || undefined,
    endAt: input.endAt || undefined,
    lastUpdatedAt: nowIso(),
  };

  if (existingIndex >= 0) {
    maintenanceItems[existingIndex] = item;
  } else {
    maintenanceItems = [...maintenanceItems, item];
  }

  return clone(item);
};

export const listAdminListings = (): PortalListingItem[] =>
  clone(sortListings(listingItems));

export const listPublicListings = (): PortalListingItem[] =>
  clone(
    sortListings(
      listingItems.filter((item) => item.visibility !== "hidden"),
    ),
  );

export const upsertListing = (input: {
  osCode: string;
  visibility: "listed" | "hidden" | "featured-only";
  featured: boolean;
  badge?: string;
  sortOrder: number;
}): PortalListingItem => {
  const os = findOsByCode(input.osCode);
  if (!os) {
    throw new Error(`Unknown OS code: ${input.osCode}`);
  }

  const existingIndex = listingItems.findIndex((item) => item.osCode === input.osCode);

  const item: PortalListingItem = {
    id:
      existingIndex >= 0
        ? listingItems[existingIndex].id
        : crypto.randomUUID(),
    osCode: os.code,
    name: os.name,
    category: os.category,
    visibility: input.visibility,
    featured: input.featured,
    badge: input.badge || "",
    sortOrder: input.sortOrder,
    lastUpdatedAt: nowIso(),
  };

  if (existingIndex >= 0) {
    listingItems[existingIndex] = item;
  } else {
    listingItems = [...listingItems, item];
  }

  return clone(item);
};
