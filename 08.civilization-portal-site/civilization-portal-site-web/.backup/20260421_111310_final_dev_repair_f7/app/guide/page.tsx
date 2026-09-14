import type { Metadata } from "next";
import { GuidePage } from "../../features/public-home/guide-page";
import { buildPageMetadata } from "../../lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata("guide");

export default function Page() {
  return <GuidePage />;
}
