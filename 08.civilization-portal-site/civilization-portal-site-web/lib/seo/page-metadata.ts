import type { Metadata } from "next";
import { getPublicSeoPage } from "../../services/mock-server/seo-store";
import { listPublicAssets } from "../../services/mock-server/asset-store";
import type { PortalSeoPageCode } from "../../types/portal-seo-api";

export const buildPageMetadata = (
  pageCode: PortalSeoPageCode,
): Metadata => {
  const descriptor = getPublicSeoPage(pageCode);

  if (!descriptor) {
    return {};
  }

  const imageAsset = descriptor.ogImageAssetCode
    ? listPublicAssets("cms").find(
        (item) => item.code === descriptor.ogImageAssetCode,
      )
    : undefined;

  const imageUrl = imageAsset?.sourceUrl;

  return {
    title: descriptor.pageTitle,
    description: descriptor.metaDescription,
    alternates: {
      canonical: descriptor.canonicalPath,
    },
    robots: {
      index: descriptor.robotsIndex,
      follow: descriptor.robotsFollow,
    },
    openGraph: {
      title: descriptor.ogTitle,
      description: descriptor.ogDescription,
      url: descriptor.canonicalPath,
      type: "website",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: descriptor.ogTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: descriptor.ogTitle,
      description: descriptor.ogDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
};
