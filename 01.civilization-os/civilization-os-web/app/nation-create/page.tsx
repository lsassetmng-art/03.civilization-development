"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import {
  isR11ContinentCode,
  type R11ContinentCode,
} from "@/lib/map-data";
import { withPortalLanguage } from "@/lib/portal-context";

export default function NationCreatePage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;

  const [continentCode, setContinentCode] =
    useState<R11ContinentCode>("north-continent");

  const [validEntrySource, setValidEntrySource] =
    useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const requestedContinent = params.get("continent");
    const requestedSource = params.get("source");

    if (isR11ContinentCode(requestedContinent)) {
      setContinentCode(requestedContinent);
    }

    setValidEntrySource(
      requestedSource === "empty_nation_slot",
    );

    window.scrollTo(0, 0);
  }, []);

  const backHref = withPortalLanguage(
    `/continent-map?continent=${encodeURIComponent(
      continentCode,
    )}`,
    locale,
  );

  return (
    <AppShell locale={locale}>
      <section className="card">
        <p className="kicker">nation-create</p>

        <h1>
          {locale === "ja"
            ? "国家を作成"
            : "Create Nation"}
        </h1>

        <p>
          {locale === "ja"
            ? "空白国家領域から新しい国家を作成するための入口です。"
            : "This is the entry point for creating a new nation from an empty nation area."}
        </p>

        <div className="notice">
          <strong>
            {validEntrySource
              ? "empty_nation_slot"
              : "nation_creation_entry"}
          </strong>

          <p>
            {locale === "ja"
              ? "国家作成は課金対象で、国家作成権が必要です。"
              : "Nation creation is a paid right and requires a nation-creation entitlement."}
          </p>

          <p>
            {locale === "ja"
              ? "支払い・権利はアカウント側で管理し、ゲーム世界では選択したPersonaが国家元首になります。"
              : "Payment and entitlement belong to the account layer. The selected Persona becomes the in-world head of state."}
          </p>
        </div>

        <div className="route-grid">
          <article
            className="route-card"
            aria-disabled="true"
          >
            <strong>
              {locale === "ja"
                ? "国家作成権を確認"
                : "Check nation creation right"}
            </strong>

            <p>
              {locale === "ja"
                ? "次フェーズで実装"
                : "Implemented in the next phase"}
            </p>
          </article>

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
        </div>

        <div className="notice">
          {locale === "ja"
            ? "R11では、購入完了、権利付与、国家作成、Persona選択、国家元首就任は実行しません。"
            : "R11 does not complete purchases, grant entitlement, create a nation, select a Persona, or assign a head of state."}
        </div>
      </section>
    </AppShell>
  );
}
