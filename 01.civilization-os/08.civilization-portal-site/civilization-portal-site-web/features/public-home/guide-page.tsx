"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { CmsSectionRenderer } from "../../components/common/cms-section-renderer";
import { StructuredDataScript } from "../../components/common/structured-data-script";
import { StatusMessage } from "../../components/feedback/status-message";
import { findSeedCmsPage } from "../../mocks/cms/seed-pages";
import { findSeedSeoPage } from "../../mocks/seo/seed-page-seo";
import { ROUTES } from "../../lib/routing/routes";
import { buildStructuredDataFromSeoDescriptor } from "../../lib/seo/structured-data";
import { requestPublicCmsPageGet } from "../../services/portal-api/cms-client";
import { requestPublicSeoPageGet } from "../../services/portal-api/seo-client";
import type { PortalCmsPageDocument } from "../../types/portal-cms-api";
import type { PortalSeoPageDescriptor } from "../../types/portal-seo-api";

const FALLBACK_PAGE =
  findSeedCmsPage("guide") as PortalCmsPageDocument;
const FALLBACK_SEO =
  findSeedSeoPage("guide") as PortalSeoPageDescriptor;

export function GuidePage() {
  const [pageDoc, setPageDoc] = useState<PortalCmsPageDocument>(FALLBACK_PAGE);
  const [seoDoc, setSeoDoc] = useState<PortalSeoPageDescriptor>(FALLBACK_SEO);
  const [cmsError, setCmsError] = useState<string | null>(null);
  const [seoError, setSeoError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const runCms = async () => {
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

    const runSeo = async () => {
      try {
        const response = await requestPublicSeoPageGet({
          pageCode: "guide",
        });

        if (!active) {
          return;
        }

        setSeoDoc(response.data.item);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "SEO descriptor could not be loaded.";

        setSeoError(message);
      }
    };

    runCms();
    runSeo();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <StructuredDataScript
        data={buildStructuredDataFromSeoDescriptor(seoDoc)}
      />

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

      {seoError ? (
        <StatusMessage
          title="SEO fallback active"
          message={seoError}
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
