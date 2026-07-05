"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

function bytes(sizeBytes?: number) {
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes)) return "未記録";
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function dateText(value?: string) {
  if (!value) return "未記録";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function label(value?: string, fallback = "未設定") {
  return value && value.trim().length > 0 ? value : fallback;
}

export default function PersonaDraftsPage() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("ドラフトを確認しています。");
  const [loaded, setLoaded] = useState(false);

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        setDraft(null);
        setMessage("保存済みドラフトはありません。");
        setLoaded(true);
        return;
      }

      setDraft(JSON.parse(raw) as Draft);
      setMessage("保存済みドラフトを読み込みました。");
      setLoaded(true);
    } catch {
      setDraft(null);
      setMessage("ドラフトの読み込みに失敗しました。保存データが壊れている可能性があります。");
      setLoaded(true);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraft(null);
    setMessage("ドラフトを削除しました。");
    setLoaded(true);
  };

  useEffect(() => {
    loadDraft();
  }, []);

  const workText = useMemo(() => {
    const values = draft?.capability?.supportedWork;
    return values && values.length > 0 ? values.join(" / ") : "未設定";
  }, [draft]);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
          <p className="text-sm font-semibold text-cyan-300">Persona Builder</p>
          <h1 className="mt-2 text-3xl font-bold">作成中ドラフト</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            この画面は、この端末のブラウザに保存されたPersona画像作成ドラフトを読み取ります。
            正本作成、審査提出、画像処理、VisualRuntime実行は行いません。
          </p>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">ドラフト状態</h2>
              <p className="mt-1 text-sm text-slate-300">{message}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadDraft}
                className="rounded-full border border-cyan-400/50 px-4 py-2 text-sm font-semibold text-cyan-100"
              >
                ドラフトを再読み込み
              </button>
              <Link
                href="/persona-menu/persona-create/image-upload"
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                作成画面へ戻る
              </Link>
            </div>
          </div>
        </section>

        {loaded && !draft ? (
          <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
            <h2 className="text-xl font-semibold">表示できるドラフトはありません</h2>
            <p className="mt-3 text-sm text-slate-300">
              画像からPersonaを作成する画面でドラフト保存すると、この画面に概要が表示されます。
            </p>
            <Link
              href="/persona-menu/persona-create/image-upload"
              className="mt-5 inline-flex rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-950"
            >
              画像作成画面へ
            </Link>
          </section>
        ) : null}

        {draft ? (
          <div className="grid gap-4">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">保存情報</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">保存日時</dt>
                  <dd className="mt-1 font-semibold">{dateText(draft.updatedAt)}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">schemaVersion</dt>
                  <dd className="mt-1 font-semibold">{draft.schemaVersion ?? "未記録"}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">画像メタデータ</h2>
              <p className="mt-2 text-sm text-amber-200">
                画像ファイル本体は保存されていません。fileName / mimeType / sizeBytes のみ表示します。
              </p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">fileName</dt>
                  <dd className="mt-1 break-words font-semibold">{label(draft.image?.fileName, "未記録")}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">mimeType</dt>
                  <dd className="mt-1 font-semibold">{label(draft.image?.mimeType, "未記録")}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">sizeBytes</dt>
                  <dd className="mt-1 font-semibold">{bytes(draft.image?.sizeBytes)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">プロフィール</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">Persona名</dt>
                  <dd className="mt-1 font-semibold">{label(draft.profile?.personaName)}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">説明</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{label(draft.profile?.description)}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">公開意図</dt>
                  <dd className="mt-1 font-semibold">{label(draft.profile?.publicIntent)}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">声・話し方 / 能力</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">声</dt>
                  <dd className="mt-1 font-semibold">{label(draft.voice?.provider)}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">話し方</dt>
                  <dd className="mt-1 font-semibold">{label(draft.voice?.keigoLevel)}</dd>
                </div>
                <div className="rounded-2xl bg-slate-950/70 p-4">
                  <dt className="text-slate-400">対応作業</dt>
                  <dd className="mt-1 font-semibold">{workText}</dd>
                </div>
              </dl>
            </section>

            <section className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                このドラフトは端末内保存です。別端末や別ブラウザには同期されません。
              </p>
              <button
                type="button"
                onClick={clearDraft}
                className="rounded-full border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-100"
              >
                このドラフトを削除
              </button>
            </section>
          </div>
        ) : null}

        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/persona-menu/persona-create" className="text-cyan-200">
            作成メニューへ戻る
          </Link>
          <Link href="/persona-menu" className="text-cyan-200">
            Personaメニューへ戻る
          </Link>
        </nav>
      </div>
    </main>
  );
}
