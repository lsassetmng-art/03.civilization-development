"use client";

import { useEffect, useState } from "react";
import {
  requestAdminSearchIndexList,
  requestAdminSearchIndexUpsert,
} from "../../services/portal-api/search-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalSearchIndexItem,
  PortalSearchIndexKind,
  PortalSearchIndexVisibility,
} from "../../types/portal-search-api";

type AdminSearchIndexPanelProps = {
  session: PortalSessionSummary;
  canOperate: boolean;
  onError: (message: string | null) => void;
  onAuditRefresh: () => Promise<void>;
};

const sortItems = (items: PortalSearchIndexItem[]): PortalSearchIndexItem[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

export function AdminSearchIndexPanel({
  session,
  canOperate,
  onError,
  onAuditRefresh,
}: AdminSearchIndexPanelProps) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<PortalSearchIndexItem[]>([]);

  const [code, setCode] = useState("search");
  const [kind, setKind] = useState<PortalSearchIndexKind>("page");
  const [title, setTitle] = useState("Search");
  const [summary, setSummary] = useState("Search public portal pages, OS entries, and guidance.");
  const [href, setHref] = useState("/search");
  const [keywordsText, setKeywordsText] = useState("search\nquery\nfind\nsite search");
  const [visibility, setVisibility] = useState<PortalSearchIndexVisibility>("public");
  const [sortOrder, setSortOrder] = useState("40");

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!canOperate) {
        return;
      }

      try {
        setLoading(true);
        onError(null);

        const response = await requestAdminSearchIndexList({
          scope: "admin",
          session,
        });

        if (!active) {
          return;
        }

        setItems(sortItems(response.data.items));
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Search index list could not be loaded.";

        onError(message);
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
  }, [canOperate, onError, session]);

  const handleSave = async () => {
    try {
      setBusy(true);
      onError(null);

      const keywords = keywordsText
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const parsedSortOrder = Number.parseInt(sortOrder || "0", 10);

      const response = await requestAdminSearchIndexUpsert({
        scope: "admin",
        session,
        code,
        kind,
        title,
        summary,
        href,
        keywords,
        visibility,
        sortOrder: Number.isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
      });

      setItems((prev) => {
        const filtered = prev.filter((item) => item.code !== response.data.item.code);
        return sortItems([...filtered, response.data.item]);
      });

      await onAuditRefresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Search index could not be saved.";

      onError(message);
    } finally {
      setBusy(false);
    }
  };

  if (!canOperate) {
    return null;
  }

  return (
    <section className="page-section">
      <h2 className="section-title">Search index control</h2>

      {loading ? (
        <article className="card">
          <p className="card-copy">Loading search index...</p>
        </article>
      ) : null}

      <article className="card">
        <div className="form-grid">
          <label className="field-block">
            <span className="label-text">Code</span>
            <input
              className="text-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="search"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Kind</span>
            <select
              className="select-input"
              value={kind}
              onChange={(event) => setKind(event.target.value as PortalSearchIndexKind)}
            >
              <option value="page">page</option>
              <option value="os">os</option>
              <option value="auth">auth</option>
              <option value="launcher">launcher</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Title</span>
            <input
              className="text-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Search"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Summary</span>
            <textarea
              className="text-area"
              rows={4}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Search summary"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Href</span>
            <input
              className="text-input"
              value={href}
              onChange={(event) => setHref(event.target.value)}
              placeholder="/search"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Keywords</span>
            <textarea
              className="text-area"
              rows={5}
              value={keywordsText}
              onChange={(event) => setKeywordsText(event.target.value)}
              placeholder="One keyword per line"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Visibility</span>
            <select
              className="select-input"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as PortalSearchIndexVisibility)
              }
            >
              <option value="public">public</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Sort order</span>
            <input
              className="text-input"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              placeholder="40"
            />
          </label>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="button-link"
            onClick={handleSave}
            disabled={busy}
          >
            {busy ? "Saving..." : "Save Search Index"}
          </button>
        </div>
      </article>

      <div className="grid-2">
        {items.map((item) => (
          <article key={item.id} className="card">
            <p className="eyebrow">{item.kind.toUpperCase()}</p>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-copy">{item.summary}</p>
            <div className="chip-row">
              <span className="chip">{item.visibility}</span>
              <span className="chip">sort:{item.sortOrder}</span>
              <span className="chip">{item.code}</span>
            </div>
            <p className="meta-text">{item.href}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
