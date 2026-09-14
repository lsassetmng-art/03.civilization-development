"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { ROUTES } from "../../lib/routing/routes";
import { requestPublicMaintenanceList } from "../../services/portal-api/content-client";
import type { PortalMaintenanceItem } from "../../types/portal-admin-api";

export default function Page() {
  const [items, setItems] = useState<PortalMaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await requestPublicMaintenanceList({
          targetScope: "portal",
        });

        if (!active) {
          return;
        }

        setItems(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Public maintenance state could not be loaded.";

        setErrorMessage(message);
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
  }, []);

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="System State"
        title="Maintenance in progress"
        description="The requested route is currently protected by portal maintenance handling."
      />

      {loading ? (
        <StatusMessage
          title="Loading maintenance state"
          message="Reading the current public maintenance payload."
          variant="info"
        />
      ) : null}

      {errorMessage ? (
        <StatusMessage
          title="Unable to load maintenance state"
          message={errorMessage}
          variant="danger"
        />
      ) : null}

      <section className="page-section">
        <article className="card">
          <p className="section-copy">
            Portal-side entry decisions can reroute requests here when an OS is temporarily unavailable.
          </p>
          <div className="button-row">
            <Link href={ROUTES.home} className="button-link">
              Return Home
            </Link>
            <Link href={ROUTES.osCatalog} className="secondary-link">
              Browse Other OS
            </Link>
          </div>
        </article>
      </section>

      <section className="page-section">
        <h2 className="section-title">Active maintenance targets</h2>
        {items.length === 0 ? (
          <article className="card">
            <p className="card-copy">No active maintenance targets are currently published.</p>
          </article>
        ) : (
          <div className="grid-2">
            {items.map((item) => (
              <article key={item.id} className="card">
                <p className="eyebrow">
                  {item.targetType.toUpperCase()} / {item.targetCode}
                </p>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-copy">{item.message}</p>
                <p className="meta-text">Updated: {item.lastUpdatedAt}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
