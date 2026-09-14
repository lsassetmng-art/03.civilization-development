"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { CmsSectionRenderer } from "../../components/common/cms-section-renderer";
import { StatusMessage } from "../../components/feedback/status-message";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { findSeedCmsPage } from "../../mocks/cms/seed-pages";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { ROUTES, buildOsDetailRoute } from "../../lib/routing/routes";
import { requestPublicNoticesList } from "../../services/portal-api/content-client";
import { requestPublicCmsPageGet } from "../../services/portal-api/cms-client";
import type { PortalNoticeItem } from "../../types/portal-admin-api";
import type { PortalCmsPageDocument } from "../../types/portal-cms-api";

const FALLBACK_PAGE =
  findSeedCmsPage("home") as PortalCmsPageDocument;

export function HomePage() {
  const featured = useMemo(() => OS_CATALOG.filter((item) => item.featured), []);

  const [pageDoc, setPageDoc] = useState<PortalCmsPageDocument>(FALLBACK_PAGE);
  const [cmsError, setCmsError] = useState<string | null>(null);

  const [noticeItems, setNoticeItems] = useState<PortalNoticeItem[]>(
    HOME_NOTICES.map((item, index) => ({
      id: `fallback-notice-${index + 1}`,
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      level: item.level,
      visibility: "public",
      publishedOn: item.publishedOn,
      lastUpdatedAt: item.publishedOn,
    })),
  );
  const [noticeError, setNoticeError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const runCms = async () => {
      try {
        const response = await requestPublicCmsPageGet({
          pageCode: "home",
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

    const runNotices = async () => {
      try {
        const response = await requestPublicNoticesList({
          channel: "home",
        });

        if (!active) {
          return;
        }

        setNoticeItems(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Public notices could not be loaded.";

        setNoticeError(message);
      }
    };

    runCms();
    runNotices();

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

      <section className="hero-card">
        <div className="chip-row">
          <span className="chip">Public information</span>
          <span className="chip">Official OS links only</span>
          <span className="chip">Launcher-aware</span>
        </div>

        <p className="section-copy">
          {pageDoc.description}
        </p>

        <div className="button-row">
          <Link href={ROUTES.osCatalog} className="button-link">
            Explore OS Catalog
          </Link>
          <Link href={ROUTES.civilization} className="secondary-link">
            Read Civilization Overview
          </Link>
          <Link href={ROUTES.launcher} className="secondary-link">
            Open My Launcher
          </Link>
        </div>
      </section>

      {cmsError ? (
        <StatusMessage
          title="CMS fallback active"
          message={cmsError}
          variant="warning"
        />
      ) : null}

      <CmsSectionRenderer sections={pageDoc.sections} />

      <section className="page-section">
        <h2 className="section-title">Featured OS</h2>
        <div className="grid-3">
          {featured.map((item) => (
            <article key={item.code} className="card">
              <p className="eyebrow">{item.category}</p>
              <h3 className="card-title">{item.name}</h3>
              <p className="card-copy">{item.tagline}</p>
              <ul className="list">
                {item.heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="button-row">
                <Link href={buildOsDetailRoute(item.code)} className="button-link">
                  View Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {noticeError ? (
        <StatusMessage
          title="Notices fallback active"
          message={noticeError}
          variant="warning"
        />
      ) : null}

      <section className="page-section">
        <h2 className="section-title">Current Notices</h2>
        <div className="grid-3">
          {noticeItems.map((notice) => (
            <article key={notice.id} className="card">
              <p className="eyebrow">{notice.level.toUpperCase()}</p>
              <h3 className="card-title">{notice.title}</h3>
              <p className="card-copy">{notice.summary}</p>
              <p className="meta-text">Published: {notice.publishedOn}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
