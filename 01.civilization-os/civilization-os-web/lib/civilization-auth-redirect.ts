const passthroughKeys = [
  "locale_code",
  "localeCode",
  "language_code",
  "after_login_path",
  "return_to",
  "requested_os_code",
  "requestedOsCode",
  "aerial_access_token",
  "aerialAccessToken"
] as const;

function normalizeLoginLocaleCode(value: string | null | undefined, fallbackLanguageCode = "ja"): "ja-jp" | "en-us" {
  const raw = String(value ?? fallbackLanguageCode ?? "ja").trim().toLowerCase().replace("_", "-");
  if (raw === "en" || raw === "en-us" || raw.startsWith("en-")) return "en-us";
  return "ja-jp";
}

function toLoginLanguageCode(value: string | null | undefined, fallbackLanguageCode = "ja"): "ja" | "en" {
  return normalizeLoginLocaleCode(value, fallbackLanguageCode) === "en-us" ? "en" : "ja";
}

export type LoginRedirectContext = {
  localeCode: string;
  languageCode: string;
  afterLoginPath: string;
  returnTo: string;
  requestedOsCode: string;
};

export function sanitizeInternalPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();

  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("\n") || trimmed.includes("\r")) return fallback;

  return trimmed;
}

export function readLoginRedirectContext(search: string, fallbackLanguageCode = "ja"): LoginRedirectContext {
  const params = new URLSearchParams(search);
  const localeCode = normalizeLoginLocaleCode(
    params.get("locale_code") ||
      params.get("localeCode") ||
      params.get("locale") ||
      params.get("lang") ||
      params.get("language_code"),
    fallbackLanguageCode
  );
  const languageCode =
    params.get("language_code") ||
    params.get("languageCode") ||
    toLoginLanguageCode(localeCode, fallbackLanguageCode);

  return {
    localeCode,
    languageCode,
    afterLoginPath: sanitizeInternalPath(params.get("after_login_path"), "/civilization-menu"),
    returnTo: sanitizeInternalPath(params.get("return_to"), "/"),
    requestedOsCode: params.get("requested_os_code") || params.get("requestedOsCode") || "civilization"
  };
}

export function buildAfterLoginUrl(search: string, fallbackLanguageCode = "ja"): string {
  const params = new URLSearchParams(search);
  const context = readLoginRedirectContext(search, fallbackLanguageCode);
  const nextParams = new URLSearchParams();

  nextParams.set("locale_code", context.localeCode);
  nextParams.set("language_code", context.languageCode);
  nextParams.set("return_to", context.returnTo);
  nextParams.set("requested_os_code", context.requestedOsCode);

  for (const key of ["aerial_access_token", "aerialAccessToken"] as const) {
    const value = params.get(key);
    if (value) nextParams.set(key, value);
  }

  return `${context.afterLoginPath}?${nextParams.toString()}`;
}

export function buildOauthStartUrl(provider: "google" | "yahoo", search: string, fallbackLanguageCode = "ja"): string {
  const source = new URLSearchParams(search);
  const params = new URLSearchParams();

  params.set("provider", provider);
  if (!source.get("locale_code") && !source.get("localeCode")) {
    params.set("locale_code", normalizeLoginLocaleCode(source.get("language_code"), fallbackLanguageCode));
  }
  if (!source.get("language_code")) {
    params.set("language_code", fallbackLanguageCode);
  }

  for (const key of passthroughKeys) {
    const value = source.get(key);
    if (value) params.set(key, value);
  }

  return `/api/civilization/auth/oauth/start?${params.toString()}`;
}

export function appendLoginRedirectParams(target: URLSearchParams, sourceSearch: string, fallbackLanguageCode = "ja"): void {
  const source = new URLSearchParams(sourceSearch);
  const context = readLoginRedirectContext(sourceSearch, fallbackLanguageCode);

  target.set("locale_code", context.localeCode);
  target.set("language_code", context.languageCode);
  target.set("after_login_path", context.afterLoginPath);
  target.set("return_to", context.returnTo);
  target.set("requested_os_code", context.requestedOsCode);

  for (const key of ["aerial_access_token", "aerialAccessToken"] as const) {
    const value = source.get(key);
    if (value) target.set(key, value);
  }
}
