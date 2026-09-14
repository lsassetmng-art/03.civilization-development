"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";
import { startPortalAuth } from "../../services/civilization-auth/auth-gateway";
import type { PortalAuthProfilePreset } from "../../types/portal-api";

export function SignupEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = usePortalI18n();
  const [busyPreset, setBusyPreset] = useState<PortalAuthProfilePreset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const returnTarget = searchParams.get("returnTarget") ?? "/me/launcher";
  const requestedOsCode = searchParams.get("requestedOsCode") ?? undefined;

  const runSignup = async (preset: PortalAuthProfilePreset) => {
    setBusyPreset(preset);
    setError(null);

    try {
      const response = await startPortalAuth({
        mode: "signup",
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
          <p className="eyebrow">{t("signup.eyebrow")}</p>
          <h1 className="card-title">{t("signup.title")}</h1>
          <p className="card-copy">{t("signup.description")}</p>
        </article>
      </section>

      <section className="page-section">
        <article className="card">
          {error ? <p className="status-error">{error}</p> : null}
          <div className="action-row">
            <button
              type="button"
              className="button-primary"
              onClick={() => runSignup("free-member")}
            >
              {busyPreset === "free-member"
                ? t("common.loading")
                : t("signup.free")}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => runSignup("staticart-beta-creator")}
            >
              {busyPreset === "staticart-beta-creator"
                ? t("common.loading")
                : t("signup.creator")}
            </button>
            <Link href="/login" className="button-secondary">
              {t("signup.backLogin")}
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
