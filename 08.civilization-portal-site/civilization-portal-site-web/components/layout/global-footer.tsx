"use client";

import Link from "next/link";
import { usePortalI18n } from "../i18n/portal-i18n-provider";

export const GlobalFooter = () => {
  const { t } = usePortalI18n();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>{t("footer.copy")}</p>
        <p className="muted">{t("footer.location")}</p>
        <nav className="site-footer__nav" aria-label="Footer navigation">
          <Link href="/terms">{t("nav.terms")}</Link>
          <Link href="/policy">{t("nav.policy")}</Link>
          <Link href="/help">{t("nav.help")}</Link>
          <Link href="/language">{t("nav.language")}</Link>
        </nav>
      </div>

        <a
          data-portal-helpdesk-footer-link="true"
          href="/helpdesk"
          className="text-sm text-slate-600 hover:text-slate-950"
        >
          Helpdesk
        </a>
    </footer>
  );
};

export default GlobalFooter;
