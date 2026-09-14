"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { SearchResultCard } from "../../components/common/search-result-card";
import { StatusMessage } from "../../components/feedback/status-message";
import { buildSearchRoute } from "../../lib/routing/routes";
import { requestPublicSearchQuery } from "../../services/portal-api/search-client";
import type { PortalSearchResultItem } from "../../types/portal-search-api";

export function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = useMemo(
    () => searchParams.get("q") ?? "",
    [searchParams],
  );

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [normalizedQuery, setNormalizedQuery] = useState(initialQuery.trim().toLowerCase());
  const [results, setResults] = useState<PortalSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setQueryInput(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const rawQuery = initialQuery.trim();

      if (rawQuery.length === 0) {
        setNormalizedQuery("");
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await requestPublicSearchQuery({
          query: rawQuery,
          limit: 20,
        });

        if (!active) {
          return;
        }

        setNormalizedQuery(response.data.normalizedQuery);
        setResults(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Search results could not be loaded.";

        setErrorMessage(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [initialQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildSearchRoute(queryInput));
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Portal Search"
        title="Search the portal"
        description="Search public portal pages, OS entries, authentication entry points, and launcher-related guidance."
      />

      <section className="page-section">
        <article className="card">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              className="text-input"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Search portal pages, OS entries, guide topics..."
            />
            <button type="submit" className="button-link">
              Search
            </button>
          </form>
        </article>
      </section>

      {loading ? (
        <StatusMessage
          title="Searching"
          message="Querying the public portal search index."
          variant="info"
        />
      ) : null}

      {errorMessage ? (
        <StatusMessage
          title="Search failed"
          message={errorMessage}
          variant="danger"
        />
      ) : null}

      {normalizedQuery.length > 0 ? (
        <section className="page-section">
          <h2 className="section-title">
            Results for: {normalizedQuery}
          </h2>

          {results.length === 0 ? (
            <article className="card">
              <p className="card-copy">
                No results matched the current query.
              </p>
            </article>
          ) : (
            <div className="grid-2">
              {results.map((item) => (
                <SearchResultCard key={`${item.code}-${item.href}`} item={item} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="page-section">
          <article className="card">
            <p className="card-copy">
              Enter a query to search the public portal index.
            </p>
          </article>
        </section>
      )}
    </div>
  );
}
