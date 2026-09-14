"use client";

import { useEffect, useState } from "react";
import {
  requestAdminAssetManifestList,
  requestAdminAssetManifestUpsert,
} from "../../services/portal-api/asset-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAssetKind,
  PortalAssetManifestItem,
  PortalAssetVisibility,
} from "../../types/portal-asset-api";

type AdminAssetManifestPanelProps = {
  session: PortalSessionSummary;
  canOperate: boolean;
  onError: (message: string | null) => void;
  onAuditRefresh: () => Promise<void>;
};

const sortItems = (items: PortalAssetManifestItem[]): PortalAssetManifestItem[] =>
  [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.title.localeCompare(b.title);
  });

export function AdminAssetManifestPanel({
  session,
  canOperate,
  onError,
  onAuditRefresh,
}: AdminAssetManifestPanelProps) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<PortalAssetManifestItem[]>([]);

  const [code, setCode] = useState("portal-home-hero");
  const [kind, setKind] = useState<PortalAssetKind>("image");
  const [title, setTitle] = useState("Portal home hero");
  const [description, setDescription] = useState("Hero illustration for the portal home page.");
  const [sourceUrl, setSourceUrl] = useState("/portal-assets/portal-home-hero.svg");
  const [altText, setAltText] = useState("Civilization Portal hero illustration");
  const [fileLabel, setFileLabel] = useState("Open file");
  const [mimeType, setMimeType] = useState("image/svg+xml");
  const [visibility, setVisibility] = useState<PortalAssetVisibility>("public");
  const [sortOrder, setSortOrder] = useState("10");

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!canOperate) {
        return;
      }

      try {
        setLoading(true);
        onError(null);

        const response = await requestAdminAssetManifestList({
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
            : "Asset manifest list could not be loaded.";

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

      const parsedSortOrder = Number.parseInt(sortOrder || "0", 10);

      const response = await requestAdminAssetManifestUpsert({
        scope: "admin",
        session,
        code,
        kind,
        title,
        description,
        sourceUrl,
        altText: altText || undefined,
        fileLabel: fileLabel || undefined,
        mimeType: mimeType || undefined,
        visibility,
        usageScope: "cms",
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
          : "Asset manifest could not be saved.";

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
      <h2 className="section-title">Asset manifest control</h2>

      {loading ? (
        <article className="card">
          <p className="card-copy">Loading asset manifest...</p>
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
              placeholder="portal-home-hero"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Kind</span>
            <select
              className="select-input"
              value={kind}
              onChange={(event) => setKind(event.target.value as PortalAssetKind)}
            >
              <option value="image">image</option>
              <option value="file">file</option>
            </select>
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Title</span>
            <input
              className="text-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Asset title"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Description</span>
            <textarea
              className="text-area"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Asset description"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Source URL</span>
            <input
              className="text-input"
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="/portal-assets/portal-home-hero.svg"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Alt text</span>
            <input
              className="text-input"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Image alt text"
            />
          </label>

          <label className="field-block">
            <span className="label-text">File label</span>
            <input
              className="text-input"
              value={fileLabel}
              onChange={(event) => setFileLabel(event.target.value)}
              placeholder="Open file"
            />
          </label>

          <label className="field-block">
            <span className="label-text">MIME type</span>
            <input
              className="text-input"
              value={mimeType}
              onChange={(event) => setMimeType(event.target.value)}
              placeholder="image/svg+xml"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Visibility</span>
            <select
              className="select-input"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as PortalAssetVisibility)}
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
              placeholder="10"
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
            {busy ? "Saving..." : "Save Asset Manifest"}
          </button>
        </div>
      </article>

      <div className="grid-2">
        {items.map((item) => (
          <article key={item.id} className="card">
            <p className="eyebrow">{item.kind.toUpperCase()}</p>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-copy">{item.description}</p>
            <div className="chip-row">
              <span className="chip">{item.visibility}</span>
              <span className="chip">sort:{item.sortOrder}</span>
              <span className="chip">{item.code}</span>
            </div>
            <p className="meta-text">{item.sourceUrl}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
