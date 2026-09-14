// PORTAL_HELPDESK_ENTRY_ROUTER_R2
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type LocaleContext = {
  locale: string;
  source: string;
};

type DraftState = {
  topic: string;
  severity: string;
  body: string;
};

function safeValue(value: string | null, fallback: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : fallback;
}

function safeReturnTo(value: string | null): string {
  const candidate = safeValue(value, "/help");
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/help";
  }
  return candidate;
}

function readLocaleContext(): LocaleContext {
  const browserLocale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "unknown";

  if (typeof window === "undefined") {
    return {
      locale: browserLocale,
      source: "navigator.language",
    };
  }

  const candidates: Array<[string, string | null]> = [
    ["localStorage:portal.language", window.localStorage.getItem("portal.language")],
    ["localStorage:portal.locale", window.localStorage.getItem("portal.locale")],
    ["localStorage:language_code", window.localStorage.getItem("language_code")],
    ["localStorage:locale", window.localStorage.getItem("locale")],
  ];

  const found = candidates.find(([, value]) => typeof value === "string" && value.trim().length > 0);

  if (found) {
    return {
      locale: found[1] ? found[1].trim() : browserLocale,
      source: found[0],
    };
  }

  return {
    locale: browserLocale,
    source: "navigator.language",
  };
}

export function HelpdeskRouterPage() {
  const searchParams = useSearchParams();
  const [localeContext, setLocaleContext] = useState<LocaleContext>({
    locale: "checking",
    source: "client pending",
  });
  const [draft, setDraft] = useState<DraftState>({
    topic: "",
    severity: safeValue(searchParams.get("severity"), "normal"),
    body: "",
  });
  const [draftStatus, setDraftStatus] = useState("");

  useEffect(() => {
    setLocaleContext(readLocaleContext());
  }, []);

  const routerContext = useMemo(
    () => ({
      app: safeValue(searchParams.get("app"), "portal"),
      returnTo: safeReturnTo(searchParams.get("returnTo")),
      requestedOsCode: safeValue(searchParams.get("requestedOsCode"), "portal"),
      topic: safeValue(searchParams.get("topic"), draft.topic || "not specified"),
      source: safeValue(searchParams.get("source"), "portal-helpdesk-entry"),
      severity: safeValue(searchParams.get("severity"), draft.severity || "normal"),
    }),
    [draft.severity, draft.topic, searchParams],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDraftStatus(
      "相談内容は画面上で確認されました。現段階では API POST せず、AIWorkerOS 接続準備中として保持します。",
    );
  };

  return (
    <div data-portal-helpdesk-client="ready" className="grid gap-6">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-amber-950">接続状態</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900">
          AIWorkerOS 接続準備中です。この画面では回答本文を生成しません。Portal は Helpdesk の入口/router のみを担当します。
        </p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Router context</h2>
          <p className="mt-1 text-sm text-slate-600">Portal から AIWorkerOS へ渡す予定の文脈です。</p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">app</dt>
            <dd className="mt-1 text-slate-950">{routerContext.app}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">returnTo</dt>
            <dd className="mt-1 text-slate-950">
              <a className="underline underline-offset-4" href={routerContext.returnTo}>
                {routerContext.returnTo}
              </a>
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">requestedOsCode</dt>
            <dd className="mt-1 text-slate-950">{routerContext.requestedOsCode}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">topic</dt>
            <dd className="mt-1 text-slate-950">{routerContext.topic}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">source</dt>
            <dd className="mt-1 text-slate-950">{routerContext.source}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">severity</dt>
            <dd className="mt-1 text-slate-950">{routerContext.severity}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Locale / session context</h2>
          <p className="mt-1 text-sm text-slate-600">Portal 表示言語と session/auth authority の引き渡し準備です。</p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">locale</dt>
            <dd className="mt-1 text-slate-950">{localeContext.locale}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">locale source</dt>
            <dd className="mt-1 text-slate-950">{localeContext.source}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="font-medium text-slate-500">auth/session</dt>
            <dd className="mt-1 text-slate-950">CivilizationOS authority placeholder</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">相談フォーム</h2>
        <p className="mt-1 text-sm text-slate-600">
          現段階では送信しません。AIWorkerOS transport 接続後に、この入力を Helpdesk request として渡します。
        </p>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            topic
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
              name="topic"
              value={draft.topic}
              onChange={(event) => setDraft((current) => ({ ...current, topic: event.target.value }))}
              placeholder="例: ログインできない、言語設定を変更したい"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            severity
            <select
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
              name="severity"
              value={draft.severity}
              onChange={(event) => setDraft((current) => ({ ...current, severity: event.target.value }))}
            >
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            consultation
            <textarea
              className="min-h-32 rounded-xl border border-slate-300 px-3 py-2 text-slate-950"
              name="body"
              value={draft.body}
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              placeholder="相談内容を入力"
            ></textarea>
          </label>

          <button
            className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white sm:w-fit"
            type="submit"
          >
            送信せず内容を確認
          </button>
        </form>

        {draftStatus ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700" role="status">
            {draftStatus}
          </p>
        ) : null}
      </section>
    </div>
  );
}
