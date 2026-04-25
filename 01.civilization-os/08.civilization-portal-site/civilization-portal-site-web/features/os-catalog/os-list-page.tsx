"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { buildOsDetailRoute } from "../../lib/routing/routes";
import { requestPublicListingList } from "../../services/portal-api/content-client";
import type { PortalListingItem } from "../../types/portal-admin-api";

const formatAvailability = (value: string): string =>
  value.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatAccessLevel = (value: string): string =>
  value.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export function OsListPage() {
  const [listingItems, setListingItems] = useState<PortalListingItem[]>(
    OS_CATALOG.map((os, index) => ({
      id: `fallback-listing-${index + 1}`,
      osCode: os.code,
      name: os.name,
      category: os.category,
      visibility: "listed",
      featured: os.featured,
      badge: os.featured ? "featured" : "",
      sortOrder: index + 1,
      lastUpdatedAt: new Date().toISOString(),
    })),
  );
  const [listingError, setListingError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const response = await requestPublicListingList({
          catalog: "os",
        });

        if (!active) {
          return;
        }

        setListingItems(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Public OS listing could not be loaded.";

        setListingError(message);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    const listingMap = new Map(listingItems.map((item) => [item.osCode, item]));

    return OS_CATALOG
      .map((os) => {
        const listing = listingMap.get(os.code);
        if (!listing) {
          return null;
        }

        if (listing.visibility === "hidden") {
          return null;
        }

        return {
          os,
          listing,
        };
      })
      .filter(
        (
          item,
        ): item is {
          os: (typeof OS_CATALOG)[number];
          listing: PortalListingItem;
        } => Boolean(item),
      )
      .sort((a, b) => a.listing.sortOrder - b.listing.sortOrder);
  }, [listingItems]);

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="OS Catalog"
        title="Official OS entry directory"
        description="The portal holds the only official web links for OS entry. Each OS detail page explains access conditions before launch."
      />

      {listingError ? (
        <StatusMessage
          title="Catalog fallback active"
          message={listingError}
          variant="warning"
        />
      ) : null}

      <section className="page-section">
        <div className="grid-3">
          {items.map(({ os, listing }) => (
            <article key={os.code} className="card">
              <p className="eyebrow">{os.category}</p>
              <h2 className="card-title">{os.name}</h2>
              <p className="card-copy">{os.summary}</p>

              <div className="chip-row">
                <span className="chip">{formatAvailability(os.availability)}</span>
                <span className="chip">{formatAccessLevel(os.accessLevel)}</span>
                {listing.badge ? <span className="chip">{listing.badge}</span> : null}
              </div>

              <ul className="list">
                {os.heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="button-row">
                <Link href={buildOsDetailRoute(os.code)} className="button-link">
                  Open Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
