"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";
import { startPortalAuth } from "../../services/civilization-auth/auth-gateway";
import type { PortalAuthProfilePreset } from "../../types/portal-api";

export function LoginEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = usePortalI18n();
  const [busyPreset, setBusyPreset] = useState<PortalAuthProfilePreset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const returnTarget = searchParams.get("returnTarget") ?? "/me/launcher";
  const requestedOsCode = searchParams.get("requestedOsCode") ?? undefined;

  const runLogin = async (preset: PortalAuthProfilePreset) => {
    setBusyPreset(preset);
    setError(null);

    try {
      const response = await startPortalAuth({
        mode: "login",
        profilePreset: preset,
        returnContext: {
          returnTarget,
          requestedOsCode,
          requestTimestamp: new Date().toISOString(),
        },
      });
      router.push(response.redirectUrl);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : t("common.error");
      setError(message);
    } finally {
      setBusyPreset(null);
    }
  };

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("login.eyebrow")}</p>
          <h1 className="card-title">{t("login.title")}</h1>
          <p className="card-copy">{t("login.description")}</p>
        </article>
      </section>

      <section className="page-section">
        <article className="card">
          <p className="eyebrow">{t("login.guidance")}</p>
          {error ? <p className="status-error">{error}</p> : null}
          <div className="action-row">
            <button
              type="button"
              className="button-primary"
              onClick={() => runLogin("business-operator")}
            >
              {busyPreset === "business-operator"
                ? t("common.loading")
                : t("login.business")}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => runLogin("free-member")}
            >
              {busyPreset === "free-member"
                ? t("common.loading")
                : t("login.free")}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => runLogin("staticart-beta-creator")}
            >
              {busyPreset === "staticart-beta-creator"
                ? t("common.loading")
                : t("login.creator")}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
