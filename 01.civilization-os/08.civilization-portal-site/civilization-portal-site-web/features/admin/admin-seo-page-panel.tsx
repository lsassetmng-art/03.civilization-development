"use client";

import { useEffect, useState } from "react";
import { requestAdminSeoPageList, requestAdminSeoPageUpsert } from "../../services/portal-api/seo-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalSeoPageDescriptor,
  PortalSeoPageCode,
  PortalStructuredPageType,
} from "../../types/portal-seo-api";

type AdminSeoPagePanelProps = {
  session: PortalSessionSummary;
  canOperate: boolean;
  onError: (message: string | null) => void;
  onAuditRefresh: () => Promise<void>;
};

const sortItems = (items: PortalSeoPageDescriptor[]): PortalSeoPageDescriptor[] =>
  [...items].sort((a, b) => a.pageCode.localeCompare(b.pageCode));

export function AdminSeoPagePanel({
  session,
  canOperate,
  onError,
  onAuditRefresh,
}: AdminSeoPagePanelProps) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<PortalSeoPageDescriptor[]>([]);

  const [pageCode, setPageCode] = useState<PortalSeoPageCode>("home");
  const [pageTitle, setPageTitle] = useState("Civilization Portal Site");
  const [metaDescription, setMetaDescription] = useState(
    "Official public entry for Civilization information, authentication guidance, OS catalog access, and launcher-aware routing.",
  );
  const [canonicalPath, setCanonicalPath] = useState("/");
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [ogTitle, setOgTitle] = useState("Civilization Portal Site");
  const [ogDescription, setOgDescription] = useState(
    "Official public entry for Civilization information, authentication guidance, OS catalog access, and launcher-aware routing.",
  );
  const [ogImageAssetCode, setOgImageAssetCode] = useState("portal-home-hero");
  const [structuredType, setStructuredType] = useState<PortalStructuredPageType>("WebPage");
  const [structuredName, setStructuredName] = useState("Civilization Portal Site");
  const [structuredDescription, setStructuredDescription] = useState(
    "Official public entry for Civilization information, authentication guidance, OS catalog access, and launcher-aware routing.",
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!canOperate) {
        return;
      }

      try {
        setLoading(true);
        onError(null);

        const response = await requestAdminSeoPageList({
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
            : "SEO page list could not be loaded.";

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

      const response = await requestAdminSeoPageUpsert({
        scope: "admin",
        session,
        pageCode,
        pageTitle,
        metaDescription,
        canonicalPath,
        robotsIndex,
        robotsFollow,
        ogTitle,
        ogDescription,
        ogImageAssetCode: ogImageAssetCode || undefined,
        structuredType,
        structuredName,
        structuredDescription,
      });

      setItems((prev) => {
        const filtered = prev.filter((item) => item.pageCode !== response.data.item.pageCode);
        return sortItems([...filtered, response.data.item]);
      });

      await onAuditRefresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "SEO page descriptor could not be saved.";

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
      <h2 className="section-title">SEO page descriptor control</h2>

      {loading ? (
        <article className="card">
          <p className="card-copy">Loading SEO page descriptors...</p>
        </article>
      ) : null}

      <article className="card">
        <div className="form-grid">
          <label className="field-block">
            <span className="label-text">Page code</span>
            <select
              className="select-input"
              value={pageCode}
              onChange={(event) => setPageCode(event.target.value as PortalSeoPageCode)}
            >
              <option value="home">home</option>
              <option value="civilization">civilization</option>
              <option value="guide">guide</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Page title</span>
            <input
              className="text-input"
              value={pageTitle}
              onChange={(event) => setPageTitle(event.target.value)}
              placeholder="Page title"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Meta description</span>
            <textarea
              className="text-area"
              rows={4}
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              placeholder="Meta description"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Canonical path</span>
            <input
              className="text-input"
              value={canonicalPath}
              onChange={(event) => setCanonicalPath(event.target.value)}
              placeholder="/guide"
            />
          </label>

          <label className="field-block">
            <span className="label-text">OG image asset code</span>
            <input
              className="text-input"
              value={ogImageAssetCode}
              onChange={(event) => setOgImageAssetCode(event.target.value)}
              placeholder="portal-home-hero"
            />
          </label>

          <label className="field-block">
            <span className="label-text">OG title</span>
            <input
              className="text-input"
              value={ogTitle}
              onChange={(event) => setOgTitle(event.target.value)}
              placeholder="OG title"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">OG description</span>
            <textarea
              className="text-area"
              rows={4}
              value={ogDescription}
              onChange={(event) => setOgDescription(event.target.value)}
              placeholder="OG description"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Structured type</span>
            <select
              className="select-input"
              value={structuredType}
              onChange={(event) =>
                setStructuredType(event.target.value as PortalStructuredPageType)
              }
            >
              <option value="WebPage">WebPage</option>
              <option value="AboutPage">AboutPage</option>
              <option value="HowToPage">HowToPage</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Structured name</span>
            <input
              className="text-input"
              value={structuredName}
              onChange={(event) => setStructuredName(event.target.value)}
              placeholder="Structured data name"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Structured description</span>
            <textarea
              className="text-area"
              rows={4}
              value={structuredDescription}
              onChange={(event) => setStructuredDescription(event.target.value)}
              placeholder="Structured data description"
            />
          </label>

          <label className="field-block checkbox-field">
            <input
              type="checkbox"
              checked={robotsIndex}
              onChange={(event) => setRobotsIndex(event.target.checked)}
            />
            <span className="label-text">Robots index</span>
          </label>

          <label className="field-block checkbox-field">
            <input
              type="checkbox"
              checked={robotsFollow}
              onChange={(event) => setRobotsFollow(event.target.checked)}
            />
            <span className="label-text">Robots follow</span>
          </label>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="button-link"
            onClick={handleSave}
            disabled={busy}
          >
            {busy ? "Saving..." : "Save SEO Descriptor"}
          </button>
        </div>
      </article>

      <div className="grid-2">
        {items.map((item) => (
          <article key={item.id} className="card">
            <p className="eyebrow">{item.pageCode.toUpperCase()}</p>
            <h3 className="card-title">{item.pageTitle}</h3>
            <p className="card-copy">{item.metaDescription}</p>
            <div className="chip-row">
              <span className="chip">{item.structuredType}</span>
              <span className="chip">{item.canonicalPath}</span>
              {item.robotsIndex ? <span className="chip">index</span> : <span className="chip">noindex</span>}
              {item.robotsFollow ? <span className="chip">follow</span> : <span className="chip">nofollow</span>}
            </div>
            <p className="meta-text">Updated: {item.lastUpdatedAt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
