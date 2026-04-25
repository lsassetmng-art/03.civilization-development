import type { Metadata } from "next";
import { HomePage } from "../features/public-home/home-page";

export const metadata: Metadata = {
  title: "Civilization Portal Site",
  description: "Official public web entry for Civilization.",
};

export default function Page() {
  return <HomePage />;
}
