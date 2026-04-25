"use client";

import { useEffect, useState } from "react";
import { requestAdminCmsPageList, requestAdminCmsPageUpsert } from "../../services/portal-api/cms-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalCmsBlockTone,
  PortalCmsPageDocument,
  PortalCmsSection,
} from "../../types/portal-cms-api";

type AdminCmsPagePanelProps = {
  session: PortalSessionSummary;
  canOperate: boolean;
  onError: (message: string | null) => void;
  onAuditRefresh: () => Promise<void>;
};

const sortPages = (items: PortalCmsPageDocument[]): PortalCmsPageDocument[] =>
  [...items].sort((a, b) => a.pageCode.localeCompare(b.pageCode));

export function AdminCmsPagePanel({
  session,
  canOperate,
  onError,
  onAuditRefresh,
}: AdminCmsPagePanelProps) {
  const [loading, setLoading] = useState(false);
  const [pageItems, setPageItems] = useState<PortalCmsPageDocument[]>([]);
  const [busy, setBusy] = useState(false);

  const [pageCode, setPageCode] = useState<"home" | "civilization" | "guide">("home");
  const [eyebrow, setEyebrow] = useState("Official Web Entry");
  const [title, setTitle] = useState("Civilization Portal Site");
  const [description, setDescription] = useState(
    "The official public entry for Civilization information, authentication guidance, OS catalog access, and post-login launcher routing.",
  );
  const [sectionOneTitle, setSectionOneTitle] = useState("Overview");
  const [sectionOneBody, setSectionOneBody] = useState(
    "Portal overview content",
  );
  const [sectionTwoTitle, setSectionTwoTitle] = useState("Highlights");
  const [sectionTwoItemsText, setSectionTwoItemsText] = useState(
    "Official web entry\nPortal-first navigation\nLauncher-aware routing",
  );
  const [calloutTitle, setCalloutTitle] = useState("Operator note");
  const [calloutBody, setCalloutBody] = useState(
    "Current operator-maintained message.",
  );
  const [calloutTone, setCalloutTone] = useState<PortalCmsBlockTone>("info");

  const [assetSectionTitle, setAssetSectionTitle] = useState("Asset references");
  const [imageAssetCode, setImageAssetCode] = useState("portal-home-hero");
  const [imageCaption, setImageCaption] = useState("Image slot caption");
  const [fileAssetCode, setFileAssetCode] = useState("portal-guide-reference");
  const [fileLabel, setFileLabel] = useState("Open reference file");

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!canOperate) {
        return;
      }

      try {
        setLoading(true);
        onError(null);

        const response = await requestAdminCmsPageList({
          scope: "admin",
          session,
        });

        if (!active) {
          return;
        }

        setPageItems(sortPages(response.data.items));
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "CMS page list could not be loaded.";

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

      const bulletItems = sectionTwoItemsText
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const sections: PortalCmsSection[] = [
        {
          id: `${pageCode}-section-1`,
          sectionCode: "section-1",
          title: sectionOneTitle,
          layout: "stack",
          blocks: [
            {
              kind: "paragraph",
              body: sectionOneBody,
            },
          ],
        },
        {
          id: `${pageCode}-section-2`,
          sectionCode: "section-2",
          title: sectionTwoTitle,
          layout: "grid-2",
          blocks: [
            {
              kind: "bullet_list",
              items: bulletItems,
            },
            {
              kind: "callout",
              title: calloutTitle,
              body: calloutBody,
              tone: calloutTone,
            },
          ],
        },
      ];

      const assetBlocks = [];
      if (imageAssetCode.trim() !== "") {
        assetBlocks.push({
          kind: "image_slot" as const,
          assetCode: imageAssetCode.trim(),
          caption: imageCaption,
        });
      }
      if (fileAssetCode.trim() !== "") {
        assetBlocks.push({
          kind: "file_reference" as const,
          assetCode: fileAssetCode.trim(),
          label: fileLabel,
        });
      }

      if (assetBlocks.length > 0) {
        sections.push({
          id: `${pageCode}-section-3`,
          sectionCode: "section-3",
          title: assetSectionTitle,
          layout: "grid-2",
          blocks: assetBlocks,
        });
      }

      const response = await requestAdminCmsPageUpsert({
        scope: "admin",
        session,
        pageCode,
        eyebrow,
        title,
        description,
        sections,
      });

      setPageItems((prev) => {
        const filtered = prev.filter((item) => item.pageCode !== response.data.item.pageCode);
        return sortPages([...filtered, response.data.item]);
      });

      await onAuditRefresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "CMS page could not be saved.";

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
      <h2 className="section-title">CMS page control</h2>

      {loading ? (
        <article className="card">
          <p className="card-copy">Loading CMS page documents...</p>
        </article>
      ) : null}

      <article className="card">
        <div className="form-grid">
          <label className="field-block">
            <span className="label-text">Page code</span>
            <select
              className="select-input"
              value={pageCode}
              onChange={(event) =>
                setPageCode(event.target.value as "home" | "civilization" | "guide")
              }
            >
              <option value="home">home</option>
              <option value="civilization">civilization</option>
              <option value="guide">guide</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Eyebrow</span>
            <input
              className="text-input"
              value={eyebrow}
              onChange={(event) => setEyebrow(event.target.value)}
              placeholder="Page eyebrow"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Title</span>
            <input
              className="text-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Page title"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Description</span>
            <textarea
              className="text-area"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Page description"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Section 1 title</span>
            <input
              className="text-input"
              value={sectionOneTitle}
              onChange={(event) => setSectionOneTitle(event.target.value)}
              placeholder="Section title"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Section 1 body</span>
            <textarea
              className="text-area"
              rows={4}
              value={sectionOneBody}
              onChange={(event) => setSectionOneBody(event.target.value)}
              placeholder="Paragraph body"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Section 2 title</span>
            <input
              className="text-input"
              value={sectionTwoTitle}
              onChange={(event) => setSectionTwoTitle(event.target.value)}
              placeholder="Highlights title"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Section 2 bullet items</span>
            <textarea
              className="text-area"
              rows={5}
              value={sectionTwoItemsText}
              onChange={(event) => setSectionTwoItemsText(event.target.value)}
              placeholder="One item per line"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Callout title</span>
            <input
              className="text-input"
              value={calloutTitle}
              onChange={(event) => setCalloutTitle(event.target.value)}
              placeholder="Callout title"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Callout tone</span>
            <select
              className="select-input"
              value={calloutTone}
              onChange={(event) => setCalloutTone(event.target.value as PortalCmsBlockTone)}
            >
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="success">success</option>
            </select>
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Callout body</span>
            <textarea
              className="text-area"
              rows={4}
              value={calloutBody}
              onChange={(event) => setCalloutBody(event.target.value)}
              placeholder="Callout body"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Asset section title</span>
            <input
              className="text-input"
              value={assetSectionTitle}
              onChange={(event) => setAssetSectionTitle(event.target.value)}
              placeholder="Asset references"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Image asset code</span>
            <input
              className="text-input"
              value={imageAssetCode}
              onChange={(event) => setImageAssetCode(event.target.value)}
              placeholder="portal-home-hero"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Image caption</span>
            <input
              className="text-input"
              value={imageCaption}
              onChange={(event) => setImageCaption(event.target.value)}
              placeholder="Image caption"
            />
          </label>

          <label className="field-block">
            <span className="label-text">File asset code</span>
            <input
              className="text-input"
              value={fileAssetCode}
              onChange={(event) => setFileAssetCode(event.target.value)}
              placeholder="portal-guide-reference"
            />
          </label>

          <label className="field-block">
            <span className="label-text">File label</span>
            <input
              className="text-input"
              value={fileLabel}
              onChange={(event) => setFileLabel(event.target.value)}
              placeholder="Open reference file"
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
            {busy ? "Saving..." : "Save CMS Page"}
          </button>
        </div>
      </article>

      <div className="grid-2">
        {pageItems.map((item) => (
          <article key={item.id} className="card">
            <p className="eyebrow">{item.pageCode.toUpperCase()}</p>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-copy">{item.description}</p>
            <div className="chip-row">
              <span className="chip">sections:{item.sections.length}</span>
            </div>
            <p className="meta-text">Updated: {item.lastUpdatedAt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
