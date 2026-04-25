import type { Metadata } from "next";
import { LauncherPage } from "../../../features/launcher/launcher-page";

export const metadata: Metadata = {
  title: "Launcher | Civilization Portal Site",
  description: "Personal launcher entry for the current session.",
};

export default function Page() {
  return <LauncherPage />;
}
