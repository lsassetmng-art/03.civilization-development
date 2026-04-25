import { PORTAL_ASSET_SEED_ITEMS } from "../../mocks/assets/seed-assets";
import type { PortalAssetManifestItem } from "../../types/portal-asset-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let assetItems: PortalAssetManifestItem[] = clone(PORTAL_ASSET_SEED_ITEMS);

const sortItems = (items: PortalAssetManifestItem[]): PortalAssetManifestItem[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

export const listPublicAssets = (
  usageScope: "cms",
): PortalAssetManifestItem[] =>
  clone(
    sortItems(
      assetItems.filter(
        (item) => item.visibility === "public" && item.usageScope === usageScope,
      ),
    ),
  );

export const listAdminAssets = (): PortalAssetManifestItem[] =>
  clone(sortItems(assetItems));

export const upsertAsset = (input: {
  code: string;
  kind: "image" | "file";
  title: string;
  description: string;
  sourceUrl: string;
  altText?: string;
  fileLabel?: string;
  mimeType?: string;
  visibility: "public" | "admin";
  usageScope: "cms";
  sortOrder: number;
}): PortalAssetManifestItem => {
  const index = assetItems.findIndex((item) => item.code === input.code);

  const item: PortalAssetManifestItem = {
    id: index >= 0 ? assetItems[index].id : crypto.randomUUID(),
    code: input.code,
    kind: input.kind,
    title: input.title,
    description: input.description,
    sourceUrl: input.sourceUrl,
    altText: input.altText || undefined,
    fileLabel: input.fileLabel || undefined,
    mimeType: input.mimeType || undefined,
    visibility: input.visibility,
    usageScope: input.usageScope,
    sortOrder: input.sortOrder,
    lastUpdatedAt: nowIso(),
  };

  if (index >= 0) {
    assetItems[index] = item;
  } else {
    assetItems = [...assetItems, item];
  }

  return clone(item);
};
