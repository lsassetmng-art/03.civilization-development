"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { ROUTES, buildOsDetailRoute } from "../../lib/routing/routes";
import { requestPublicNoticesList } from "../../services/portal-api/content-client";
import type { PortalNoticeItem } from "../../types/portal-admin-api";

export function HomePage() {
  const featured = useMemo(() => OS_CATALOG.filter((item) => item.featured), []);
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

    const run = async () => {
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

    run();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Official Web Entry"
        title="Civilization Portal Site"
        description="The official public entry for Civilization information, authentication guidance, OS catalog access, and post-login launcher routing."
      />

      <section className="hero-card">
        <div className="chip-row">
          <span className="chip">Public information</span>
          <span className="chip">Official OS links only</span>
          <span className="chip">Launcher-aware</span>
        </div>

        <p className="section-copy">
          This portal is the only official web entry to Civilization OS destinations.
          Sign-up and authentication remain owned by CivilizationOS, while this portal
          owns the public explanation layer, official OS introduction, and launcher-side
          entry routing.
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
