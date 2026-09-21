"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import {
  getR11CitiesForNation,
  isR11ContinentCode,
  isR11LiveNationCode,
  type R11ContinentCode,
  type R11LiveNationCode,
} from "@/lib/map-data";
import { withPortalLanguage } from "@/lib/portal-context";

export default function CityBuilderStartPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;

  const [nationCode, setNationCode] =
    useState<R11LiveNationCode | null>(null);

  const [continentCode, setContinentCode] =
    useState<R11ContinentCode | null>(null);

  const [cityCode, setCityCode] =
    useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const requestedNation = params.get("nation");
    const requestedContinent = params.get("continent");
    const requestedCity = params.get("city");

    if (isR11LiveNationCode(requestedNation)) {
      setNationCode(requestedNation);

      if (
        requestedCity !== null &&
        getR11CitiesForNation(requestedNation).includes(
          requestedCity,
        )
      ) {
        setCityCode(requestedCity);
      }
    }

    if (isR11ContinentCode(requestedContinent)) {
      setContinentCode(requestedContinent);
    }

    window.scrollTo(0, 0);
  }, []);

  const validContext =
    nationCode !== null &&
    cityCode !== null;

  const queryParts = validContext
    ? [
        continentCode
          ? `continent=${encodeURIComponent(continentCode)}`
          : null,
        `nation=${encodeURIComponent(nationCode)}`,
        `city=${encodeURIComponent(cityCode)}`,
      ].filter(Boolean)
    : [];

  const backHref = validContext
    ? withPortalLanguage(
        `/city-map?${queryParts.join("&")}`,
        locale,
      )
    : withPortalLanguage("/city-map", locale);

  return (
    <AppShell
      locale={locale}
      title={
        locale === "ja"
          ? "City Builder 開始"
          : "City Builder Start"
      }
    >
      <section className="card">
        <p className="kicker">builder/city/start</p>

        <h1>
          {locale === "ja"
            ? "City Builder 開始"
            : "City Builder Start"}
        </h1>

        {validContext ? (
          <>
            <div className="notice">
              <strong>
                {locale === "ja"
                  ? "開始コンテキスト"
                  : "Start context"}
              </strong>

              <p>{cityCode}</p>

              <p>
                {locale === "ja"
                  ? "この画面はCity Builderの開始地点です。空きエリアの境界確定、都市作成、保存、DB変更はまだ実行しません。"
                  : "This is the City Builder start point. It does not finalize an empty-area boundary, create a city, save state, or mutate the database."}
              </p>
            </div>

            <div className="notice">
              <strong>
                {locale === "ja"
                  ? "次段階"
                  : "Later builder stages"}
              </strong>

              <p>
                {locale === "ja"
                  ? "Template、Boundary、Core、Identity、District / Zone、Infrastructure、Initial Facility、ValidationはR12の実装範囲外です。"
                  : "Template, Boundary, Core, Identity, District / Zone, Infrastructure, Initial Facility, and Validation remain outside the R12 implementation slice."}
              </p>
            </div>
          </>
        ) : (
          <div className="notice">
            <strong>
              {locale === "ja"
                ? "開始できません"
                : "Unable to start"}
            </strong>

            <p>
              {locale === "ja"
                ? "有効な既存国家・都市コンテキストがありません。"
                : "No valid current nation and city context is available."}
            </p>
          </div>
        )}

        <div className="notice">
          <Link href={backHref}>
            {locale === "ja"
              ? "都市マップへ戻る"
              : "Back to city map"}
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
