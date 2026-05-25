"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HandoffPanel } from "@/components/HandoffPanel";
import { usePortalContext } from "@/components/usePortalContext";
import { t } from "@/lib/i18n";

export default function SignupPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(t(locale, "auth.contractNotice"));
  }

  return (
    <AppShell locale={locale}>
      <div className="grid two">
        <section className="card">
          <p className="kicker">signup</p>
          <h1>{t(locale, "auth.signup.title")}</h1>
          <p>{t(locale, "auth.signup.description")}</p>

          <form className="form" onSubmit={handleSubmit}>
            <label><span>{t(locale, "auth.displayName")}</span><input name="displayName" required /></label>
            <label><span>{t(locale, "auth.loginIdentifier")}</span><input name="loginIdentifier" required /></label>
            <label><span>{t(locale, "auth.password")}</span><input name="password" type="password" required /></label>
            <label className="checkbox-row"><input name="termsAccepted" type="checkbox" required />{t(locale, "auth.terms")}</label>
            <label className="checkbox-row"><input name="privacyAccepted" type="checkbox" required />{t(locale, "auth.privacy")}</label>
            <button type="submit">{t(locale, "auth.createAccount")}</button>
          </form>

          {message ? <div className="notice">{message}</div> : null}
        </section>

        <HandoffPanel locale={locale} target={portalContext} />
      </div>
    </AppShell>
  );
}
