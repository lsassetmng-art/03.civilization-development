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

export default function FacilityOverviewPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;

  const [nationCode, setNationCode] =
    useState<R11LiveNationCode | null>(null);

  const [continentCode, setContinentCode] =
    useState<R11ContinentCode | null>(null);

  const [cityCode, setCityCode] =
    useState<string | null>(null);

  const [facilityId, setFacilityId] =
    useState<string | null>(null);

  const [facilityType, setFacilityType] =
    useState<string | null>(null);

  const [canonicalUiTarget, setCanonicalUiTarget] =
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

    setFacilityId(params.get("facility_id"));
    setFacilityType(params.get("facility_type"));
    setCanonicalUiTarget(
      params.get("canonical_ui_target"),
    );

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

  const requestedRouteParamsPresent =
    facilityId !== null &&
    facilityType !== null &&
    canonicalUiTarget !== null;

  return (
    <AppShell
      locale={locale}
      title={
        locale === "ja"
          ? "Facility Overview"
          : "Facility Overview"
      }
    >
      <section className="card">
        <p className="kicker">facility/overview</p>

        <h1>Facility Overview</h1>

        <div className="notice">
          <strong>blocked</strong>

          <p>
            {locale === "ja"
              ? "R12ではcanonical facility truthのデータソースをまだ接続していません。facility_idをURLだけから正本として扱うことはしません。"
              : "R12 does not yet connect a canonical facility-truth data source. A facility_id supplied only through the URL is not treated as canonical truth."}
          </p>

          <p>
            {requestedRouteParamsPresent
              ? locale === "ja"
                ? "必要なroute parameterは提示されていますが、正本照合できないためFacility Overviewをready状態にはしません。"
                : "The required route parameters are present, but the facility cannot be verified against canonical truth, so Facility Overview does not enter ready state."
              : locale === "ja"
                ? "facility_id / facility_type / canonical_ui_target が揃っていません。"
                : "facility_id / facility_type / canonical_ui_target are incomplete."}
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
