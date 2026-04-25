"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_CONFIG } from "../../config/site";
import { ROUTES } from "../../lib/routing/routes";
import { getGatewaySessionSummary } from "../../services/civilization-auth/auth-gateway";
import { requestPublicMenuResolve } from "../../services/portal-api/navigation-client";
import type { PortalPageManifestItem } from "../../types/portal-navigation-api";

const FALLBACK_ITEMS: PortalPageManifestItem[] = [
  {
    id: "fallback-home",
    code: "home",
    title: "Home",
    href: ROUTES.home,
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 10,
    description: "Fallback home",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: "",
  },
  {
    id: "fallback-civilization",
    code: "civilization",
    title: "Civilization",
    href: ROUTES.civilization,
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 20,
    description: "Fallback civilization",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: "",
  },
  {
    id: "fallback-os",
    code: "os",
    title: "OS Catalog",
    href: ROUTES.osCatalog,
    placement: "header",
    audience: "public",
    visibility: "visible",
    sortOrder: 30,
    description: "Fallback os",
    requiresLogin: false,
    operatorOnly: false,
    lastUpdatedAt: "",
  },
];

export function GlobalHeader() {
  const [items, setItems] = useState<PortalPageManifestItem[]>(FALLBACK_ITEMS);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const session = getGatewaySessionSummary();
        const response = await requestPublicMenuResolve({
          placement: "header",
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
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-block">
          <Link href={ROUTES.home} className="brand-name">
            {SITE_CONFIG.name}
          </Link>
          <p className="brand-tagline">Official web entry for Civilization</p>
        </div>

        <nav className="nav-links" aria-label="Global navigation">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="nav-link">
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
