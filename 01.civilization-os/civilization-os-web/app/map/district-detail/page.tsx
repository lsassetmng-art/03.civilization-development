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

export default function DistrictDetailPage() {
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

  const cityContextValid =
    nationCode !== null &&
    cityCode !== null;

  const backQueryParts = cityContextValid
    ? [
        continentCode
          ? `continent=${encodeURIComponent(continentCode)}`
          : null,
        `nation=${encodeURIComponent(nationCode)}`,
        `city=${encodeURIComponent(cityCode)}`,
      ].filter(Boolean)
    : [];

  const backHref = cityContextValid
    ? withPortalLanguage(
        `/city-map?${backQueryParts.join("&")}`,
        locale,
      )
    : withPortalLanguage("/city-map", locale);

  return (
    <AppShell
      locale={locale}
      title={
        locale === "ja"
          ? "District Detail"
          : "District Detail"
      }
    >
      <section className="card">
        <p className="kicker">map/district-detail</p>

        <h1>
          {locale === "ja"
            ? "District Detail Information"
            : "District Detail Information"}
        </h1>

        <div className="notice">
          <strong>blocked</strong>

          <p>
            {locale === "ja"
              ? "R12ではcanonical district targetがまだ接続されていません。地区IDや地区情報を仮生成せず、明示的な利用不可状態にしています。"
              : "R12 does not yet connect a canonical district target. No district ID or district information is fabricated; this screen remains explicitly unavailable."}
          </p>

          <p>
            {locale === "ja"
              ? "District detailのfield-level structureは後続設計・実装に残します。"
              : "The field-level district-detail structure remains for a later design and implementation slice."}
          </p>
        </div>

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
