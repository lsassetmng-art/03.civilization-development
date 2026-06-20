"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";

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

const steps: Array<{ id: StepId; label: string; description: string }> = [
  {
    id: "image",
    label: "画像選択",
    description: "元画像を選択します。ドラフトには画像ファイル本体は保存しません。",
  },
  {
    id: "profile",
    label: "プロフィール",
    description: "Personaの基本説明と利用目的を整理します。",
  },
  {
    id: "voice",
    label: "声・話し方",
    description: "声の扱いと話し方の特徴を分けて入力します。",
  },
  {
    id: "capability",
    label: "能力・スキル",
    description: "できること、禁止すること、参照方針を設定します。",
  },
  {
    id: "confirm",
    label: "確認",
    description: "保存前の内容を確認します。まだAPI送信はしません。",
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
  const [stepIndex, setStepIndex] = useState(0);
  const [imageMeta, setImageMeta] = useState<ImageDraftMeta | null>(null);
  const [formState, setFormState] =
    useState<PersonaImageUploadFormState>(initialFormState);
  const [draftMessage, setDraftMessage] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const currentStep = steps[stepIndex];

  const imageLabel = useMemo(() => {
    if (!imageMeta) {
      return "画像は未選択です。";
    }

    return (
      imageMeta.fileName +
      " / " +
      imageMeta.mimeType +
      " / " +
      formatBytes(imageMeta.sizeBytes)
    );
  }, [imageMeta]);

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
    setDraftMessage("画像メタデータを取得しました。画像ファイル本体は保存しません。");
  }

  function saveDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const draft = createDraft(formState, imageMeta);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftMessage("ドラフトを保存しました: " + draft.updatedAt);
  }

  function loadDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!rawDraft) {
      setDraftMessage("保存済みドラフトはありません。");
      return;
    }

    try {
      const parsedDraft = JSON.parse(rawDraft) as PersonaImageUploadDraftV1;

      if (!isUsableDraft(parsedDraft)) {
        setDraftMessage("ドラフト形式が一致しません。");
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
      setDraftMessage(
        "保存済みドラフトを読み込みました。画像ファイル本体は復元されません。",
      );
    } catch {
      setDraftMessage("ドラフトの読み込みに失敗しました。");
    }
  }

  function clearDraft() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftMessage("ドラフト削除が完了しました。");
  }

  function goBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function goNext() {
    if (!canGoNext) {
      setDraftMessage("先に画像を選択してください。");
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
          <p className="text-sm text-cyan-300">Persona作成 / 画像アップロード</p>
          <h1 className="mt-2 text-3xl font-bold">画像からPersonaを作成</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            この画面は作成UIとclient-onlyドラフト保存です。最終保存、API送信、DB書込、
            Supabaseアップロード、画像分割、外部実行はまだ行いません。
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:border-cyan-300"
              href="/persona-menu/persona-create"
            >
              作成メニューへ戻る
            </Link>
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:border-cyan-300"
              href="/persona-menu"
            >
              Personaメニューへ戻る
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
              <span className="font-semibold">{step.label}</span>
            </button>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">{currentStep.label}</h2>
            <p className="mt-2 text-sm text-slate-300">
              {currentStep.description}
            </p>
          </div>

          {currentStep.id === "image" && (
            <div className="grid gap-5">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold">元画像</span>
                <input
                  accept="image/*"
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sm"
                  onChange={handleImageChange}
                  type="file"
                />
              </label>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">選択状態</p>
                <p className="mt-2">{imageLabel}</p>
                <p className="mt-2 text-xs text-amber-200">
                  画像ファイル本体は保存しません。ドラフトに保存するのは
                  fileName / mimeType / sizeBytes のみです。
                </p>
              </div>
            </div>
          )}

          {currentStep.id === "profile" && (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span>Persona名</span>
                <input
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField("personaName", event.target.value)
                  }
                  placeholder="例：案内役ミサキ"
                  value={formState.profile.personaName}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>説明</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField("description", event.target.value)
                  }
                  placeholder="見た目や役割の説明"
                  value={formState.profile.description}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>性格概要</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField(
                      "personalitySummary",
                      event.target.value,
                    )
                  }
                  placeholder="落ち着いている、説明が丁寧、など"
                  value={formState.profile.personalitySummary}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>利用目的</span>
                <input
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateProfileField("usagePurpose", event.target.value)
                  }
                  placeholder="例：案内、相談、制作補助"
                  value={formState.profile.usagePurpose}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>公開方針</span>
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
                  <option value="private">非公開</option>
                  <option value="review_later">あとで審査に出す</option>
                  <option value="public_after_review">
                    審査後に公開を検討
                  </option>
                </select>
              </label>
            </div>
          )}

          {currentStep.id === "voice" && (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span>声の扱い</span>
                <select
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("provider", event.target.value)
                  }
                  value={formState.voice.provider}
                >
                  <option value="later">あとで設定</option>
                  <option value="none">声なし</option>
                  <option value="voicevox">VOICEVOX候補</option>
                  <option value="tts">TTS候補</option>
                </select>
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="grid gap-2 text-sm">
                  <span>一人称</span>
                  <input
                    className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                    onChange={(event) =>
                      updateVoiceField("firstPerson", event.target.value)
                    }
                    placeholder="例：私"
                    value={formState.voice.firstPerson}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>二人称</span>
                  <input
                    className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                    onChange={(event) =>
                      updateVoiceField("secondPerson", event.target.value)
                    }
                    placeholder="例：あなた"
                    value={formState.voice.secondPerson}
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>敬語レベル</span>
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
                    <option value="casual">くだけた話し方</option>
                    <option value="normal">敬語レベル: 標準</option>
                    <option value="polite">敬語レベル: 丁寧</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm">
                <span>決め台詞</span>
                <input
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("catchphrase", event.target.value)
                  }
                  placeholder="例：一緒に整理しましょう"
                  value={formState.voice.catchphrase}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>サンプル台詞</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("sampleLines", event.target.value)
                  }
                  placeholder="話し方が分かる例文"
                  value={formState.voice.sampleLines}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>NG表現</span>
                <textarea
                  className="min-h-20 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateVoiceField("ngExpressions", event.target.value)
                  }
                  placeholder="使わせたくない表現"
                  value={formState.voice.ngExpressions}
                />
              </label>
            </div>
          )}

          {currentStep.id === "capability" && (
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span>得意なこと</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField("strengths", event.target.value)
                  }
                  value={formState.capability.strengths}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>苦手なこと</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField("weaknesses", event.target.value)
                  }
                  value={formState.capability.weaknesses}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>対応できる作業</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-slate-700 bg-slate-950 p-3"
                  onChange={(event) =>
                    updateCapabilityField("supportedWork", event.target.value)
                  }
                  value={formState.capability.supportedWork}
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>禁止する行動</span>
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
                <span>知識参照方針</span>
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
                <h3 className="font-semibold">確認内容</h3>
                <dl className="mt-3 grid gap-2 text-sm text-slate-300">
                  <div>
                    <dt className="text-slate-500">画像</dt>
                    <dd>{imageLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Persona名</dt>
                    <dd>{formState.profile.personaName || "未入力"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">公開方針</dt>
                    <dd>{formState.profile.publicIntent}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">声の扱い</dt>
                    <dd>{formState.voice.provider}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">敬語レベル</dt>
                    <dd>{formState.voice.keigoLevel}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                最終保存はまだプレビューです。正本作成、審査投入、公開、販売、配布は
                後続RでAPI契約を設計してから接続します。
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
              戻る
            </button>
            {stepIndex < steps.length - 1 ? (
              <button
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
                disabled={!canGoNext}
                onClick={goNext}
                type="button"
              >
                次へ
              </button>
            ) : (
              <button
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                onClick={openCompletionPreview}
                type="button"
              >
                完了プレビュー
              </button>
            )}
            <button
              className="rounded-full border border-cyan-300 px-4 py-2 text-sm text-cyan-100"
              onClick={saveDraft}
              type="button"
            >
              ドラフト保存
            </button>
            <button
              className="rounded-full border border-slate-700 px-4 py-2 text-sm"
              onClick={loadDraft}
              type="button"
            >
              保存済みドラフトを読み込み
            </button>
            <button
              className="rounded-full border border-rose-400/70 px-4 py-2 text-sm text-rose-100"
              onClick={clearDraft}
              type="button"
            >
              ドラフト削除
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
            保存境界
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>ドラフト保存はブラウザlocalStorageのみです。</li>
            <li>画像ファイル本体は保存しません。</li>
            <li>正本Persona IDはまだ作成しません。</li>
            <li>API送信、DB書込、外部ストレージ保存は行いません。</li>
            <li>公開・販売・配布は事前審査と本審査の後に扱います。</li>
          </ul>
        </section>
      </div>

      {showCompletionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-cyan-300/40 bg-slate-900 p-6 shadow-2xl">
            <p className="text-sm text-cyan-300">完了プレビュー</p>
            <h2 className="mt-2 text-2xl font-bold">
              Persona作成内容を確認しました
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              この段階ではclient-onlyドラフトと完了プレビューのみです。
              正本保存、審査提出、画像処理、外部保存はまだ実行していません。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                onClick={() => setShowCompletionDialog(false)}
                type="button"
              >
                閉じる
              </button>
              <button
                className="rounded-full border border-cyan-300 px-4 py-2 text-sm text-cyan-100"
                onClick={saveDraft}
                type="button"
              >
                この内容をドラフト保存
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
