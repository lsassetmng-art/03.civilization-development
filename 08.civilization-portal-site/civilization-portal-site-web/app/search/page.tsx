import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "../../features/search/search-page";

export const metadata: Metadata = {
  title: "Search | Civilization Portal Site",
  description: "Search portal pages, OS entries, guide topics, and support routes.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="page-stack">
          <section className="page-section">
            <article className="card">
              <p className="eyebrow">Search</p>
              <h1 className="card-title">Loading search</h1>
              <p className="card-copy">Preparing the portal search page.</p>
            </article>
          </section>
        </div>
      }
    >
      <SearchPage />
    </Suspense>
  );
}
