"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalI18n } from "../i18n/portal-i18n-provider";

const navItems = [
  { href: "/", labelKey: "nav.home" },
  { href: "/civilization", labelKey: "nav.civilization" },
  { href: "/os", labelKey: "nav.osCatalog" },
  { href: "/guide", labelKey: "nav.guide" },
  { href: "/help", labelKey: "nav.help" },
  { href: "/search", labelKey: "nav.search" },
  { href: "/contact", labelKey: "nav.contact" },
  { href: "/language", labelKey: "nav.language" },
  { href: "/login", labelKey: "nav.login" },
];

export const GlobalHeader = () => {
  const pathname = usePathname();
  const { t } = usePortalI18n();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand" aria-label={t("site.title")}>
          <span className="site-brand__title">{t("site.title")}</span>
          <span className="site-brand__subtitle">{t("site.subtitle")}</span>
        </Link>

        <nav className="site-nav" aria-label="Portal navigation">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "site-nav__link is-active" : "site-nav__link"}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}

        <a
          data-portal-helpdesk-nav-link="true"
          href="/helpdesk"
          className="text-sm font-medium text-slate-700 hover:text-slate-950"
        >
          Helpdesk
        </a>
      </nav>
      </div>
    </header>
  );
};

export default GlobalHeader;
