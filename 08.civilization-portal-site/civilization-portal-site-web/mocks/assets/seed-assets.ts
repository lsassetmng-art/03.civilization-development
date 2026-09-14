import type { PortalAssetManifestItem } from "../../types/portal-asset-api";

const nowIso = (): string => new Date().toISOString();

export const PORTAL_ASSET_SEED_ITEMS: PortalAssetManifestItem[] = [
  {
    id: "asset-home-hero",
    code: "portal-home-hero",
    kind: "image",
    title: "Portal home hero",
    description: "Hero illustration for the portal home page.",
    sourceUrl: "/portal-assets/portal-home-hero.svg",
    altText: "Civilization Portal hero illustration",
    visibility: "public",
    usageScope: "cms",
    sortOrder: 10,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "asset-civilization-boundary",
    code: "portal-civilization-boundary",
    kind: "image",
    title: "Portal and CivilizationOS boundary diagram",
    description: "Simple diagram showing public portal responsibilities and CivilizationOS ownership.",
    sourceUrl: "/portal-assets/portal-civilization-boundary.svg",
    altText: "Boundary diagram between the portal and CivilizationOS",
    visibility: "public",
    usageScope: "cms",
    sortOrder: 20,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "asset-guide-auth-flow",
    code: "portal-guide-auth-flow",
    kind: "image",
    title: "Portal auth flow",
    description: "Simple visual showing portal, auth bridge, and launcher sequence.",
    sourceUrl: "/portal-assets/portal-guide-auth-flow.svg",
    altText: "Portal authentication flow diagram",
    visibility: "public",
    usageScope: "cms",
    sortOrder: 30,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "asset-guide-reference",
    code: "portal-guide-reference",
    kind: "file",
    title: "Portal guide reference",
    description: "Reference text file for the portal guide section.",
    sourceUrl: "/portal-assets/portal-guide-reference.txt",
    fileLabel: "Open reference file",
    mimeType: "text/plain",
    visibility: "public",
    usageScope: "cms",
    sortOrder: 40,
    lastUpdatedAt: nowIso(),
  },
];

export const findSeedAsset = (
  code: string,
): PortalAssetManifestItem | undefined =>
  PORTAL_ASSET_SEED_ITEMS.find((item) => item.code === code);
