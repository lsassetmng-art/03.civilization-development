"use client";

import { useState } from "react";
import { usePortalI18n } from "../../components/i18n/portal-i18n-provider";
import type { PortalLocaleCode } from "../../lib/i18n/portal-i18n";

const localeOptions: PortalLocaleCode[] = ["ja", "en"];

export default function Page() {
  const {
    locale,
    localeSource,
    browserLanguages,
    setLocale,
    saveLocale,
    clearSavedLocale,
    t,
  } = usePortalI18n();
  const [message, setMessage] = useState<string>("");

  const sourceLabel =
    localeSource === "saved"
      ? t("language.source.saved")
      : localeSource === "browser"
        ? t("language.source.browser")
        : t("language.source.default");

  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card hero-card">
          <p className="eyebrow">{t("language.eyebrow")}</p>
          <h1 className="card-title">{t("language.title")}</h1>
          <p className="card-copy">{t("language.description")}</p>
        </article>
      </section>

      <section className="page-section">
        <article className="card">
          <dl className="definition-list">
            <div>
              <dt>{t("language.currentLocale")}</dt>
              <dd>{locale}</dd>
            </div>
            <div>
              <dt>{t("language.source")}</dt>
              <dd>{sourceLabel}</dd>
            </div>
            <div>
              <dt>{t("language.browserLanguages")}</dt>
              <dd>{browserLanguages.length > 0 ? browserLanguages.join(", ") : "-"}</dd>
            </div>
          </dl>

          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              saveLocale(locale);
              setMessage(t("language.savedMessage"));
            }}
          >
            <label className="field-label" htmlFor="portal-locale-select">
              {t("language.selectLabel")}
            </label>
            <select
              id="portal-locale-select"
              className="text-input"
              value={locale}
              onChange={(event) => {
                const nextLocale = event.target.value as PortalLocaleCode;
                setLocale(nextLocale);
                setMessage("");
              }}
            >
              {localeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ja" ? t("language.option.ja") : t("language.option.en")}
                </option>
              ))}
            </select>

            <div className="action-row">
              <button type="submit" className="button-primary">
                {t("language.save")}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  clearSavedLocale();
                  setMessage(t("language.clearedMessage"));
                }}
              >
                {t("language.clear")}
              </button>
            </div>
          </form>

          {message ? <p className="status-message">{message}</p> : null}
        </article>
      </section>
    </div>
  );
}
