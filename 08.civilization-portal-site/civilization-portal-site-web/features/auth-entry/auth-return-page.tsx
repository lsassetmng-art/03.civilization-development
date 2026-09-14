"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";
import { resolvePortalAuthReturn } from "../../services/civilization-auth/auth-gateway";

export function AuthReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = usePortalI18n();

  useEffect(() => {
    const result = resolvePortalAuthReturn({
      status: searchParams.get("status") ?? "success",
      searchReturnTarget: searchParams.get("returnTarget") ?? undefined,
      requestedOsCode: searchParams.get("requestedOsCode") ?? undefined,
    });

    const timer = window.setTimeout(() => {
      router.push(result.redirectTo);
    }, 600);

    return () => window.clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("authReturn.eyebrow")}</p>
          <h1 className="card-title">{t("authReturn.title")}</h1>
          <p className="card-copy">{t("authReturn.description")}</p>
        </article>
      </section>
    </div>
  );
}
