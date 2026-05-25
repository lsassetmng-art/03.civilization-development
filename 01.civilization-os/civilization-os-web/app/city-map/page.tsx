"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import { t } from "@/lib/i18n";
import { withPortalLanguage } from "@/lib/portal-context";

export default function CityMapPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;

  return (
    <AppShell locale={locale}>
      <section className="card">
        <p className="kicker">city-map</p>
        <h1>{t(locale, "map.city.title")}</h1>
        <p>{t(locale, "map.city.description")}</p>

        <div className="route-grid">
          {["District", "Facility", "Builder Routes"].map((name) => (
            <Link key={name} href={withPortalLanguage("/city-map", locale)} className="route-card">
              <strong>{name}</strong>
              <p>next phase route</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
