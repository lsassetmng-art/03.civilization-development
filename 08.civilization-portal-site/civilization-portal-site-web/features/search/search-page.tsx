"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";
import { requestPublicSearchQuery } from "../../services/portal-api/search-client";
import type { PortalSearchResultItem } from "../../types/portal-search-api";

export const SearchPage = () => {
  const searchParams = useSearchParams();
  const { t } = usePortalI18n();
  const initialQuery = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
  const [query, setQuery] = useState(initialQuery);
  const [items, setItems] = useState<PortalSearchResultItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const runSearch = async () => {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      setItems([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const response = await requestPublicSearchQuery({
      query: trimmed,
      limit: 20,
    });
    setItems(response.data.items);
    setStatus("done");
  };

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("search.eyebrow")}</p>
          <h1 className="card-title">{t("search.title")}</h1>
          <p className="card-copy">{t("search.description")}</p>
        </article>
      </section>

      <section className="page-section">
        <article className="card">
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              void runSearch();
            }}
          >
            <input
              className="text-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search.placeholder")}
            />
            <button className="button-primary" type="submit">
              {t("search.button")}
            </button>
          </form>

          {status === "loading" ? (
            <p className="card-copy">{t("search.loading")}</p>
          ) : null}

          {status === "idle" ? (
            <p className="card-copy">{t("search.empty")}</p>
          ) : null}

          {status === "done" && items.length === 0 ? (
            <p className="card-copy">{t("search.noResults")}</p>
          ) : null}

          {items.length > 0 ? (
            <div className="card-grid">
              {items.map((item) => (
                <Link key={item.id} href={item.href} className="mini-card">
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
};

export default SearchPage;
