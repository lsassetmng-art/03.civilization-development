"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NotificationCard } from "../../components/common/notification-card";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { RecommendationCard } from "../../components/common/recommendation-card";
import { StatusMessage } from "../../components/feedback/status-message";
import { ROUTES, buildOsDetailRoute } from "../../lib/routing/routes";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { getGatewaySessionSummary } from "../../services/civilization-auth/auth-gateway";
import { requestPublicAnalyticsEventAppend } from "../../services/portal-api/analytics-client";
import { requestPublicNotificationCenterGet } from "../../services/portal-api/notification-client";
import { requestPublicRecommendationResolve } from "../../services/portal-api/recommendation-client";
import type { PortalNotificationCenterItem } from "../../types/portal-notification-api";
import type { PortalResolvedRecommendationItem } from "../../types/portal-recommendation-api";

export function HomePage() {
  const featured = useMemo(
    () => OS_CATALOG.filter((item) => item.featured).slice(0, 3),
    [],
  );

  const [bannerItems, setBannerItems] = useState<PortalNotificationCenterItem[]>([]);
  const [announcementItems, setAnnouncementItems] = useState<PortalNotificationCenterItem[]>([]);
  const [recommendations, setRecommendations] = useState<
    PortalResolvedRecommendationItem[]
  >([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  useEffect(() => {
    const currentSession = getGatewaySessionSummary();

    requestPublicAnalyticsEventAppend({
      session: currentSession,
      surface: "home",
      action: "page_view",
      targetCode: "home",
      targetTitle: "Home",
      targetKind: "page",
      metadata: "analytics_home_page_view",
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    let active = true;

    const runNotifications = async () => {
      try {
        const session = getGatewaySessionSummary();
        const response = await requestPublicNotificationCenterGet({
          surface: "home",
          session,
          limit: 6,
        });

        if (!active) {
          return;
        }

        setBannerItems(response.data.bannerItems);
        setAnnouncementItems(response.data.announcementItems);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Notifications could not be loaded.";
        setNotificationError(message);
      }
    };

    const runRecommendations = async () => {
      try {
        const session = getGatewaySessionSummary();
        const response = await requestPublicRecommendationResolve({
          anchorPage: "home",
          session,
          limit: 6,
        });

        if (!active) {
          return;
        }

        setRecommendations(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Recommendations could not be loaded.";
        setRecommendationError(message);
      }
    };

    runNotifications();
    runRecommendations();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Civilization Portal"
        title="Portal home"
        description="Compile-safe normalized home page for official public entry, support routing, featured OS access, and portal recommendations."
      />

      <section className="hero-card">
        <div className="chip-row">
          <span className="chip">Public information</span>
          <span className="chip">Official entry</span>
          <span className="chip">Launcher-aware</span>
        </div>

        <p className="section-copy">
          Start here to browse official OS entries, review support resources,
          and continue through the portal and launcher flow.
        </p>

        <div className="button-row">
          <Link href={ROUTES.osCatalog} className="button-link">
            Explore OS Catalog
          </Link>
          <Link href={ROUTES.guide} className="secondary-link">
            Read Guide
          </Link>
          <Link href={ROUTES.launcher} className="secondary-link">
            Open Launcher
          </Link>
        </div>
      </section>

      {notificationError ? (
        <StatusMessage
          title="Notification fallback active"
          message={notificationError}
          variant="warning"
        />
      ) : null}

      {recommendationError ? (
        <StatusMessage
          title="Recommendation fallback active"
          message={recommendationError}
          variant="warning"
        />
      ) : null}

      <section className="page-section">
        <h2 className="section-title">Active banners</h2>
        {bannerItems.length === 0 ? (
          <article className="card">
            <p className="card-copy">No active banner is currently available.</p>
          </article>
        ) : (
          <div className="grid-2">
            {bannerItems.map((item) => (
              <NotificationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <h2 className="section-title">Announcements</h2>
        {announcementItems.length === 0 ? (
          <article className="card">
            <p className="card-copy">No announcement is currently pending.</p>
          </article>
        ) : (
          <div className="grid-2">
            {announcementItems.map((item) => (
              <NotificationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <h2 className="section-title">Recommended entries</h2>
        {recommendations.length === 0 ? (
          <article className="card">
            <p className="card-copy">No recommendation is currently available.</p>
          </article>
        ) : (
          <div className="grid-2">
            {recommendations.map((item) => (
              <RecommendationCard key={item.code} item={item} />
            ))}
          </div>
        )}
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

      <section className="page-section">
        <h2 className="section-title">Support entry</h2>
        <div className="grid-2">
          <article className="card">
            <p className="eyebrow">HELP</p>
            <h3 className="card-title">Need guidance?</h3>
            <p className="card-copy">
              Open help, policy, terms, or contact to review approved support resources.
            </p>
            <div className="button-row">
              <Link href={ROUTES.help} className="button-link">
                Open Help
              </Link>
              <Link href={ROUTES.contact} className="secondary-link">
                Contact Support
              </Link>
            </div>
          </article>

          <article className="card">
            <p className="eyebrow">POLICY</p>
            <h3 className="card-title">Review policies and terms</h3>
            <p className="card-copy">
              Read privacy, support handling, terms of use, and operational conditions.
            </p>
            <div className="button-row">
              <Link href={ROUTES.policy} className="button-link">
                Open Policy
              </Link>
              <Link href={ROUTES.terms} className="secondary-link">
                Open Terms
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section">
        <h2 className="section-title">Current notices</h2>
        <div className="grid-3">
          {HOME_NOTICES.map((notice) => (
            <article key={notice.slug} className="card">
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
