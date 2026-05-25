"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HandoffPanel } from "@/components/HandoffPanel";
import { usePortalContext } from "@/components/usePortalContext";
import {
  buildAfterLoginUrl,
  buildOauthStartUrl,
  readLoginRedirectContext
} from "@/lib/civilization-auth-redirect";
import {
  createCivilizationSession,
  hasActiveCivilizationSession,
  saveCivilizationSession
} from "@/lib/civilization-session";
import {
  resolveCivilizationLoginAccount,
  systemLoginId
} from "@/lib/civilization-login-accounts";
import { t } from "@/lib/i18n";

function providerLabel(locale: string, provider: "google" | "yahoo"): string {
  if (locale === "ja") {
    return provider === "google" ? "Googleでログイン" : "Yahooでログイン";
  }

  return provider === "google" ? "Continue with Google" : "Continue with Yahoo";
}

function providerNotice(locale: string, provider: string | null): string {
  if (!provider) return "";

  if (locale === "ja") {
    return `${provider}ログインはOAuth設定後に有効化します。現在はログイン成功扱いにしません。`;
  }

  return `${provider} login will be enabled after OAuth configuration. It is not treated as successful login yet.`;
}

function invalidLoginMessage(locale: string): string {
  if (locale === "ja") {
    return "Login ID またはパスワードが一致しません。";
  }

  return "Login ID or password does not match.";
}

function testAccountNotice(locale: string): string {
  if (locale === "ja") {
    return `テスト用 Login ID: ${systemLoginId()}`;
  }

  return `Test Login ID: ${systemLoginId()}`;
}

export default function LoginPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;
  const [message, setMessage] = useState("");
  const [googleHref, setGoogleHref] = useState("/api/civilization/auth/oauth/start?provider=google");
  const [yahooHref, setYahooHref] = useState("/api/civilization/auth/oauth/start?provider=yahoo");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get("auth_provider");
    const providerStatus = params.get("auth_provider_status");

    if (provider && providerStatus === "not_configured") {
      setMessage(providerNotice(locale, provider));
    }

    setGoogleHref(buildOauthStartUrl("google", window.location.search, locale));
    setYahooHref(buildOauthStartUrl("yahoo", window.location.search, locale));

    if (hasActiveCivilizationSession()) {
      window.location.replace(buildAfterLoginUrl(window.location.search, locale));
    }
  }, [locale]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const loginIdentifier = String(formData.get("loginIdentifier") ?? "");
    const password = String(formData.get("password") ?? "");
    const redirectContext = readLoginRedirectContext(window.location.search, locale);

    const account = resolveCivilizationLoginAccount({ loginIdentifier, password });

    if (!account) {
      setMessage(invalidLoginMessage(locale));
      return;
    }

    saveCivilizationSession(
      createCivilizationSession({
        loginMethod: "civilization",
        loginIdentifier: account.civilizationId,
        requestedOsCode: redirectContext.requestedOsCode,
        returnTo: redirectContext.returnTo,
        afterLoginPath: redirectContext.afterLoginPath
      })
    );

    setMessage(t(locale, "auth.contractNotice"));
    window.location.href = buildAfterLoginUrl(window.location.search, locale);
  }

  return (
    <AppShell locale={locale}>
      <div className="grid two">
        <section className="card">
          <p className="kicker">login</p>
          <h1>{t(locale, "auth.login.title")}</h1>
          <p>{t(locale, "auth.login.description")}</p>

          <form className="form" onSubmit={handleSubmit}>
            <label><span>{locale === "ja" ? "Login ID" : "Login ID"}</span><input name="loginIdentifier" required /></label>
            <label><span>{t(locale, "auth.password")}</span><input name="password" type="password" required /></label>
            <button type="submit">{t(locale, "auth.loginAction")}</button>
          </form>

          <div className="notice">{testAccountNotice(locale)}</div>

          <div className="auth-provider-stack" aria-label="social-login">
            <a className="auth-provider-button" href={googleHref} data-auth-provider="google">
              {providerLabel(locale, "google")}
            </a>
            <a className="auth-provider-button" href={yahooHref} data-auth-provider="yahoo">
              {providerLabel(locale, "yahoo")}
            </a>
          </div>

          <div className="notice">
            {locale === "ja"
              ? "Google/YahooログインはOAuth設定後に有効化します。未設定時はログイン成功扱いにしません。"
              : "Google/Yahoo login will be enabled after OAuth configuration. It is not treated as successful while unconfigured."}
          </div>

          {message ? <div className="notice">{message}</div> : null}
        </section>

        <HandoffPanel locale={locale} target={portalContext} />
      </div>
    </AppShell>
  );
}
