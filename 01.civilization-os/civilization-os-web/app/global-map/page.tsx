"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import { t } from "@/lib/i18n";
import { withPortalLanguage } from "@/lib/portal-context";
import { getGlobalMapContinents, type ContinentCode } from "@/lib/map-data";

export default function GlobalMapPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;
  const continents = useMemo(() => getGlobalMapContinents(locale), [locale]);
  const [selectedCode, setSelectedCode] = useState<ContinentCode>("north-continent");
  const selected = continents.find((continent) => continent.code === selectedCode) ?? continents[0];

  function proceedToContinentMap() {
    window.location.href = withPortalLanguage(selected.href, locale);
  }

  return (
    <AppShell locale={locale} title={t(locale, "map.global.title")}>
      <section className="landscape-frame" aria-label="global-map">
        <div className="landscape-left" aria-label="continent-selector">
          {continents.map((continent) => {
            const active = continent.code === selected.code;

            return (
              <button
                key={continent.code}
                type="button"
                className={`continent-image-card ${active ? "is-active" : ""}`}
                onClick={() => {
                  if (active) {
                    proceedToContinentMap();
                    return;
                  }

                  setSelectedCode(continent.code);
                }}
                aria-pressed={active}
              >
                <span className="continent-visual-symbol">{continent.shortLabel}</span>
                <span className="continent-visual-text">{continent.visualLabel}</span>
                <span className="continent-visual-note">{continent.landscapeNote}</span>
              </button>
            );
          })}
        </div>

        <div className="landscape-right" aria-label="continent-description">
          <p className="kicker">global-map</p>
          <h1>{selected.label}</h1>
          <p>{selected.description}</p>

          <div className="notice">
            左の大陸画像を選択すると枠色が反転します。選択中の大陸をもう一度タップすると、各大陸マップへ進みます。
          </div>

          <button type="button" onClick={proceedToContinentMap}>
            {t(locale, "common.next")}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
