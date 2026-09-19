"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import { t } from "@/lib/i18n";
import {
  getContinentByCode,
  getR11ContinentNationEntries,
  isR11ContinentCode,
  type R11ContinentCode,
} from "@/lib/map-data";
import { withPortalLanguage } from "@/lib/portal-context";

export default function ContinentMapPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;

  const [continentCode, setContinentCode] =
    useState<R11ContinentCode>("north-continent");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("continent");

    if (isR11ContinentCode(requested)) {
      setContinentCode(requested);
    }

    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }, []);

  const selected = getContinentByCode(locale, continentCode);
  const entries = getR11ContinentNationEntries(continentCode);

  const createNationHref = withPortalLanguage(
    `/nation-create?continent=${encodeURIComponent(
      continentCode,
    )}&source=empty_nation_slot`,
    locale,
  );

  return (
    <AppShell
      locale={locale}
      title={t(locale, "map.continent.title")}
    >
      <section
        className="landscape-frame"
        aria-label="continent-map"
      >
        <div className="landscape-left">
          <div className="continent-image-card is-active">
            <span className="continent-visual-symbol">
              {selected.shortLabel}
            </span>

            <span className="continent-visual-text">
              {selected.visualLabel}
            </span>

            <span className="continent-visual-note">
              {selected.landscapeNote}
            </span>
          </div>
        </div>

        <div className="landscape-right">
          <p className="kicker">continent-map</p>

          <h1>{selected.label}</h1>

          <p>{t(locale, "map.continent.description")}</p>

          <div className="route-grid">
            {entries.map((entry) => {
              if (
                entry.runtimeClass ===
                "HISTORICAL_DISMANTLED"
              ) {
                return (
                  <article
                    key={entry.code}
                    className="route-card"
                    aria-disabled="true"
                  >
                    <strong>{entry.name}</strong>

                    <p>
                      {locale === "ja"
                        ? "歴史国家・解体済み。通常の国家プレイ対象ではありません。"
                        : "Historical / dismantled state. Not available as a normal current nation."}
                    </p>
                  </article>
                );
              }

              const cityHref = withPortalLanguage(
                `/city-map?continent=${encodeURIComponent(
                  continentCode,
                )}&nation=${encodeURIComponent(entry.code)}`,
                locale,
              );

              return (
                <Link
                  key={entry.code}
                  href={cityHref}
                  className="route-card"
                >
                  <strong>{entry.name}</strong>

                  <p>
                    {locale === "ja"
                      ? "都市を選択"
                      : "Choose city"}
                  </p>
                </Link>
              );
            })}

            <Link
              href={createNationHref}
              className="route-card"
            >
              <strong>
                {locale === "ja"
                  ? "空白国家領域"
                  : "Empty nation area"}
              </strong>

              <p>
                empty_nation_slot
                {" · "}
                {locale === "ja"
                  ? "国家を作成"
                  : "Create nation"}
              </p>
            </Link>
          </div>

          <div className="notice">
            {locale === "ja"
              ? "既存国家は都市選択へ、空白国家領域は国家作成入口へ進みます。Aureliaは歴史・解体済み国家として保持されます。"
              : "Existing nations continue to city selection. Empty nation areas open nation creation. Aurelia remains a historical dismantled state."}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
