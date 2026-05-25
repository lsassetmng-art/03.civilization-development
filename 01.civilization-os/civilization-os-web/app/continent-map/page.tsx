"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import { t } from "@/lib/i18n";
import { withPortalLanguage } from "@/lib/portal-context";
import { getContinentByCode, type ContinentCode } from "@/lib/map-data";

function isContinentCode(value: string | null): value is ContinentCode {
  return value === "north-continent" || value === "central-continent" || value === "south-continent";
}

export default function ContinentMapPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;
  const [continentCode, setContinentCode] = useState<ContinentCode>("north-continent");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("continent");

    if (isContinentCode(requested)) {
      setContinentCode(requested);
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }, []);

  const selected = getContinentByCode(locale, continentCode);

  return (
    <AppShell locale={locale} title={t(locale, "map.continent.title")}>
      <section className="landscape-frame" aria-label="continent-map">
        <div className="landscape-left">
          <div className="continent-image-card is-active">
            <span className="continent-visual-symbol">{selected.shortLabel}</span>
            <span className="continent-visual-text">{selected.visualLabel}</span>
            <span className="continent-visual-note">{selected.landscapeNote}</span>
          </div>
        </div>

        <div className="landscape-right">
          <p className="kicker">continent-map</p>
          <h1>{selected.label}</h1>
          <p>{t(locale, "map.continent.description")}</p>

          <div className="route-grid">
            {["Capital Area", "Coastal Area", "Mountain Area"].map((name) => (
              <Link key={name} href={withPortalLanguage("/city-map", locale)} className="route-card">
                <strong>{name}</strong>
                <p>city-map</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
