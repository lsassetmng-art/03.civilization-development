"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import { t } from "@/lib/i18n";
import {
  getR11CitiesForNation,
  isR11ContinentCode,
  isR11LiveNationCode,
  type R11ContinentCode,
  type R11LiveNationCode,
} from "@/lib/map-data";
import { withPortalLanguage } from "@/lib/portal-context";

const NATION_NAMES: Record<R11LiveNationCode, string> = {
  helios: "Helios Democratic Kingdom",
  nova: "Nova Commercial Federation",
  seiwa: "Seiwa State",
  gladia: "Gladia Military Alliance",
  orpheus: "Orpheus Oceanic Union",
  "free-cities-union": "Free Cities Union",
};

export default function CityMapPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;

  const [nationCode, setNationCode] =
    useState<R11LiveNationCode | null>(null);

  const [continentCode, setContinentCode] =
    useState<R11ContinentCode | null>(null);

  const [selectedCity, setSelectedCity] =
    useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const requestedNation = params.get("nation");
    const requestedContinent = params.get("continent");
    const requestedCity = params.get("city");

    if (isR11LiveNationCode(requestedNation)) {
      setNationCode(requestedNation);

      const cities = getR11CitiesForNation(requestedNation);

      if (
        requestedCity !== null &&
        cities.includes(requestedCity)
      ) {
        setSelectedCity(requestedCity);
      }
    }

    if (isR11ContinentCode(requestedContinent)) {
      setContinentCode(requestedContinent);
    }

    window.scrollTo(0, 0);
  }, []);

  const backHref = continentCode
    ? withPortalLanguage(
        `/continent-map?continent=${encodeURIComponent(
          continentCode,
        )}`,
        locale,
      )
    : withPortalLanguage("/global-map", locale);

  if (!nationCode) {
    return (
      <AppShell
        locale={locale}
        title={t(locale, "map.city.title")}
      >
        <section className="card">
          <p className="kicker">city-map</p>

          <h1>{t(locale, "map.city.title")}</h1>

          <p>
            {locale === "ja"
              ? "有効な既存国家が選択されていません。"
              : "No valid current nation is selected."}
          </p>

          <Link
            href={backHref}
            className="route-card"
          >
            <strong>
              {locale === "ja"
                ? "国家選択へ戻る"
                : "Back to nation selection"}
            </strong>
          </Link>
        </section>
      </AppShell>
    );
  }

  const cities = getR11CitiesForNation(nationCode);

  return (
    <AppShell
      locale={locale}
      title={t(locale, "map.city.title")}
    >
      <section className="card">
        <p className="kicker">city-map</p>

        <h1>{NATION_NAMES[nationCode]}</h1>

        <p>{t(locale, "map.city.description")}</p>

        {selectedCity ? (
          <div className="notice">
            <strong>
              {locale === "ja"
                ? "選択中の都市"
                : "Selected city"}
            </strong>

            <p>{selectedCity}</p>

            <p>
              {locale === "ja"
                ? "都市ローカルマップへの接続は次の実装フェーズです。"
                : "Connection to the city-local map belongs to the next implementation phase."}
            </p>
          </div>
        ) : null}

        <div className="route-grid">
          {cities.map((cityCode) => {
            const queryParts = [
              continentCode
                ? `continent=${encodeURIComponent(
                    continentCode,
                  )}`
                : null,
              `nation=${encodeURIComponent(nationCode)}`,
              `city=${encodeURIComponent(cityCode)}`,
            ].filter(Boolean);

            const href = withPortalLanguage(
              `/city-map?${queryParts.join("&")}`,
              locale,
            );

            return (
              <Link
                key={cityCode}
                href={href}
                className="route-card"
              >
                <strong>{cityCode}</strong>

                <p>
                  {locale === "ja"
                    ? "都市を選択"
                    : "Select city"}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="notice">
          <Link href={backHref}>
            {locale === "ja"
              ? "国家選択へ戻る"
              : "Back to nation selection"}
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
