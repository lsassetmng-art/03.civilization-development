"use client";

import Link from "../../../components/navigation/persona-route-link";
import { useEffect, useState } from "react";
import { usePersonaI18n } from "../../../components/i18n/persona-i18n-provider";

const DRAFT_STORAGE_KEY = "portal.persona.create.imageUploadDraft.v1";

type Draft = {
  schemaVersion?: number;
  route?: string;
  updatedAt?: string;
  image?: { fileName?: string; mimeType?: string; sizeBytes?: number };
  profile?: { personaName?: string; description?: string; publicIntent?: string };
  voice?: { provider?: string; keigoLevel?: string };
  capability?: { supportedWork?: string[] };
};

function bytes(
  sizeBytes: number | undefined,
  missingText: string,
) {
  if (
    typeof sizeBytes !== "number" ||
    !Number.isFinite(sizeBytes)
  ) {
    return missingText;
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function dateText(
  value: string | undefined,
  locale: "ja" | "en",
  missingText: string,
) {
  if (!value) {
    return missingText;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "ja-JP",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function label(
  value: string | undefined,
  fallback: string,
) {
  return value && value.trim().length > 0
    ? value
    : fallback;
}

export default function PersonaDraftsPage() {
  const { locale, t } = usePersonaI18n();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [messageKey, setMessageKey] = useState(
    "personaDrafts.message.checking",
  );
  const [loaded, setLoaded] = useState(false);

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        setDraft(null);
        setMessageKey("personaDrafts.message.noSaved");
        setLoaded(true);
        return;
      }

      setDraft(JSON.parse(raw) as Draft);
      setMessageKey("personaDrafts.message.loaded");
      setLoaded(true);
    } catch {
      setDraft(null);
      setMessageKey("personaDrafts.message.loadFailed");
      setLoaded(true);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraft(null);
    setMessageKey("personaDrafts.message.deleted");
    setLoaded(true);
  };

  useEffect(() => {
    loadDraft();
  }, []);

  const values = draft?.capability?.supportedWork;
  const workText =
    values && values.length > 0
      ? values.join(" / ")
      : t("personaDrafts.value.notSet");

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-sm font-semibold text-cyan-300">Persona Builder</p>
          <h1 className="mt-2 text-3xl font-bold">{t("personaDrafts.title")}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {t("personaDrafts.description")}
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t("personaDrafts.stateTitle")}</h2>
              <p className="mt-1 text-sm text-slate-300">{t(messageKey)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadDraft}
                className="rounded-full border border-cyan-400/50 px-4 py-2 text-sm font-semibold text-cyan-100"
              >
                {t("personaDrafts.reload")}
              </button>
              <Link
                href="/persona-menu/persona-create/image-upload"
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                {t("personaDrafts.backCreate")}
              </Link>
            </div>
          </div>
        </section>

        {loaded && !draft ? (
          <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
            <h2 className="text-xl font-semibold">{t("personaDrafts.emptyTitle")}</h2>
            <p className="mt-3 text-sm text-slate-300">
              {t("personaDrafts.emptyDescription")}
            </p>
            <Link
              href="/persona-menu/persona-create/image-upload"
              className="mt-5 inline-flex rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-950"
            >
              {t("personaDrafts.openImage")}
            </Link>
          </section>
        ) : null}

        {draft ? (
          <div className="grid gap-4">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">{t("personaDrafts.savedInfo")}</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">{t("personaDrafts.savedAt")}</dt>
                  <dd className="mt-1 font-semibold">{dateText(draft.updatedAt, locale, t("personaDrafts.value.notRecorded"))}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">schemaVersion</dt>
                  <dd className="mt-1 font-semibold">{draft.schemaVersion ?? t("personaDrafts.value.notRecorded")}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">{t("personaDrafts.imageMetadata")}</h2>
              <p className="mt-2 text-sm text-amber-200">
                {t("personaDrafts.imageMetadataNotice")}
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">fileName</dt>
                  <dd className="mt-1 break-words font-semibold">{label(draft.image?.fileName, t("personaDrafts.value.notRecorded"))}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">mimeType</dt>
                  <dd className="mt-1 font-semibold">{label(draft.image?.mimeType, t("personaDrafts.value.notRecorded"))}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">sizeBytes</dt>
                  <dd className="mt-1 font-semibold">{bytes(draft.image?.sizeBytes, t("personaDrafts.value.notRecorded"))}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">{t("personaDrafts.profile")}</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">{t("personaDrafts.personaName")}</dt>
                  <dd className="mt-1 font-semibold">{label(draft.profile?.personaName, t("personaDrafts.value.notSet"))}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">{t("personaDrafts.descriptionLabel")}</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{label(draft.profile?.description, t("personaDrafts.value.notSet"))}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">{t("personaDrafts.publicIntent")}</dt>
                  <dd className="mt-1 font-semibold">{label(draft.profile?.publicIntent, t("personaDrafts.value.notSet"))}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">{t("personaDrafts.voiceCapability")}</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">{t("personaDrafts.voice")}</dt>
                  <dd className="mt-1 font-semibold">{label(draft.voice?.provider, t("personaDrafts.value.notSet"))}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">{t("personaDrafts.speech")}</dt>
                  <dd className="mt-1 font-semibold">{label(draft.voice?.keigoLevel, t("personaDrafts.value.notSet"))}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">{t("personaDrafts.supportedWork")}</dt>
                  <dd className="mt-1 font-semibold">{workText}</dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                {t("personaDrafts.localOnly")}
              </p>
              {/* PERSONAOS_R13_DRAFT_RESUME_START */}
              <div
                data-persona-draft-resume-action="true"
                style={{
                  display: "grid",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <Link
                  href="/persona-menu/persona-create/image-upload?resumeDraft=1"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 44,
                    padding: "10px 16px",
                    border: "1px solid currentColor",
                    borderRadius: 10,
                    color: "inherit",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  {t("personaDrafts.resume")}
                </Link>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.6,
                    opacity: 0.72,
                  }}
                >
                  {t("personaDrafts.resumeHelp")}
                </p>
              </div>
              {/* PERSONAOS_R13_DRAFT_RESUME_END */}
              <button
                type="button"
                onClick={clearDraft}
                className="rounded-full border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-100"
              >
                {t("personaDrafts.delete")}
              </button>
            </section>
          </div>
        ) : null}

        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/persona-menu/persona-create" className="text-cyan-200">
            {t("personaDrafts.backCreationMenu")}
          </Link>
          <Link href="/persona-menu" className="text-cyan-200">
            {t("personaDrafts.backPersonaMenu")}
          </Link>
        </nav>
      </div>
    </main>
  );
}
