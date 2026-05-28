// PORTAL_AUTH_GATE_R10
// MULTILINGUAL_R2_R4_EXACT_AUTH_GATE_PATCH
export type PortalLocaleCode = "ja-jp" | "en-us";

export type CivilizationAuthGateInput = {
  afterLoginPath: string;
  requestedOsCode: string;
  returnTo?: string;
  languageCode?: string;
  localeCode?: string;
  basePath?: string;
  aerialAccessToken?: string;
};

const supportedLanguageCodes = new Set(["ja", "en", "zh", "ko", "fr", "es", "de"]);

function normalizeLanguageCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace("_", "-");
  if (!normalized) {
    return null;
  }

  const primary = normalized.split("-")[0];
  if (supportedLanguageCodes.has(primary)) {
    return primary;
  }

  return null;
}

export function normalizePortalLocaleCode(value: string | null | undefined): PortalLocaleCode | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace("_", "-");
  if (!normalized) {
    return null;
  }

  if (normalized === "ja" || normalized === "ja-jp" || normalized.startsWith("ja-")) {
    return "ja-jp";
  }

  if (normalized === "en" || normalized === "en-us" || normalized.startsWith("en-")) {
    return "en-us";
  }

  return null;
}

export function getLanguageCodeFromPortalLocale(localeCode: string | null | undefined): string {
  const normalizedLocale = normalizePortalLocaleCode(localeCode);
  if (normalizedLocale) {
    return normalizedLocale.split("-")[0];
  }

  return normalizeLanguageCode(localeCode) ?? "ja";
}

export function resolvePortalLocaleCode(): PortalLocaleCode {
  if (typeof window === "undefined") {
    return "ja-jp";
  }

  const storageKeys = [
    "portal.locale",
    "portal.language",
    "locale_code",
    "localeCode",
    "language_code",
    "languageCode",
    "locale",
  ];

  for (const key of storageKeys) {
    try {
      const value = window.localStorage.getItem(key);
      const normalized = normalizePortalLocaleCode(value);
      if (normalized) {
        return normalized;
      }
    } catch {
      // localStorage may be unavailable. Fall through to browser language.
    }
  }

  const browserLocale = normalizePortalLocaleCode(window.navigator.language);
  return browserLocale ?? "ja-jp";
}

export function resolvePortalLanguageCode(): string {
  if (typeof window === "undefined") {
    return "ja";
  }

  const storageKeys = [
    "portal.language",
    "portal.locale",
    "language_code",
    "languageCode",
    "locale_code",
    "localeCode",
    "locale",
  ];

  for (const key of storageKeys) {
    try {
      const value = window.localStorage.getItem(key);

      const normalizedLanguage = normalizeLanguageCode(value);
      if (normalizedLanguage) {
        return normalizedLanguage;
      }

      const normalizedLocale = normalizePortalLocaleCode(value);
      if (normalizedLocale) {
        return getLanguageCodeFromPortalLocale(normalizedLocale);
      }
    } catch {
      // localStorage may be unavailable. Fall through to browser language.
    }
  }

  const browserLanguage = normalizeLanguageCode(window.navigator.language);
  if (browserLanguage) {
    return browserLanguage;
  }

  const browserLocale = normalizePortalLocaleCode(window.navigator.language);
  return browserLocale ? getLanguageCodeFromPortalLocale(browserLocale) : "ja";
}

export function buildCivilizationAuthUrl(input: CivilizationAuthGateInput): string {
  const params = new URLSearchParams();

  const localeCode =
    normalizePortalLocaleCode(input.localeCode ?? null) ??
    normalizePortalLocaleCode(input.languageCode ?? null) ??
    resolvePortalLocaleCode();

  const languageCode =
    normalizeLanguageCode(input.languageCode ?? null) ??
    getLanguageCodeFromPortalLocale(localeCode) ??
    resolvePortalLanguageCode();

  params.set("locale_code", localeCode);
  params.set("language_code", languageCode);
  params.set("after_login_path", input.afterLoginPath);
  params.set("return_to", input.returnTo ?? "/");
  params.set("requested_os_code", input.requestedOsCode);

  if (input.aerialAccessToken) {
    params.set("aerial_access_token", input.aerialAccessToken);
  }

  const basePath = input.basePath ?? "/login";
  return `${basePath}?${params.toString()}`;
}
