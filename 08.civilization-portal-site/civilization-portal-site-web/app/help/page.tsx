"use client";

import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";

export default function Page() {
  const { t } = usePortalI18n();

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("help.eyebrow")}</p>
          <h1 className="card-title">{t("help.title")}</h1>
          <p className="card-copy">{t("help.description")}</p>
        </article>
      </section>
    </div>
  );
}
