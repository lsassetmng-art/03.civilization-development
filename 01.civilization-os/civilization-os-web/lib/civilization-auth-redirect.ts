const passthroughKeys = [
  "language_code",
  "after_login_path",
  "return_to",
  "requested_os_code",
  "requestedOsCode",
  "aerial_access_token",
  "aerialAccessToken"
] as const;

export type LoginRedirectContext = {
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
  const languageCode = params.get("language_code") || fallbackLanguageCode;

  return {
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

  target.set("language_code", context.languageCode);
  target.set("after_login_path", context.afterLoginPath);
  target.set("return_to", context.returnTo);
  target.set("requested_os_code", context.requestedOsCode);

  for (const key of ["aerial_access_token", "aerialAccessToken"] as const) {
    const value = source.get(key);
    if (value) target.set(key, value);
  }
}
