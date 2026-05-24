// PORTAL_AUTH_GATE_R10
export type CivilizationAuthGateInput = {
  afterLoginPath: string;
  requestedOsCode: string;
  returnTo?: string;
  languageCode?: string;
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

export function resolvePortalLanguageCode(): string {
  if (typeof window === "undefined") {
    return "ja";
  }

  const storageKeys = [
    "portal.language",
    "portal.locale",
    "language_code",
    "languageCode",
    "locale",
  ];

  for (const key of storageKeys) {
    try {
      const value = window.localStorage.getItem(key);
      const normalized = normalizeLanguageCode(value);
      if (normalized) {
        return normalized;
      }
    } catch {
      // localStorage may be unavailable. Fall through to browser language.
    }
  }

  const browserLanguage = normalizeLanguageCode(window.navigator.language);
  return browserLanguage ?? "ja";
}

export function buildCivilizationAuthUrl(input: CivilizationAuthGateInput): string {
  const params = new URLSearchParams();

  params.set("language_code", input.languageCode ?? resolvePortalLanguageCode());
  params.set("after_login_path", input.afterLoginPath);
  params.set("return_to", input.returnTo ?? "/");
  params.set("requested_os_code", input.requestedOsCode);

  if (input.aerialAccessToken) {
    params.set("aerial_access_token", input.aerialAccessToken);
  }

  const basePath = input.basePath ?? "/login";
  return `${basePath}?${params.toString()}`;
}
