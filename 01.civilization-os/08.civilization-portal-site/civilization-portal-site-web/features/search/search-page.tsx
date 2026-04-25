"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { RecommendationCard } from "../../components/common/recommendation-card";
import { SearchResultCard } from "../../components/common/search-result-card";
import { StatusMessage } from "../../components/feedback/status-message";
import { buildSearchRoute } from "../../lib/routing/routes";
import { getGatewaySessionSummary } from "../../services/civilization-auth/auth-gateway";
import { requestPublicAnalyticsEventAppend } from "../../services/portal-api/analytics-client";
import { requestPublicRecommendationResolve } from "../../services/portal-api/recommendation-client";
import { requestPublicSearchQuery } from "../../services/portal-api/search-client";
import type { PortalResolvedRecommendationItem } from "../../types/portal-recommendation-api";
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
  const [suggestions, setSuggestions] = useState<PortalResolvedRecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    setQueryInput(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const currentSession = getGatewaySessionSummary();
    const rawQuery = initialQuery.trim();

    requestPublicAnalyticsEventAppend({
      session: currentSession,
      surface: "search",
      action: rawQuery.length > 0 ? "search_query" : "page_view",
      targetCode: rawQuery.length > 0 ? rawQuery : "search",
      targetTitle: rawQuery.length > 0 ? "Search query: " + rawQuery : "Search page",
      targetKind: "search",
      metadata: "analytics_search_view_or_query",
    }).catch(() => undefined);
  }, [initialQuery]);

  useEffect(() => {
    let active = true;

    const runSearch = async () => {
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

    runSearch();

    return () => {
      active = false;
    };
  }, [initialQuery]);

  useEffect(() => {
    let active = true;

    const runSuggestions = async () => {
      try {
        setSuggestionLoading(true);
        setSuggestionError(null);

        const session = getGatewaySessionSummary();

        const response = await requestPublicRecommendationResolve({
          anchorPage: "search",
          query: initialQuery,
          session,
          limit: 6,
        });

        if (!active) {
          return;
        }

        setSuggestions(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Search suggestions could not be loaded.";

        setSuggestionError(message);
      } finally {
        if (active) {
          setSuggestionLoading(false);
        }
      }
    };

    runSuggestions();

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

      {suggestionLoading ? (
        <StatusMessage
          title="Loading recommendations"
          message="Resolving suggested next entries for the current query."
          variant="info"
        />
      ) : null}

      {suggestionError ? (
        <StatusMessage
          title="Recommendation fallback active"
          message={suggestionError}
          variant="warning"
        />
      ) : null}

      <section className="page-section">
        <h2 className="section-title">Suggested next entries</h2>
        {suggestions.length === 0 ? (
          <article className="card">
            <p className="card-copy">No recommendation is currently available.</p>
          </article>
        ) : (
          <div className="grid-2">
            {suggestions.map((item) => (
              <RecommendationCard key={item.code} item={item} />
            ))}
          </div>
        )}
      </section>

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
