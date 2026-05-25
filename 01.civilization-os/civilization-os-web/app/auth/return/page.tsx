"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { HandoffPanel } from "@/components/HandoffPanel";
import { usePortalContext } from "@/components/usePortalContext";
import { resolvePostAuthTarget, withPortalLanguage } from "@/lib/portal-context";
import { t } from "@/lib/i18n";

export default function AuthReturnPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;
  const nextTarget = resolvePostAuthTarget(portalContext);

  return (
    <AppShell locale={locale}>
      <div className="grid two">
        <section className="card">
          <p className="kicker">auth-return</p>
          <h1>{t(locale, "handoff.title")}</h1>
          <p>{t(locale, "auth.login.description")}</p>
          <Link className="button" href={withPortalLanguage(nextTarget, locale)}>{t(locale, "common.next")}</Link>
        </section>

        <HandoffPanel locale={locale} target={portalContext} />
      </div>
    </AppShell>
  );
}
