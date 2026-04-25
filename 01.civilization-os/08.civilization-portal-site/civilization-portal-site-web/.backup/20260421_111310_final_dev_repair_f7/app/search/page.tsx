import type { Metadata } from "next";
import { SearchPage } from "../../features/search/search-page";

export const metadata: Metadata = {
  title: "Search | Civilization Portal Site",
  description: "Search public portal pages, OS entries, and guidance.",
};

export default function Page() {
  return <SearchPage />;
}
