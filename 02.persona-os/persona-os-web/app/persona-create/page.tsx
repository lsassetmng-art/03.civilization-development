"use client";

import { usePersonaI18n } from "../../components/i18n/persona-i18n-provider";

const routes = [
  { labelKey: "personaCreate.image.label", href: "/persona-menu/persona-create/image-upload", className: "left-1/2 top-4 -translate-x-1/2", descriptionKey: "personaCreate.image.description" },
  { labelKey: "personaCreate.parts.label", href: "/persona-menu/persona-create/parts-select", className: "left-4 top-1/2 -translate-y-1/2", descriptionKey: "personaCreate.parts.description" },
  { labelKey: "personaCreate.ai.label", href: "/persona-menu/persona-create/ai-generate", className: "right-4 top-1/2 -translate-y-1/2", descriptionKey: "personaCreate.ai.description" },
  { labelKey: "personaCreate.drafts.label", href: "/persona-menu/persona-create/drafts", className: "bottom-4 left-1/2 -translate-x-1/2", descriptionKey: "personaCreate.drafts.description" },
];

export default function PersonaCreateMenuPage() {
  const { t } = usePersonaI18n();
  const nodeClass = "absolute flex h-32 w-32 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-center text-sm font-semibold text-slate-900 shadow-md transition hover:scale-[1.03] hover:shadow-lg";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <header className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">PersonaBuilder</p>
          <h1 className="text-2xl font-bold">{t("personaCreate.title")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("personaCreate.description")}</p>
        </header>

        <div className="relative mx-auto mt-6 h-[520px] w-full max-w-[720px]">
          <a href="/persona-menu" className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 px-3 text-center text-lg font-bold text-white shadow-lg">{t("personaCreate.title")}</a>
          {routes.map((route) => (
            <a key={route.href} href={route.href} className={`${nodeClass} ${route.className}`}>{t(route.labelKey)}</a>
          ))}
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          {routes.map((route) => (
            <a key={route.href} href={route.href} className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
              <h2 className="font-semibold">{t(route.labelKey)}</h2>
              <p className="mt-1 text-sm text-slate-600">{t(route.descriptionKey)}</p>
            </a>
          ))}
        </section>
      </section>
    </main>
  );
}
