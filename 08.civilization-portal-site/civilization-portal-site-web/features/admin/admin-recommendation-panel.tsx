"use client";

import { useEffect, useState } from "react";
import {
  requestAdminRecommendationRuleList,
  requestAdminRecommendationRuleUpsert,
} from "../../services/portal-api/recommendation-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalRecommendationAnchorPage,
  PortalRecommendationAudience,
  PortalRecommendationRule,
  PortalRecommendationTargetKind,
  PortalRecommendationVisibility,
} from "../../types/portal-recommendation-api";

type AdminRecommendationPanelProps = {
  session: PortalSessionSummary;
  canOperate: boolean;
  onError: (message: string | null) => void;
  onAuditRefresh: () => Promise<void>;
};

const sortItems = (items: PortalRecommendationRule[]): PortalRecommendationRule[] =>
  [...items].sort((a, b) => {
    if (a.anchorPage !== b.anchorPage) {
      return a.anchorPage.localeCompare(b.anchorPage);
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title);
  });

export function AdminRecommendationPanel({
  session,
  canOperate,
  onError,
  onAuditRefresh,
}: AdminRecommendationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<PortalRecommendationRule[]>([]);

  const [code, setCode] = useState("recommend-search-guide");
  const [anchorPage, setAnchorPage] =
    useState<PortalRecommendationAnchorPage>("search");
  const [targetKind, setTargetKind] =
    useState<PortalRecommendationTargetKind>("page");
  const [title, setTitle] = useState("Guide");
  const [summary, setSummary] = useState(
    "Use the guide when you want a step-by-step explanation.",
  );
  const [href, setHref] = useState("/guide");
  const [audience, setAudience] =
    useState<PortalRecommendationAudience>("public");
  const [keywordsText, setKeywordsText] = useState(
    "guide\nhowto\nsteps\nauth\nlauncher",
  );
  const [featured, setFeatured] = useState(true);
  const [priority, setPriority] = useState("10");
  const [visibility, setVisibility] =
    useState<PortalRecommendationVisibility>("visible");

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!canOperate) {
        return;
      }

      try {
        setLoading(true);
        onError(null);

        const response = await requestAdminRecommendationRuleList({
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
            : "Recommendation rule list could not be loaded.";

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

      const keywordItems = keywordsText
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const parsedPriority = Number.parseInt(priority || "0", 10);

      const response = await requestAdminRecommendationRuleUpsert({
        scope: "admin",
        session,
        code,
        anchorPage,
        targetKind,
        title,
        summary,
        href,
        audience,
        keywords: keywordItems,
        featured,
        priority: Number.isNaN(parsedPriority) ? 0 : parsedPriority,
        visibility,
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
          : "Recommendation rule could not be saved.";

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
      <h2 className="section-title">Recommendation rule control</h2>

      {loading ? (
        <article className="card">
          <p className="card-copy">Loading recommendation rules...</p>
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
              placeholder="recommend-search-guide"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Anchor page</span>
            <select
              className="select-input"
              value={anchorPage}
              onChange={(event) =>
                setAnchorPage(event.target.value as PortalRecommendationAnchorPage)
              }
            >
              <option value="home">home</option>
              <option value="search">search</option>
              <option value="launcher">launcher</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Target kind</span>
            <select
              className="select-input"
              value={targetKind}
              onChange={(event) =>
                setTargetKind(event.target.value as PortalRecommendationTargetKind)
              }
            >
              <option value="page">page</option>
              <option value="os">os</option>
              <option value="auth">auth</option>
              <option value="launcher">launcher</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Audience</span>
            <select
              className="select-input"
              value={audience}
              onChange={(event) =>
                setAudience(event.target.value as PortalRecommendationAudience)
              }
            >
              <option value="public">public</option>
              <option value="member">member</option>
              <option value="operator">operator</option>
            </select>
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Title</span>
            <input
              className="text-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Guide"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Summary</span>
            <textarea
              className="text-area"
              rows={4}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Recommendation summary"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Href</span>
            <input
              className="text-input"
              value={href}
              onChange={(event) => setHref(event.target.value)}
              placeholder="/guide"
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
            <span className="label-text">Priority</span>
            <input
              className="text-input"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              placeholder="10"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Visibility</span>
            <select
              className="select-input"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as PortalRecommendationVisibility)
              }
            >
              <option value="visible">visible</option>
              <option value="hidden">hidden</option>
            </select>
          </label>

          <label className="field-block checkbox-field">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
            <span className="label-text">Featured</span>
          </label>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="button-link"
            onClick={handleSave}
            disabled={busy}
          >
            {busy ? "Saving..." : "Save Recommendation Rule"}
          </button>
        </div>
      </article>

      <div className="grid-2">
        {items.map((item) => (
          <article key={item.id} className="card">
            <p className="eyebrow">
              {item.anchorPage.toUpperCase()} / {item.targetKind.toUpperCase()}
            </p>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-copy">{item.summary}</p>
            <div className="chip-row">
              <span className="chip">{item.audience}</span>
              <span className="chip">priority:{item.priority}</span>
              <span className="chip">{item.visibility}</span>
              {item.featured ? <span className="chip">featured</span> : null}
            </div>
            <p className="meta-text">{item.href}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
