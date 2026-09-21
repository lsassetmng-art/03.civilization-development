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

  if (selectedCity) {
    const contextQueryParts = [
      continentCode
        ? `continent=${encodeURIComponent(continentCode)}`
        : null,
      `nation=${encodeURIComponent(nationCode)}`,
      `city=${encodeURIComponent(selectedCity)}`,
    ].filter(Boolean);

    const builderHref = withPortalLanguage(
      `/builder/city/start?${contextQueryParts.join("&")}`,
      locale,
    );

    const cityListQueryParts = [
      continentCode
        ? `continent=${encodeURIComponent(continentCode)}`
        : null,
      `nation=${encodeURIComponent(nationCode)}`,
    ].filter(Boolean);

    const cityListHref = withPortalLanguage(
      `/city-map?${cityListQueryParts.join("&")}`,
      locale,
    );

    return (
      <AppShell
        locale={locale}
        title={t(locale, "map.city.title")}
      >
        <section className="card">
          <p className="kicker">city-local</p>

          <h1>{selectedCity}</h1>

          <p>{NATION_NAMES[nationCode]}</p>

          <div className="notice">
            <strong>
              {locale === "ja"
                ? "都市ローカル状態"
                : "City-local state"}
            </strong>

            <p>partial_data</p>

            <p>
              {locale === "ja"
                ? "都市ローカル操作レイヤーは有効です。施設・地区の正本ターゲットは未接続のため、存在しないIDを生成せず明示的に利用不可として扱います。"
                : "The city-local operational layer is active. Canonical facility and district targets are not connected yet, so no invented IDs are generated and those entries remain explicitly unavailable."}
            </p>
          </div>

          <div className="route-grid">
            <Link
              href={builderHref}
              className="route-card"
            >
              <strong>
                {locale === "ja"
                  ? "空きエリア → City Builder"
                  : "Empty area → City Builder"}
              </strong>

              <p>builder/city/start</p>

              <p>
                {locale === "ja"
                  ? "境界を確定せず、City Builder開始画面へ移動します。"
                  : "Open the City Builder start screen without finalizing a boundary."}
              </p>
            </Link>

            <div
              className="route-card"
              aria-disabled="true"
            >
              <strong>
                {locale === "ja"
                  ? "施設 → Facility Overview"
                  : "Facility → Facility Overview"}
              </strong>

              <p>facility/overview</p>

              <p>
                {locale === "ja"
                  ? "canonical facility target未接続。facility_idを捏造しないため現在は利用できません。"
                  : "Canonical facility targets are not connected. This entry is unavailable rather than inventing a facility_id."}
              </p>
            </div>

            <div
              className="route-card"
              aria-disabled="true"
            >
              <strong>
                {locale === "ja"
                  ? "地区 → District Detail"
                  : "District → District Detail"}
              </strong>

              <p>map/district-detail</p>

              <p>
                {locale === "ja"
                  ? "canonical district target未接続。地区情報を捏造せず現在は利用不可として表示します。"
                  : "Canonical district targets are not connected. District information remains unavailable rather than being fabricated."}
              </p>
            </div>
          </div>

          <div className="notice">
            <Link href={cityListHref}>
              {locale === "ja"
                ? "都市一覧へ戻る"
                : "Back to city list"}
            </Link>
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

  return (
    <AppShell
      locale={locale}
      title={t(locale, "map.city.title")}
    >
      <section className="card">
        <p className="kicker">city-map</p>

        <h1>{NATION_NAMES[nationCode]}</h1>

        <p>{t(locale, "map.city.description")}</p>

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
                    ? "都市ローカルマップを開く"
                    : "Open city-local map"}
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
