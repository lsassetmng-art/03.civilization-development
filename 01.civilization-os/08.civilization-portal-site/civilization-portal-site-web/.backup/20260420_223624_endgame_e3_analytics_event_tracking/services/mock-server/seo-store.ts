import { PORTAL_SEO_SEED_PAGES } from "../../mocks/seo/seed-page-seo";
import type { PortalSeoPageDescriptor } from "../../types/portal-seo-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let seoItems: PortalSeoPageDescriptor[] = clone(PORTAL_SEO_SEED_PAGES);

const sortItems = (items: PortalSeoPageDescriptor[]): PortalSeoPageDescriptor[] =>
  [...items].sort((a, b) => a.pageCode.localeCompare(b.pageCode));

export const getPublicSeoPage = (
  pageCode: "home" | "civilization" | "guide",
): PortalSeoPageDescriptor | undefined =>
  clone(seoItems.find((item) => item.pageCode === pageCode));

export const listAdminSeoPages = (): PortalSeoPageDescriptor[] =>
  clone(sortItems(seoItems));

export const upsertSeoPage = (input: {
  pageCode: "home" | "civilization" | "guide";
  pageTitle: string;
  metaDescription: string;
  canonicalPath: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageAssetCode?: string;
  structuredType: "WebPage" | "AboutPage" | "HowToPage";
  structuredName: string;
  structuredDescription: string;
}): PortalSeoPageDescriptor => {
  const index = seoItems.findIndex((item) => item.pageCode === input.pageCode);

  const item: PortalSeoPageDescriptor = {
    id: index >= 0 ? seoItems[index].id : crypto.randomUUID(),
    pageCode: input.pageCode,
    pageTitle: input.pageTitle,
    metaDescription: input.metaDescription,
    canonicalPath: input.canonicalPath,
    robotsIndex: input.robotsIndex,
    robotsFollow: input.robotsFollow,
    ogTitle: input.ogTitle,
    ogDescription: input.ogDescription,
    ogImageAssetCode: input.ogImageAssetCode || undefined,
    structuredType: input.structuredType,
    structuredName: input.structuredName,
    structuredDescription: input.structuredDescription,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    seoItems[index] = item;
  } else {
    seoItems = [...seoItems, item];
  }

  return clone(item);
};
