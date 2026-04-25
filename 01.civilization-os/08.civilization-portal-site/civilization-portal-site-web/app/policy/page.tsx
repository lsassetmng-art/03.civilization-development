import type { Metadata } from "next";
import { SupportCenterPage } from "../../features/support/support-center-page";

export const metadata: Metadata = {
  title: "Policy | Civilization Portal Site",
  description: "Policy summaries for privacy, support handling, and operational rules.",
};

export default function Page() {
  return <SupportCenterPage mode="policy" />;
}
