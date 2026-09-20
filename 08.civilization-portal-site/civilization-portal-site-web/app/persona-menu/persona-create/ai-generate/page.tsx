"use client";

import Link from "next/link";
import { useState } from "react";

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
  const [generationConditions, setGenerationConditions] = useState("");
  const [draftMessage, setDraftMessage] = useState("");

  function saveDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const draft = createDraft(generationConditions);

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setDraftMessage("AI生成条件ドラフトを保存しました: " + draft.updatedAt);
  }

  function loadDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!rawDraft) {
      setDraftMessage("保存済みのAI生成条件ドラフトはありません。");
      return;
    }

    try {
      const parsedDraft: unknown = JSON.parse(rawDraft);

      if (!isUsableDraft(parsedDraft)) {
        setDraftMessage("保存済みドラフトの形式を確認できませんでした。");
        return;
      }

      setGenerationConditions(parsedDraft.generationConditions);
      setDraftMessage(
        "AI生成条件ドラフトを読み込みました: " + parsedDraft.updatedAt,
      );
    } catch {
      setDraftMessage("AI生成条件ドラフトの読み込みに失敗しました。");
    }
  }

  function clearDraft() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftMessage("AI生成条件ドラフトを削除しました。");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
          <p className="text-sm text-cyan-300">
            Persona作成 / PersonaBuilder
          </p>
          <h1 className="mt-2 text-3xl font-bold">AI自動生成</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            作成したいPersonaの条件を自由記述し、AI生成に渡す前段階の
            client-onlyドラフトとして保存します。
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300"
              href="/persona-menu/persona-create"
            >
              Persona作成メニューへ戻る
            </Link>
            <Link
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-300"
              href="/persona-menu"
            >
              Personaメニューへ戻る
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <label
            className="block text-sm font-semibold text-slate-100"
            htmlFor="generationConditions"
          >
            AI生成条件
          </label>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            作りたいPersonaの条件を自由に記述します。
            この入力内容自体は正本Personaではありません。
          </p>

          <textarea
            className="mt-4 min-h-64 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-300"
            id="generationConditions"
            onChange={(event) => setGenerationConditions(event.target.value)}
            placeholder="作成したいPersonaの条件を入力"
            value={generationConditions}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
              onClick={saveDraft}
              type="button"
            >
              条件をドラフト保存
            </button>

            <button
              className="rounded-full border border-slate-600 px-4 py-2 text-sm text-slate-100 hover:border-cyan-300"
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

            <button
              className="cursor-not-allowed rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-500"
              disabled
              type="button"
            >
              AI生成実行（未接続）
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
            現在の保存・実行境界
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              保存先はブラウザlocalStorageのAI生成条件ドラフトのみです。
            </li>
            <li>AI生成処理はまだ実行しません。</li>
            <li>AIモデル・AI provider・生成APIはまだ接続しません。</li>
            <li>正本Persona IDは作成しません。</li>
            <li>API POST、DB書込、外部ストレージ保存は行いません。</li>
            <li>
              Validation、審査、Approval、Canonical Applyは後続工程です。
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
