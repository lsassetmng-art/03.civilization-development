import type { Metadata } from "next";
import { SearchPage } from "../../features/search/search-page";

export const metadata: Metadata = {
  title: "Search | Civilization Portal Site",
  description: "Search portal pages, OS entries, guide topics, and support routes.",
};

export default function Page() {
  return <SearchPage />;
}
