"use client";

import Link from "next/link";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";
import { buildOsDetailRoute } from "../../lib/routing/routes";
import { OS_CATALOG } from "../../mocks/os/catalog";

export const OsListPage = () => {
  const { t } = usePortalI18n();

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("os.eyebrow")}</p>
          <h1 className="card-title">{t("os.title")}</h1>
          <p className="card-copy">{t("os.description")}</p>
        </article>
      </section>

      <section className="page-section">
        <div className="card-grid">
          {OS_CATALOG.map((item) => (
            <article key={item.code} className="card">
              <p className="eyebrow">{item.category}</p>
              <h2 className="card-title">{item.name}</h2>
              <p className="card-copy">{item.summary}</p>
              <div className="chip-row">
                <span className="chip">{item.accessLevel}</span>
                <span className="chip">{item.availability}</span>
              </div>
              <Link href={buildOsDetailRoute(item.code)} className="button-primary">
                {t("os.open")}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OsListPage;
