import type {
  PortalAssetManifestItem,
  PortalCmsPageItem,
  PortalListingItem,
  PortalMaintenanceItem,
  PortalNoticeItem,
  PortalSeoPageItem,
} from "../../types/portal-admin-api";

const nowIso = (): string => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

let notices: PortalNoticeItem[] = [
  {
    id: "notice-portal-entry",
    slug: "portal-entry",
    title: "Portal entry active",
    summary: "The portal is the official public web entry.",
    level: "info",
    visibility: "public",
    publishedOn: "2026-04-21",
    lastUpdatedAt: nowIso(),
  },
];

let listings: PortalListingItem[] = [
  {
    id: "listing-home",
    code: "home",
    title: "Home",
    summary: "Portal home.",
    href: "/",
    visibility: "public",
    sortOrder: 10,
    lastUpdatedAt: nowIso(),
  },
];

let maintenanceItems: PortalMaintenanceItem[] = [];
let cmsPages: PortalCmsPageItem[] = [];
let assetItems: PortalAssetManifestItem[] = [];
let seoPages: PortalSeoPageItem[] = [];

export const listPublicNotices = (..._args: unknown[]): PortalNoticeItem[] =>
  clone(notices.filter((item) => item.visibility === "public"));

export const listAdminNotices = (..._args: unknown[]): PortalNoticeItem[] =>
  clone(notices);

export const publishNotice = (input: Partial<PortalNoticeItem> & { slug: string }): PortalNoticeItem => {
  const index = notices.findIndex((item) => item.slug === input.slug);
  const item: PortalNoticeItem = {
    id: index >= 0 ? notices[index].id : crypto.randomUUID(),
    slug: input.slug,
    title: input.title ?? input.slug,
    summary: input.summary ?? "",
    level: input.level ?? "info",
    visibility: input.visibility ?? "public",
    publishedOn: input.publishedOn ?? nowIso().slice(0, 10),
    lastUpdatedAt: nowIso(),
  };
  if (index >= 0) notices[index] = item;
  else notices = [item, ...notices];
  return clone(item);
};

export const listPublicListings = (..._args: unknown[]): PortalListingItem[] =>
  clone(listings.filter((item) => item.visibility === "public"));

export const listAdminListings = (..._args: unknown[]): PortalListingItem[] =>
  clone(listings);

export const upsertListing = (input: Partial<PortalListingItem> & { code: string }): PortalListingItem => {
  const index = listings.findIndex((item) => item.code === input.code);
  const item: PortalListingItem = {
    id: index >= 0 ? listings[index].id : crypto.randomUUID(),
    code: input.code,
    title: input.title ?? input.code,
    summary: input.summary ?? "",
    href: input.href ?? "/",
    visibility: input.visibility ?? "public",
    sortOrder: input.sortOrder ?? 100,
    lastUpdatedAt: nowIso(),
  };
  if (index >= 0) listings[index] = item;
  else listings = [...listings, item];
  return clone(item);
};

export const listPublicMaintenance = (..._args: unknown[]): PortalMaintenanceItem[] =>
  clone(maintenanceItems.filter((item) => item.visibility === "public"));

export const listAdminMaintenance = (..._args: unknown[]): PortalMaintenanceItem[] =>
  clone(maintenanceItems);

export const upsertMaintenance = (
  input: Partial<PortalMaintenanceItem> & { code: string },
): PortalMaintenanceItem => {
  const index = maintenanceItems.findIndex((item) => item.code === input.code);
  const item: PortalMaintenanceItem = {
    id: index >= 0 ? maintenanceItems[index].id : crypto.randomUUID(),
    code: input.code,
    title: input.title ?? input.code,
    summary: input.summary ?? "",
    status: input.status ?? "scheduled",
    visibility: input.visibility ?? "public",
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    lastUpdatedAt: nowIso(),
  };
  if (index >= 0) maintenanceItems[index] = item;
  else maintenanceItems = [...maintenanceItems, item];
  return clone(item);
};

export const getPublicCmsPage = (input: { slug?: string } | string): PortalCmsPageItem | null => {
  const slug = typeof input === "string" ? input : input.slug;
  return clone(cmsPages.find((item) => item.slug === slug) ?? null);
};

export const listAdminCmsPages = (..._args: unknown[]): PortalCmsPageItem[] => clone(cmsPages);

export const upsertCmsPage = (
  input: Partial<PortalCmsPageItem> & { slug: string },
): PortalCmsPageItem => {
  const index = cmsPages.findIndex((item) => item.slug === input.slug);
  const item: PortalCmsPageItem = {
    id: index >= 0 ? cmsPages[index].id : crypto.randomUUID(),
    slug: input.slug,
    title: input.title ?? input.slug,
    summary: input.summary ?? "",
    body: input.body ?? "",
    visibility: input.visibility ?? "public",
    lastUpdatedAt: nowIso(),
  };
  if (index >= 0) cmsPages[index] = item;
  else cmsPages = [...cmsPages, item];
  return clone(item);
};

export const listPublicAssetManifest = (..._args: unknown[]): PortalAssetManifestItem[] =>
  clone(assetItems.filter((item) => item.visibility === "public"));

export const listAdminAssetManifest = (..._args: unknown[]): PortalAssetManifestItem[] =>
  clone(assetItems);

export const upsertAssetManifest = (
  input: Partial<PortalAssetManifestItem> & { code: string },
): PortalAssetManifestItem => {
  const index = assetItems.findIndex((item) => item.code === input.code);
  const item: PortalAssetManifestItem = {
    id: index >= 0 ? assetItems[index].id : crypto.randomUUID(),
    code: input.code,
    title: input.title ?? input.code,
    href: input.href ?? "/",
    assetType: input.assetType ?? "other",
    visibility: input.visibility ?? "public",
    lastUpdatedAt: nowIso(),
  };
  if (index >= 0) assetItems[index] = item;
  else assetItems = [...assetItems, item];
  return clone(item);
};

export const getPublicSeoPage = (input: { path?: string } | string): PortalSeoPageItem | null => {
  const path = typeof input === "string" ? input : input.path;
  return clone(seoPages.find((item) => item.path === path) ?? null);
};

export const listAdminSeoPages = (..._args: unknown[]): PortalSeoPageItem[] => clone(seoPages);

export const upsertSeoPage = (
  input: Partial<PortalSeoPageItem> & { path: string },
): PortalSeoPageItem => {
  const index = seoPages.findIndex((item) => item.path === input.path);
  const item: PortalSeoPageItem = {
    id: index >= 0 ? seoPages[index].id : crypto.randomUUID(),
    path: input.path,
    title: input.title ?? input.path,
    description: input.description ?? "",
    noindex: input.noindex ?? false,
    lastUpdatedAt: nowIso(),
  };
  if (index >= 0) seoPages[index] = item;
  else seoPages = [...seoPages, item];
  return clone(item);
};

// COMPAT_PASS_C_START
export const publishAdminNotice = (
  input: Partial<PortalNoticeItem> & {
    slug?: string;
    code?: string;
    title?: string;
    summary?: string;
  },
): PortalNoticeItem =>
  publishNotice({
    slug: input.slug ?? input.code ?? input.title ?? "notice",
    title: input.title ?? input.slug ?? input.code ?? "Notice",
    summary: input.summary ?? "",
    level: input.level ?? "info",
    visibility: input.visibility ?? "public",
    publishedOn: input.publishedOn,
  });
// COMPAT_PASS_C_END
