"use client";

import Link from "next/link";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";

export default function Page() {
  const { t } = usePortalI18n();

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("guide.eyebrow")}</p>
          <h1 className="card-title">{t("guide.title")}</h1>
          <p className="card-copy">{t("guide.description")}</p>
          <ul>
            <li>{t("guide.item.home")}</li>
            <li>{t("guide.item.os")}</li>
            <li>{t("guide.item.auth")}</li>
            <li>{t("guide.item.support")}</li>
          </ul>
          <Link href="/help" className="button-primary">
            {t("guide.openHelp")}
          </Link>
        </article>
      </section>
    </div>
  );
}
