export type CivilizationLocaleCode = "ja-jp" | "en-us";
export type CivilizationLanguageCode = "ja" | "en";

export type CivilizationLoginContext = {
  civilizationId: string;
  owner: string;
  sessionRef?: string;
  localeCode: CivilizationLocaleCode;
  languageCode: CivilizationLanguageCode;
  requestedOsCode?: string;
  returnTo?: string;
  afterLoginPath?: string;
  issuedAt?: string;
  expiresAt?: string;
};

export type CivilizationLoginContextSafeFields = {
  civilizationId?: unknown;
  owner?: unknown;
  sessionRef?: unknown;
  localeCode?: unknown;
  languageCode?: unknown;
  requestedOsCode?: unknown;
  returnTo?: unknown;
  afterLoginPath?: unknown;
  issuedAt?: unknown;
  expiresAt?: unknown;
};

export type CivilizationLoginContextInput = CivilizationLoginContextSafeFields;

const DEFAULT_LOCALE_CODE: CivilizationLocaleCode = "ja-jp";

function trimString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeCivilizationLocaleCode(value: unknown): CivilizationLocaleCode {
  const normalized = trimString(value)?.toLowerCase().replace("_", "-");

  if (normalized === "en" || normalized === "en-us") {
    return "en-us";
  }

  if (normalized === "ja" || normalized === "ja-jp") {
    return "ja-jp";
  }

  return DEFAULT_LOCALE_CODE;
}

export function toCivilizationLanguageCode(
  localeCode: CivilizationLocaleCode,
): CivilizationLanguageCode {
  return localeCode === "en-us" ? "en" : "ja";
}

export function normalizeStreamingCivilizationLoginContext(
  input: CivilizationLoginContextInput,
): CivilizationLoginContext {
  const localeCode = normalizeCivilizationLocaleCode(input.localeCode);
  const civilizationId = trimString(input.civilizationId) ?? "";
  const owner = trimString(input.owner) ?? civilizationId;

  return {
    civilizationId,
    owner,
    sessionRef: trimString(input.sessionRef),
    localeCode,
    languageCode: toCivilizationLanguageCode(localeCode),
    requestedOsCode: trimString(input.requestedOsCode),
    returnTo: trimString(input.returnTo),
    afterLoginPath: trimString(input.afterLoginPath),
    issuedAt: trimString(input.issuedAt),
    expiresAt: trimString(input.expiresAt),
  };
}

export function createStreamingCivilizationLoginContext(
  input: CivilizationLoginContextInput,
): CivilizationLoginContext {
  return normalizeStreamingCivilizationLoginContext(input);
}

export function isStreamingCivilizationLoginContextExpired(
  context: Pick<CivilizationLoginContext, "expiresAt"> | null | undefined,
): boolean {
  const expiresAt = trimString(context?.expiresAt);

  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = Date.parse(expiresAt);

  if (!Number.isFinite(expiresAtTime)) {
    return true;
  }

  return expiresAtTime <= Date.now();
}

export function hasStreamingCivilizationLoginContextIdentity(
  context: Pick<CivilizationLoginContext, "civilizationId" | "owner"> | null | undefined,
): boolean {
  return Boolean(trimString(context?.civilizationId) && trimString(context?.owner));
}
