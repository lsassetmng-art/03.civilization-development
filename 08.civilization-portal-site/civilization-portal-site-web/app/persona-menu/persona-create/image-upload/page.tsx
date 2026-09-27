"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { usePortalI18n } from "../../../../components/i18n/portal-i18n-provider";

type StepId = "image" | "profile" | "voice" | "capability" | "confirm";

type PublicIntent = "private" | "review_later" | "public_after_review";
type VoiceProvider = "none" | "voicevox" | "tts" | "later";
type KeigoLevel = "casual" | "normal" | "polite";

type ImageDraftMeta = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

type PersonaImageUploadFormState = {
  profile: {
    personaName: string;
    description: string;
    personalitySummary: string;
    usagePurpose: string;
    publicIntent: PublicIntent;
  };
  voice: {
    provider: VoiceProvider;
    firstPerson: string;
    secondPerson: string;
    keigoLevel: KeigoLevel;
    catchphrase: string;
    sampleLines: string;
    ngExpressions: string;
  };
  capability: {
    strengths: string;
    weaknesses: string;
    supportedWork: string;
    prohibitedActions: string;
    knowledgePolicy: string;
  };
};

type PersonaImageUploadDraftV1 = PersonaImageUploadFormState & {
  schemaVersion: 1;
  route: "persona-create/image-upload";
  updatedAt: string;
  image: ImageDraftMeta | null;
};

const DRAFT_STORAGE_KEY = "portal.persona.create.imageUploadDraft.v1";
const DRAFT_ROUTE = "persona-create/image-upload" as const;

const steps: Array<{
  id: StepId;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    id: "image",
    labelKey: "personaImage.step.image.label",
    descriptionKey: "personaImage.step.image.description",
  },
  {
    id: "profile",
    labelKey: "personaImage.step.profile.label",
    descriptionKey: "personaImage.step.profile.description",
  },
  {
    id: "voice",
    labelKey: "personaImage.step.voice.label",
    descriptionKey: "personaImage.step.voice.description",
  },
  {
    id: "capability",
    labelKey: "personaImage.step.capability.label",
    descriptionKey: "personaImage.step.capability.description",
  },
  {
    id: "confirm",
    labelKey: "personaImage.step.confirm.label",
    descriptionKey: "personaImage.step.confirm.description",
  },
];

const initialFormState: PersonaImageUploadFormState = {
  profile: {
    personaName: "",
    description: "",
    personalitySummary: "",
    usagePurpose: "",
    publicIntent: "private",
  },
  voice: {
    provider: "later",
    firstPerson: "",
    secondPerson: "",
    keigoLevel: "normal",
    catchphrase: "",
    sampleLines: "",
    ngExpressions: "",
  },
  capability: {
    strengths: "",
    weaknesses: "",
    supportedWork: "",
    prohibitedActions: "",
    knowledgePolicy: "",
  },
};

function formatBytes(sizeBytes: number): string {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "0 B";
  }

  if (sizeBytes < 1024) {
    return sizeBytes + " B";
  }

  if (sizeBytes < 1024 * 1024) {
    return Math.round(sizeBytes / 1024) + " KB";
  }

  return (sizeBytes / 1024 / 1024).toFixed(1) + " MB";
}

function createDraft(
  formState: PersonaImageUploadFormState,
  image: ImageDraftMeta | null,
): PersonaImageUploadDraftV1 {
  return {
    schemaVersion: 1,
    route: DRAFT_ROUTE,
    updatedAt: new Date().toISOString(),
    image,
    profile: formState.profile,
    voice: formState.voice,
    capability: formState.capability,
  };
}

function isUsableDraft(value: PersonaImageUploadDraftV1): boolean {
  return value.schemaVersion === 1 && value.route === DRAFT_ROUTE;
}

export default function PersonaImageUploadCreatePage() {
  const { t } = usePortalI18n();
  const [stepIndex, setStepIndex] = useState(0);
  const [imageMeta, setImageMeta] = useState<ImageDraftMeta | null>(null);
  const [formState, setFormState] =
    useState<PersonaImageUploadFormState>(initialFormState);
  const [draftMessage, setDraftMessage] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const currentStep = steps[stepIndex];

  const imageLabel = useMemo(() => {
    if (!imageMeta) {
      return t("personaImage.image.none");
    }

    return (
      imageMeta.fileName +
      " / " +
      imageMeta.mimeType +
      " / " +
      formatBytes(imageMeta.sizeBytes)
    );
  }, [imageMeta, t]);

  const canGoNext = currentStep.id !== "image" || Boolean(imageMeta);

  function updateProfileField(
    field: keyof PersonaImageUploadFormState["profile"],
    value: string,
  ) {
    setFormState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      },
    }));
  }

  function updateVoiceField(
    field: keyof PersonaImageUploadFormState["voice"],
    value: string,
  ) {
    setFormState((current) => ({
      ...current,
      voice: {
        ...current.voice,
        [field]: value,
      },
    }));
  }

  function updateCapabilityField(
    field: keyof PersonaImageUploadFormState["capability"],
    value: string,
  ) {
    setFormState((current) => ({
      ...current,
      capability: {
        ...current.capability,
        [field]: value,
      },
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageMeta(null);
      return;
    }

    setImageMeta({
      fileName: file.name,
      mimeType: file.type || "unknown",
      sizeBytes: file.size,
    });
    setDraftMessage(t("personaImage.message.imageMeta"));
  }

  function saveDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const draft = createDraft(formState, imageMeta);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftMessage(t("personaImage.message.savedPrefix") + draft.updatedAt);
  }

  function loadDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!rawDraft) {
      setDraftMessage(t("personaImage.message.noSaved"));
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as PersonaImageUploadDraftV1;

      if (!isUsableDraft(parsedDraft)) {
        setDraftMessage(t("personaImage.message.invalid"));
        return;
      }

      setImageMeta(parsedDraft.image ?? null);
      setFormState({
        profile: {
          ...initialFormState.profile,
          ...parsedDraft.profile,
        },
        voice: {
          ...initialFormState.voice,
          ...parsedDraft.voice,
        },
        capability: {
          ...initialFormState.capability,
          ...parsedDraft.capability,
        },
      });
      setDraftMessage(t("personaImage.message.loaded"));
    } catch {
      setDraftMessage(t("personaImage.message.loadFailed"));
    }
  }

  function clearDraft() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftMessage(t("personaImage.message.deleted"));
  }

  function goBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    if (!canGoNext) {
      setDraftMessage(t("personaImage.message.selectFirst"));
      return;
    }

    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
  }

  function openCompletionPreview() {
    setShowCompletionDialog(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <p className="text-sm text-cyan-300">{t("personaImage.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-bold">{t("personaImage.title")}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {t("personaImage.description")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:border-cyan-300"
              href="/persona-menu/persona-create"
            >
              {t("personaImage.backCreate")}
            </Link>
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:border-cyan-300"
              href="/persona-menu"
            >
              {t("personaImage.backMenu")}
            </Link>
          </div>
        </header>

        <section className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <button
              className={
                "rounded-2xl border px-3 py-3 text-left text-sm " +
                (index === stepIndex
                  ? "border-cyan-300 bg-cyan-300/10 text-cyan-100"
                  : "border-slate-800 bg-slate-950/40 text-slate-300")
              }
              key={step.id}
              onClick={() => setStepIndex(index)}
              type="button"
            >
              <span className="block text-xs text-slate-400">
                Step {index + 1}
              </span>
              <span className="font-semibold">{t(step.labelKey)}</span>
            </button>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">{t(currentStep.labelKey)}</h2>
            <p className="mt-2 text-sm text-slate-300">
              {t(currentStep.descriptionKey)}
            </p>
          </div>

          {currentStep.id === "image" && (
            <div className="grid gap-5">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold">{t("personaImage.sourceImage")}</span>
                <input
                  accept="image/*"
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sm"
                  onChange={handleImageChange}
                  type="file"
                />
              </label>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">{t("personaImage.selectionStatus")}</p>
                <p className="mt-2">{imageLabel}</p>
                <p className="mt-2 text-xs text-amber-200">
                  {t("personaImage.selectionNotice")}
                </p>
              </div>
            </div>
          )}

          {currentStep.id === "profile" && (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.profile.personaName")}</span>
                <input
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField("personaName", event.target.value)
                  }
                  placeholder={t("personaImage.profile.personaNamePlaceholder")}
                  value={formState.profile.personaName}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.profile.description")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField("description", event.target.value)
                  }
                  placeholder={t("personaImage.profile.descriptionPlaceholder")}
                  value={formState.profile.description}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.profile.personality")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField(
                      "personalitySummary",
                      event.target.value,
                    )
                  }
                  placeholder={t("personaImage.profile.personalityPlaceholder")}
                  value={formState.profile.personalitySummary}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.profile.usagePurpose")}</span>
                <input
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField("usagePurpose", event.target.value)
                  }
                  placeholder={t("personaImage.profile.usagePurposePlaceholder")}
                  value={formState.profile.usagePurpose}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.profile.publicPolicy")}</span>
                <select
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField(
                      "publicIntent",
                      event.target.value as PublicIntent,
                    )
                  }
                  value={formState.profile.publicIntent}
                >
                  <option value="private">{t("personaImage.profile.public.private")}</option>
                  <option value="review_later">{t("personaImage.profile.public.reviewLater")}</option>
                  <option value="public_after_review">
                    {t("personaImage.profile.public.afterReview")}
                  </option>
                </select>
              </label>
            </div>
          )}

          {currentStep.id === "voice" && (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.voice.handling")}</span>
                <select
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("provider", event.target.value)
                  }
                  value={formState.voice.provider}
                >
                  <option value="later">{t("personaImage.voice.later")}</option>
                  <option value="none">{t("personaImage.voice.none")}</option>
                  <option value="voicevox">{t("personaImage.voice.voicevox")}</option>
                  <option value="tts">{t("personaImage.voice.tts")}</option>
                </select>
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm">
                  <span>{t("personaImage.voice.firstPerson")}</span>
                  <input
                    className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                    onChange={(event) =>
                      updateVoiceField("firstPerson", event.target.value)
                    }
                    placeholder={t("personaImage.voice.firstPersonPlaceholder")}
                    value={formState.voice.firstPerson}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>{t("personaImage.voice.secondPerson")}</span>
                  <input
                    className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                    onChange={(event) =>
                      updateVoiceField("secondPerson", event.target.value)
                    }
                    placeholder={t("personaImage.voice.secondPersonPlaceholder")}
                    value={formState.voice.secondPerson}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>{t("personaImage.voice.keigoLevel")}</span>
                  <select
                    className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                    onChange={(event) =>
                      updateVoiceField(
                        "keigoLevel",
                        event.target.value as KeigoLevel,
                      )
                    }
                    value={formState.voice.keigoLevel}
                  >
                    <option value="casual">{t("personaImage.voice.casual")}</option>
                    <option value="normal">{t("personaImage.voice.normal")}</option>
                    <option value="polite">{t("personaImage.voice.polite")}</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.voice.catchphrase")}</span>
                <input
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("catchphrase", event.target.value)
                  }
                  placeholder={t("personaImage.voice.catchphrasePlaceholder")}
                  value={formState.voice.catchphrase}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.voice.sampleLines")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("sampleLines", event.target.value)
                  }
                  placeholder={t("personaImage.voice.sampleLinesPlaceholder")}
                  value={formState.voice.sampleLines}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.voice.ngExpressions")}</span>
                <textarea
                  className="min-h-20 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("ngExpressions", event.target.value)
                  }
                  placeholder={t("personaImage.voice.ngExpressionsPlaceholder")}
                  value={formState.voice.ngExpressions}
                />
              </label>
            </div>
          )}

          {currentStep.id === "capability" && (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.capability.strengths")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField("strengths", event.target.value)
                  }
                  value={formState.capability.strengths}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.capability.weaknesses")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField("weaknesses", event.target.value)
                  }
                  value={formState.capability.weaknesses}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.capability.supportedWork")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField("supportedWork", event.target.value)
                  }
                  value={formState.capability.supportedWork}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.capability.prohibitedActions")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField(
                      "prohibitedActions",
                      event.target.value,
                    )
                  }
                  value={formState.capability.prohibitedActions}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>{t("personaImage.capability.knowledgePolicy")}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField("knowledgePolicy", event.target.value)
                  }
                  value={formState.capability.knowledgePolicy}
                />
              </label>
            </div>
          )}

          {currentStep.id === "confirm" && (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="font-semibold">{t("personaImage.confirm.title")}</h3>
                <dl className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div>
                    <dt className="text-slate-500">{t("personaImage.confirm.image")}</dt>
                    <dd>{imageLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t("personaImage.profile.personaName")}</dt>
                    <dd>{formState.profile.personaName || t("personaImage.confirm.notEntered")}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t("personaImage.profile.publicPolicy")}</dt>
                    <dd>{formState.profile.publicIntent}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t("personaImage.voice.handling")}</dt>
                    <dd>{formState.voice.provider}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{t("personaImage.voice.keigoLevel")}</dt>
                    <dd>{formState.voice.keigoLevel}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                {t("personaImage.confirm.previewNotice")}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-sm disabled:opacity-40"
              disabled={stepIndex === 0}
              onClick={goBack}
              type="button"
            >
              {t("personaImage.button.back")}
            </button>
            {stepIndex < steps.length - 1 ? (
              <button
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
                disabled={!canGoNext}
                onClick={goNext}
                type="button"
              >
                {t("personaImage.button.next")}
              </button>
            ) : (
              <button
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                onClick={openCompletionPreview}
                type="button"
              >
                {t("personaImage.button.completePreview")}
              </button>
            )}
            <button
              className="rounded-full border border-cyan-300 px-4 py-2 text-sm text-cyan-100"
              onClick={saveDraft}
              type="button"
            >
              {t("personaImage.button.saveDraft")}
            </button>
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-sm"
              onClick={loadDraft}
              type="button"
            >
              {t("personaImage.button.loadDraft")}
            </button>
            <button
              className="rounded-full border border-rose-400/70 px-4 py-2 text-sm text-rose-100"
              onClick={clearDraft}
              type="button"
            >
              {t("personaImage.button.deleteDraft")}
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
            {t("personaImage.boundary.title")}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>{t("personaImage.boundary.localOnly")}</li>
            <li>{t("personaImage.boundary.noImageFile")}</li>
            <li>{t("personaImage.boundary.noCanonicalId")}</li>
            <li>{t("personaImage.boundary.noExternalWrite")}</li>
            <li>{t("personaImage.boundary.reviewBeforePublish")}</li>
          </ul>
        </section>
      </div>

      {showCompletionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-300/40 bg-slate-900 p-6 shadow-2xl">
            <p className="text-sm text-cyan-300">{t("personaImage.dialog.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-bold">
              {t("personaImage.dialog.title")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {t("personaImage.dialog.description")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                onClick={() => setShowCompletionDialog(false)}
                type="button"
              >
                {t("personaImage.dialog.close")}
              </button>
              <button
                className="rounded-full border border-cyan-300 px-4 py-2 text-sm text-cyan-100"
                onClick={saveDraft}
                type="button"
              >
                {t("personaImage.dialog.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
