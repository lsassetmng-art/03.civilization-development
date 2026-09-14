"use client";

import Link from "next/link";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";

export const HomePage = () => {
  const { t } = usePortalI18n();

  const cards = [
    {
      title: t("home.card.os.title"),
      copy: t("home.card.os.copy"),
      href: "/os",
    },
    {
      title: t("home.card.auth.title"),
      copy: t("home.card.auth.copy"),
      href: "/login",
    },
    {
      title: t("home.card.search.title"),
      copy: t("home.card.search.copy"),
      href: "/search",
    },
  ];

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("home.eyebrow")}</p>
          <h1 className="card-title">{t("home.title")}</h1>
          <p className="card-copy">{t("home.description")}</p>
        </article>
      </section>

      <section className="page-section">
        <article className="card">
          <div className="chip-row">
            <span className="chip">{t("home.badge.publicInformation")}</span>
            <span className="chip">{t("home.badge.officialEntry")}</span>
            <span className="chip">{t("home.badge.launcherAware")}</span>
          </div>
          <p className="card-copy">{t("home.lead")}</p>
          <div className="action-row">
            <Link href="/os" className="button-primary">
              {t("home.primaryAction")}
            </Link>
            <Link href="/login" className="button-secondary">
              {t("home.secondaryAction")}
            </Link>
          </div>
        </article>
      </section>

      <section className="page-section">
        <article className="card">
          <p className="eyebrow">{t("home.sectionTitle")}</p>
          <p className="card-copy">{t("home.sectionCopy")}</p>
          <div className="card-grid">
            {cards.map((card) => (
              <Link key={card.href} href={card.href} className="mini-card">
                <strong>{card.title}</strong>
                <span>{card.copy}</span>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default HomePage;
