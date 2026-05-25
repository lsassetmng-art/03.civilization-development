"use client";

import type { SupportedLocale } from "@/types/locale";
import type { AuthReturnTarget } from "@/types/auth";
import { t } from "@/lib/i18n";

type HandoffPanelProps = {
  locale: SupportedLocale;
  target: AuthReturnTarget & { languageCode?: string };
};

export function HandoffPanel({ locale, target }: HandoffPanelProps) {
  return (
    <aside className="card secondary">
      <h2>{t(locale, "handoff.title")}</h2>
      <dl className="definition-list">
        <div>
          <dt>{t(locale, "handoff.requestedOs")}</dt>
          <dd>{target.requestedOsCode ?? "-"}</dd>
        </div>
        <div>
          <dt>{t(locale, "handoff.returnTarget")}</dt>
          <dd>{target.returnTarget ?? "/global-map"}</dd>
        </div>
        <div>
          <dt>{t(locale, "handoff.languageCode")}</dt>
          <dd>{target.languageCode ?? locale}</dd>
        </div>
      </dl>
    </aside>
  );
}
