import type { Metadata } from "next";
import { SupportCenterPage } from "../../features/support/support-center-page";

export const metadata: Metadata = {
  title: "Help | Civilization Portal Site",
  description: "Help articles for portal entry, launcher usage, and supported navigation flows.",
};

export default function Page() {
  return <SupportCenterPage mode="help" />;
}
