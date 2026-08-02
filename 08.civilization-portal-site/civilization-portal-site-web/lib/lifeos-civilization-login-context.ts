export type LifeOSCivilizationLocaleCode = "ja-jp" | "en-us";

export type LifeOSCivilizationLanguageCode = "ja" | "en";

export type LifeOSCivilizationLoginContext = {
  civilizationId: string;
  owner: string;
  sessionRef?: string;
  localeCode: LifeOSCivilizationLocaleCode;
  languageCode: LifeOSCivilizationLanguageCode;
  requestedOsCode?: string;
  returnTo?: string;
  afterLoginPath?: string;
  issuedAt?: string;
  expiresAt?: string;
};

export type LifeOSCivilizationLoginContextInput = Partial<{
  civilizationId: unknown;
  owner: unknown;
  sessionRef: unknown;
  localeCode: unknown;
  languageCode: unknown;
  requestedOsCode: unknown;
  returnTo: unknown;
  afterLoginPath: unknown;
  issuedAt: unknown;
  expiresAt: unknown;
}>;

export type LifeOSCivilizationLoginContextSafeFields =
  keyof LifeOSCivilizationLoginContext;

const DEFAULT_LOCALE_CODE: LifeOSCivilizationLocaleCode = "ja-jp";

function trimString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeLifeOSCivilizationLocaleCode(
  value: unknown,
): LifeOSCivilizationLocaleCode {
  const normalized = trimString(value)?.toLowerCase().replace("_", "-");

  if (normalized === "en" || normalized === "en-us") {
    return "en-us";
  }

  if (normalized === "ja" || normalized === "ja-jp") {
    return "ja-jp";
  }

  return DEFAULT_LOCALE_CODE;
}

export function toLifeOSCivilizationLanguageCode(
  localeCode: unknown,
): LifeOSCivilizationLanguageCode {
  const normalizedLocaleCode = normalizeLifeOSCivilizationLocaleCode(localeCode);
  return normalizedLocaleCode.startsWith("en") ? "en" : "ja";
}

export function normalizeLifeOSCivilizationLoginContext(
  input: LifeOSCivilizationLoginContextInput = {},
): LifeOSCivilizationLoginContext {
  const civilizationId = trimString(input.civilizationId) ?? "";
  const owner = trimString(input.owner) ?? civilizationId;
  const localeCode = normalizeLifeOSCivilizationLocaleCode(input.localeCode);
  const languageCode = toLifeOSCivilizationLanguageCode(localeCode);

  return {
    civilizationId,
    owner,
    sessionRef: trimString(input.sessionRef),
    localeCode,
    languageCode,
    requestedOsCode: trimString(input.requestedOsCode),
    returnTo: trimString(input.returnTo),
    afterLoginPath: trimString(input.afterLoginPath),
    issuedAt: trimString(input.issuedAt),
    expiresAt: trimString(input.expiresAt),
  };
}

export function createLifeOSCivilizationLoginContext(
  input: LifeOSCivilizationLoginContextInput = {},
): LifeOSCivilizationLoginContext {
  return normalizeLifeOSCivilizationLoginContext(input);
}

export function hasLifeOSCivilizationLoginContextIdentity(
  context: LifeOSCivilizationLoginContext | null | undefined,
): boolean {
  if (!context) {
    return false;
  }

  return context.civilizationId.trim().length > 0 && context.owner.trim().length > 0;
}

export function isLifeOSCivilizationLoginContextExpired(
  context: Pick<LifeOSCivilizationLoginContext, "expiresAt"> | null | undefined,
): boolean {
  if (!context?.expiresAt) {
    return false;
  }

  const expiresAtMillis = Date.parse(context.expiresAt);

  if (Number.isNaN(expiresAtMillis)) {
    return true;
  }

  return expiresAtMillis <= Date.now();
}
