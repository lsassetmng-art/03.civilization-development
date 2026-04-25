import type { Metadata } from "next";
import { SupportCenterPage } from "../../features/support/support-center-page";

export const metadata: Metadata = {
  title: "Contact | Civilization Portal Site",
  description: "Support channels and support request submission for the portal.",
};

export default function Page() {
  return <SupportCenterPage mode="contact" />;
}
