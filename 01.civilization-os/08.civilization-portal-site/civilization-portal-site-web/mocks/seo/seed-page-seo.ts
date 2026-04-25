import type { PortalSeoPageDescriptor } from "../../types/portal-seo-api";

const nowIso = (): string => new Date().toISOString();

export const PORTAL_SEO_SEED_PAGES: PortalSeoPageDescriptor[] = [
  {
    id: "seo-home",
    pageCode: "home",
    pageTitle: "Civilization Portal Site",
    metaDescription:
      "Official public entry for Civilization information, authentication guidance, OS catalog access, and launcher-aware routing.",
    canonicalPath: "/",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "Civilization Portal Site",
    ogDescription:
      "Official public entry for Civilization information, authentication guidance, OS catalog access, and launcher-aware routing.",
    ogImageAssetCode: "portal-home-hero",
    structuredType: "WebPage",
    structuredName: "Civilization Portal Site",
    structuredDescription:
      "Official public entry for Civilization information, authentication guidance, OS catalog access, and launcher-aware routing.",
    lastUpdatedAt: nowIso(),
  },
  {
    id: "seo-civilization",
    pageCode: "civilization",
    pageTitle: "What Civilization is",
    metaDescription:
      "Portal-side explanation of Civilization, with canonical sign-up and authentication owned by CivilizationOS.",
    canonicalPath: "/civilization",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "What Civilization is",
    ogDescription:
      "Portal-side explanation of Civilization, with canonical sign-up and authentication owned by CivilizationOS.",
    ogImageAssetCode: "portal-civilization-boundary",
    structuredType: "AboutPage",
    structuredName: "What Civilization is",
    structuredDescription:
      "Portal-side explanation of Civilization responsibilities and CivilizationOS ownership boundaries.",
    lastUpdatedAt: nowIso(),
  },
  {
    id: "seo-guide",
    pageCode: "guide",
    pageTitle: "How to use the portal",
    metaDescription:
      "Portal-first navigation, CivilizationOS-owned authentication, and launcher-based OS entry guide.",
    canonicalPath: "/guide",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "How to use the portal",
    ogDescription:
      "Portal-first navigation, CivilizationOS-owned authentication, and launcher-based OS entry guide.",
    ogImageAssetCode: "portal-guide-auth-flow",
    structuredType: "HowToPage",
    structuredName: "How to use the portal",
    structuredDescription:
      "Guide for portal-first navigation, authentication bridge flow, and launcher-based entry.",
    lastUpdatedAt: nowIso(),
  },
];

export const findSeedSeoPage = (
  pageCode: "home" | "civilization" | "guide",
): PortalSeoPageDescriptor | undefined =>
  PORTAL_SEO_SEED_PAGES.find((item) => item.pageCode === pageCode);
