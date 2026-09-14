"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusMessage } from "../feedback/status-message";
import { requestPublicAssetManifestList } from "../../services/portal-api/asset-client";
import type {
  PortalCmsBlock,
  PortalCmsSection,
} from "../../types/portal-cms-api";
import type { PortalAssetManifestItem } from "../../types/portal-asset-api";

type CmsSectionRendererProps = {
  sections: PortalCmsSection[];
};

export function CmsSectionRenderer({
  sections,
}: CmsSectionRendererProps) {
  const [assets, setAssets] = useState<PortalAssetManifestItem[]>([]);
  const [assetError, setAssetError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const response = await requestPublicAssetManifestList({
          usageScope: "cms",
        });

        if (!active) {
          return;
        }

        setAssets(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Asset manifest could not be loaded.";

        setAssetError(message);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  const assetMap = useMemo(
    () => new Map(assets.map((item) => [item.code, item])),
    [assets],
  );

  const renderBlock = (block: PortalCmsBlock, key: string) => {
    if (block.kind === "paragraph") {
      return (
        <article key={key} className="card">
          <p className="section-copy">{block.body}</p>
        </article>
      );
    }

    if (block.kind === "bullet_list") {
      return (
        <article key={key} className="card">
          <ul className="list">
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      );
    }

    if (block.kind === "callout") {
      return (
        <div key={key}>
          <StatusMessage
            title={block.title}
            message={block.body}
            variant={block.tone}
          />
        </div>
      );
    }

    if (block.kind === "image_slot") {
      const asset = assetMap.get(block.assetCode);

      if (!asset || asset.kind !== "image") {
        return (
          <article key={key} className="card">
            <p className="card-title">Missing image asset</p>
            <p className="card-copy">{block.assetCode}</p>
          </article>
        );
      }

      return (
        <article key={key} className="card">
          <div className="asset-image-wrap">
            <img
              src={asset.sourceUrl}
              alt={asset.altText || asset.title}
              className="asset-image"
            />
          </div>
          <h3 className="card-title">{asset.title}</h3>
          <p className="card-copy">{block.caption || asset.description}</p>
        </article>
      );
    }

    const asset = assetMap.get(block.assetCode);

    if (!asset || asset.kind !== "file") {
      return (
        <article key={key} className="card">
          <p className="card-title">Missing file asset</p>
          <p className="card-copy">{block.assetCode}</p>
        </article>
      );
    }

    return (
      <article key={key} className="card">
        <h3 className="card-title">{asset.title}</h3>
        <p className="card-copy">{asset.description}</p>
        <div className="button-row asset-file-actions">
          <Link href={asset.sourceUrl} className="button-link" target="_blank">
            {block.label || asset.fileLabel || "Open file"}
          </Link>
        </div>
      </article>
    );
  };

  return (
    <>
      {assetError ? (
        <StatusMessage
          title="Asset fallback active"
          message={assetError}
          variant="warning"
        />
      ) : null}

      {sections.map((section) => (
        <section key={section.id} className="page-section">
          <h2 className="section-title">{section.title}</h2>
          <div className={section.layout === "grid-2" ? "grid-2" : "stack"}>
            {section.blocks.map((block, index) =>
              renderBlock(block, `${section.id}-${index}`),
            )}
          </div>
        </section>
      ))}
    </>
  );
}
