"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "../../config/site";
import { getGatewaySessionSummary } from "../../services/civilization-auth/auth-gateway";
import { requestPublicMenuResolve } from "../../services/portal-api/navigation-client";
import type { PortalPageManifestItem } from "../../types/portal-navigation-api";

export function GlobalFooter() {
  const [items, setItems] = useState<PortalPageManifestItem[]>([]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const session = getGatewaySessionSummary();
        const response = await requestPublicMenuResolve({
          placement: "footer",
          session,
        });

        if (!active) {
          return;
        }

        setItems(response.data.items);
      } catch {
        return;
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-title">{SITE_CONFIG.name}</p>
          <p className="footer-copy">
            Public information, authentication guidance, official OS entry, and launcher access.
          </p>
        </div>

        <div className="footer-links">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="footer-link">
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
