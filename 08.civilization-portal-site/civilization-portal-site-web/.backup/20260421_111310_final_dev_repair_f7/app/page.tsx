import type { Metadata } from "next";
import { HomePage } from "../features/public-home/home-page";
import { buildPageMetadata } from "../lib/seo/page-metadata";

export const metadata: Metadata = buildPageMetadata("home");

export default function Page() {
  return <HomePage />;
}
