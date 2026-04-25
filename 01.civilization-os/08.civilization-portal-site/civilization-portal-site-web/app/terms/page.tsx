import type { Metadata } from "next";
import { SupportCenterPage } from "../../features/support/support-center-page";

export const metadata: Metadata = {
  title: "Terms | Civilization Portal Site",
  description: "Terms of use and availability notes for the portal.",
};

export default function Page() {
  return <SupportCenterPage mode="terms" />;
}
