"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { CmsSectionRenderer } from "../../components/common/cms-section-renderer";
import { StatusMessage } from "../../components/feedback/status-message";
import { findSeedCmsPage } from "../../mocks/cms/seed-pages";
import { ROUTES } from "../../lib/routing/routes";
import { requestPublicCmsPageGet } from "../../services/portal-api/cms-client";
import type { PortalCmsPageDocument } from "../../types/portal-cms-api";

const FALLBACK_PAGE =
  findSeedCmsPage("guide") as PortalCmsPageDocument;

export function GuidePage() {
  const [pageDoc, setPageDoc] = useState<PortalCmsPageDocument>(FALLBACK_PAGE);
  const [cmsError, setCmsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const response = await requestPublicCmsPageGet({
          pageCode: "guide",
        });

        if (!active) {
          return;
        }

        setPageDoc(response.data.item);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "CMS page could not be loaded.";

        setCmsError(message);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow={pageDoc.eyebrow}
        title={pageDoc.title}
        description={pageDoc.description}
      />

      {cmsError ? (
        <StatusMessage
          title="CMS fallback active"
          message={cmsError}
          variant="warning"
        />
      ) : null}

      <CmsSectionRenderer sections={pageDoc.sections} />

      <section className="page-section">
        <article className="card">
          <div className="button-row">
            <Link href={ROUTES.login} className="button-link">
              Open Login Entry
            </Link>
            <Link href={ROUTES.launcher} className="secondary-link">
              Open Launcher
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
