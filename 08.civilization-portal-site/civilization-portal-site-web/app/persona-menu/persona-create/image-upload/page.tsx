"use client";

import { ChangeEvent, useMemo, useState } from "react";

const steps = [
  "画像選択",
  "プロフィール作成",
  "声・話し方作成",
  "能力・スキル作成",
  "確認",
  "保存待ち",
  "完了",
] as const;

const visualRuntimeParts = ["base", "brows", "eyes", "hair", "mouth"] as const;

const savePreviewItems = [
  "画像分割処理",
  "VisualRuntime互換パーツ化",
  "private draft/review storage save",
  "Persona non-visual info save",
  "completion dialog",
] as const;

export default function ImageUploadPersonaCreatePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [imageName, setImageName] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const currentStep = steps[stepIndex];
  const progressPercent = useMemo(() => Math.round(((stepIndex + 1) / steps.length) * 100), [stepIndex]);

  const goNext = () => {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageName(file?.name ?? "");
  };

  const openCompletionPreview = () => {
    setStepIndex(steps.length - 1);
    setShowCompletionDialog(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">PersonaBuilder</p>
          <h1 className="text-2xl font-bold">画像アップロードで作成</h1>
          <p className="mt-2 text-sm text-slate-600">
            画像選択から確認までを順番に進めます。途中でドラフト保存できます。
          </p>
        </header>

        <nav className="rounded-2xl bg-white p-4 shadow-sm" aria-label="Persona作成ステップ">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold">{currentStep}</span>
            <span className="text-slate-500">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
          <ol className="mt-4 grid gap-2 md:grid-cols-7">
            {steps.map((step, index) => (
              <li key={step}>
                <button
                  type="button"
                  onClick={() => setStepIndex(index)}
                  className={`w-full rounded-full border px-3 py-2 text-xs ${
                    index === stepIndex
                      ? "border-slate-900 bg-slate-900 text-white"
                      : index < stepIndex
                        ? "border-slate-300 bg-slate-100 text-slate-800"
                        : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {index + 1}. {step}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            {stepIndex === 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">1. 画像選択</h2>
                <p className="text-sm text-slate-600">
                  ここではUIのみを実装しています。画像はアップロードせず、ファイル名の表示だけ行います。
                </p>
                <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                  <span className="block text-sm font-semibold">画像ファイルを選択</span>
                  <span className="mt-1 block text-xs text-slate-500">PNG / JPG / WEBP 想定。実保存は未実装。</span>
                  <input className="mt-4 w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={onImageChange} />
                </label>
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="font-semibold">選択中の画像</p>
                  <p className="mt-1 text-slate-600">{imageName || "未選択"}</p>
                </div>
              </div>
            )}

            {stepIndex === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">2. プロフィール作成</h2>
                <div className="grid gap-3">
                  <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Persona名" />
                  <textarea className="min-h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="説明" />
                  <textarea className="min-h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="性格概要" />
                  <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="利用目的" />
                  <select className="rounded-xl border border-slate-300 px-3 py-2" defaultValue="private">
                    <option value="private">非公開で作成</option>
                    <option value="reviewLater">後で審査申請</option>
                    <option value="reviewPlanned">公開予定あり</option>
                  </select>
                </div>
              </div>
            )}

            {stepIndex === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">3. 声・話し方作成</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  <select className="rounded-xl border border-slate-300 px-3 py-2" defaultValue="setLater">
                    <option value="none">音声なし</option>
                    <option value="voicevox">VOICEVOX test</option>
                    <option value="tts">TTS test</option>
                    <option value="setLater">後で設定</option>
                  </select>
                  <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="一人称 例: 私 / 僕" />
                  <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="二人称 例: あなた / 君" />
                  <select className="rounded-xl border border-slate-300 px-3 py-2" defaultValue="normal">
                    <option value="casual">くだけた話し方</option>
                    <option value="normal">敬語レベル: 標準</option>
                    <option value="polite">敬語レベル: 丁寧</option>
                  </select>
                  <select className="rounded-xl border border-slate-300 px-3 py-2" defaultValue="medium">
                    <option value="short">短め</option>
                    <option value="medium">標準</option>
                    <option value="long">長め</option>
                  </select>
                  <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="口癖" />
                </div>
                <textarea className="min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="サンプル台詞" />
                <textarea className="min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="NG表現" />
              </div>
            )}

            {stepIndex === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">4. 能力・スキル作成</h2>
                <div className="grid gap-3">
                  <textarea className="min-h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="得意分野" />
                  <textarea className="min-h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="苦手分野" />
                  <textarea className="min-h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="対応できる作業" />
                  <textarea className="min-h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="禁止事項" />
                  <textarea className="min-h-24 rounded-xl border border-slate-300 px-3 py-2" placeholder="参照ナレッジ方針" />
                </div>
              </div>
            )}

            {stepIndex === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">5. 確認</h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-semibold">選択画像</p>
                  <p className="mt-1 text-slate-600">{imageName || "未選択"}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  作成直後は非公開です。公開・販売・配布には 事前審査 → 本審査 が必要です。
                </div>
              </div>
            )}

            {stepIndex === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">6. 保存待ち / progress preview</h2>
                <p className="text-sm text-slate-600">この画面は保存順序のプレビューです。処理は実行しません。</p>
                <ol className="space-y-2">
                  {savePreviewItems.map((item, index) => (
                    <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                      {index + 1}. {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {stepIndex === 6 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">7. 完了</h2>
                <p className="text-sm text-slate-600">完了報告はダイアログで表示します。</p>
                <button
                  type="button"
                  onClick={() => setShowCompletionDialog(true)}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
                >
                  完了ダイアログを表示
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <a href="/persona-menu/persona-create" className="rounded-full border border-slate-300 px-4 py-2 text-sm">
                Persona作成メニューへ戻る
              </a>
              <div className="flex gap-2">
                <button type="button" onClick={goBack} className="rounded-full border border-slate-300 px-4 py-2 text-sm" disabled={stepIndex === 0}>
                  戻る
                </button>
                <button type="button" className="rounded-full border border-slate-300 px-4 py-2 text-sm">
                  ドラフト保存
                </button>
                {stepIndex < 5 ? (
                  <button type="button" onClick={goNext} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
                    次へ
                  </button>
                ) : (
                  <button type="button" onClick={openCompletionPreview} className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
                    保存プレビュー
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold">VisualRuntime互換メモ</h2>
            <p className="mt-2 text-sm text-slate-600">
              既存テストでは asset-character / misaki_v2 が使われています。misaki_v2 はテスト用キャラクター名です。
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {visualRuntimeParts.map((part) => (
                <li key={part} className="rounded-xl bg-slate-50 px-3 py-2">
                  {part}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-900">
              asset-character は PUBLIC のため、作成中・審査中のドラフト保存先にはしません。
            </div>
          </aside>
        </section>
      </section>

      {showCompletionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <section className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-xl font-bold">Personaの作成が完了しました。</h2>
            <p className="mt-3 text-sm text-slate-700">
              現在は非公開状態です。公開・販売・配布を行うには審査申請が必要です。
              審査は 事前審査 → 本審査 の順に行われます。承認後に公開・販売が可能になります。
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
              差し戻しの場合は、対象項目・理由・必要な修正内容を通知します。
            </div>
            <button
              type="button"
              onClick={() => setShowCompletionDialog(false)}
              className="mt-5 w-full rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
            >
              閉じる
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
