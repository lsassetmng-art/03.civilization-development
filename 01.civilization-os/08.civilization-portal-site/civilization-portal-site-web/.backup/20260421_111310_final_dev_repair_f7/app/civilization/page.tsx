import type { Metadata } from "next";
import { CivilizationPage } from "../../features/public-home/civilization-page";
import { buildPageMetadata } from "../../lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata("civilization");

export default function Page() {
  return <CivilizationPage />;
}
