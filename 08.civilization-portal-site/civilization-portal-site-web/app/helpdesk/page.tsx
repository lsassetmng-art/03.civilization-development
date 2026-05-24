// PORTAL_HELPDESK_ENTRY_ROUTER_R2
import { Suspense } from "react";
import { HelpdeskRouterPage } from "../../features/helpdesk/helpdesk-router-page";

export const metadata = {
  title: "Helpdesk | Civilization Portal",
  description: "Portal entry and router for Helpdesk requests.",
};

export default function Page() {
  return (
    <main
      data-portal-helpdesk-route="ready"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">Civilization Portal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Helpdesk</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
          Portal は Helpdesk の入口と router を担当します。回答生成、retrieval、escalation は AIWorkerOS 側で扱います。
        </p>
      </section>

      <Suspense
        fallback={
          <section
            data-portal-helpdesk-loading="true"
            className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm"
          >
            Helpdesk router を読み込み中です。
          </section>
        }
      >
        <HelpdeskRouterPage />
      </Suspense>
    </main>
  );
}
