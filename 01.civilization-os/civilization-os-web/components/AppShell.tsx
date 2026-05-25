"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";
import type { SupportedLocale } from "@/types/locale";
import { t } from "@/lib/i18n";
import { withPortalLanguage } from "@/lib/portal-context";

type AppShellProps = {
  locale: SupportedLocale;
  children: ReactNode;
  title?: string;
};

export function AppShell({ locale, children }: AppShellProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
  }, []);

  return (
    <div className="app-shell">
      <header className="title-bar">
        <Link className="brand" href={withPortalLanguage("/login", locale)}>
          CivilizationOS
        </Link>
        <div className="title-bar-title" data-ui-marker="app-title">
          {t(locale, "app.title")}
        </div>
        <nav className="title-bar-actions" aria-label="primary">
          <Link href={withPortalLanguage("/signup", locale)}>{t(locale, "nav.signup")}</Link>
          <Link href={withPortalLanguage("/login", locale)}>{t(locale, "nav.login")}</Link>
        </nav>
      </header>
      <main className="screen-stage">{children}</main>
    </div>
  );
}
