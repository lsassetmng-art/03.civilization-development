"use client";

import Link from "next/link";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";

export default function Page() {
  const { t } = usePortalI18n();

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("civilization.eyebrow")}</p>
          <h1 className="card-title">{t("civilization.title")}</h1>
          <p className="card-copy">{t("civilization.description")}</p>
          <div className="action-row">
            <Link href="/guide" className="button-primary">
              {t("civilization.primaryAction")}
            </Link>
            <Link href="/os" className="button-secondary">
              {t("civilization.secondaryAction")}
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
