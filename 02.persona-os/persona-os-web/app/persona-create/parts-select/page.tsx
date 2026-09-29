"use client";

import { usePersonaI18n } from "../../../components/i18n/persona-i18n-provider";

export default function PartsSelectPersonaCreatePage() {
  const { t } = usePersonaI18n();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">PersonaBuilder</p>
        <h1 className="text-2xl font-bold">{t("personaParts.title")}</h1>
        <p className="mt-3 text-sm text-slate-600">
          {t("personaParts.description")}
        </p>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          {t("personaParts.boundary")}
        </div>
        <a
          href="/persona-menu/persona-create"
          className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm"
        >
          {t("personaParts.back")}
        </a>
      </section>
    </main>
  );
}
