"use client";

import Link from "next/link";
import { useState } from "react";
import { usePortalI18n } from "../../../../components/i18n/portal-i18n-provider";

type PersonaAiGenerateDraftV1 = {
  schemaVersion: 1;
  method: "ai_generate";
  route: "/persona-menu/persona-create/ai-generate";
  updatedAt: string;
  generationConditions: string;
};

const DRAFT_STORAGE_KEY = "portal.persona.create.aiGenerateDraft.v1";
const DRAFT_ROUTE = "/persona-menu/persona-create/ai-generate" as const;

function createDraft(generationConditions: string): PersonaAiGenerateDraftV1 {
  return {
    schemaVersion: 1,
    method: "ai_generate",
    route: DRAFT_ROUTE,
    updatedAt: new Date().toISOString(),
    generationConditions,
  };
}

function isUsableDraft(value: unknown): value is PersonaAiGenerateDraftV1 {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<PersonaAiGenerateDraftV1>;

  return (
    draft.schemaVersion === 1 &&
    draft.method === "ai_generate" &&
    draft.route === DRAFT_ROUTE &&
    typeof draft.updatedAt === "string" &&
    typeof draft.generationConditions === "string"
  );
}

export default function PersonaAiGeneratePage() {
  const { t } = usePortalI18n();
  const [generationConditions, setGenerationConditions] = useState("");
  const [draftMessage, setDraftMessage] = useState("");

  function saveDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const draft = createDraft(generationConditions);

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftMessage(t("personaAi.message.savedPrefix") + draft.updatedAt);
  }

  function loadDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!rawDraft) {
      setDraftMessage(t("personaAi.message.noSaved"));
      return;
    }

    try {
      const parsedDraft: unknown = JSON.parse(rawDraft);

      if (!isUsableDraft(parsedDraft)) {
        setDraftMessage(t("personaAi.message.invalid"));
        return;
      }

      setGenerationConditions(parsedDraft.generationConditions);
      setDraftMessage(t("personaAi.message.loadedPrefix") + parsedDraft.updatedAt);
    } catch {
      setDraftMessage(t("personaAi.message.loadFailed"));
    }
  }

  function clearDraft() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftMessage(t("personaAi.message.deleted"));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <p className="text-sm text-cyan-300">
            {t("personaAi.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{t("personaAi.title")}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {t("personaAi.description")}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300"
              href="/persona-menu/persona-create"
            >
              {t("personaAi.backCreate")}
            </Link>
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300"
              href="/persona-menu"
            >
              {t("personaAi.backMenu")}
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <label
            className="block text-sm font-semibold text-slate-100"
            htmlFor="generationConditions"
          >
            {t("personaAi.conditionsLabel")}
          </label>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {t("personaAi.conditionsHelp")}
          </p>

          <textarea
            className="mt-4 min-h-64 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
            id="generationConditions"
            onChange={(event) => setGenerationConditions(event.target.value)}
            placeholder={t("personaAi.placeholder")}
            value={generationConditions}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
              onClick={saveDraft}
              type="button"
            >
              {t("personaAi.save")}
            </button>

            <button
              className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100 hover:border-cyan-300"
              onClick={loadDraft}
              type="button"
            >
              {t("personaAi.load")}
            </button>

            <button
              className="rounded-full border border-rose-400/70 px-4 py-2 text-sm text-rose-100"
              onClick={clearDraft}
              type="button"
            >
              {t("personaAi.delete")}
            </button>

            <button
              className="cursor-not-allowed rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-500"
              disabled
              type="button"
            >
              {t("personaAi.executeDisabled")}
            </button>
          </div>

          {draftMessage && (
            <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
              {draftMessage}
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 text-sm text-slate-300">
          <h2 className="text-base font-semibold text-slate-100">
            {t("personaAi.boundaryTitle")}
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              {t("personaAi.boundary.localOnly")}
            </li>
            <li>{t("personaAi.boundary.noExecute")}</li>
            <li>{t("personaAi.boundary.noProvider")}</li>
            <li>{t("personaAi.boundary.noCanonicalId")}</li>
            <li>{t("personaAi.boundary.noExternalWrite")}</li>
            <li>
              {t("personaAi.boundary.validationLater")}
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
