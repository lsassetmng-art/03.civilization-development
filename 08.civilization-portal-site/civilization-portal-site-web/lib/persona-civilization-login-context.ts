export type PersonaCivilizationLocaleCode = "ja-jp" | "en-us";
export type PersonaCivilizationLanguageCode = "ja" | "en";

export type PersonaCivilizationLoginContext = {
  civilizationId: string;
  owner: string;
  sessionRef?: string;
  localeCode: PersonaCivilizationLocaleCode;
  languageCode: PersonaCivilizationLanguageCode;
  requestedOsCode?: string;
  returnTo?: string;
  afterLoginPath?: string;
  issuedAt?: string;
  expiresAt?: string;
};

export type PersonaCivilizationLoginContextInput = {
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

export const PERSONA_CIVILIZATION_LOGIN_CONTEXT_SAFE_FIELD_NAMES = [
  "civilizationId",
  "owner",
  "sessionRef",
  "localeCode",
  "languageCode",
  "requestedOsCode",
  "returnTo",
  "afterLoginPath",
  "issuedAt",
  "expiresAt",
] as const;

export type PersonaCivilizationLoginContextSafeField =
  (typeof PERSONA_CIVILIZATION_LOGIN_CONTEXT_SAFE_FIELD_NAMES)[number];

export type PersonaCivilizationLoginContextSafeFields = Pick<
  PersonaCivilizationLoginContext,
  PersonaCivilizationLoginContextSafeField
>;

const DEFAULT_LOCALE_CODE: PersonaCivilizationLocaleCode = "ja-jp";

function readTrimmedText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizePersonaCivilizationLocaleCode(
  value: unknown,
): PersonaCivilizationLocaleCode {
  const normalized = readTrimmedText(value)?.toLowerCase().replace("_", "-");

  if (!normalized) {
    return DEFAULT_LOCALE_CODE;
  }

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en-us";
  }

  if (normalized === "ja" || normalized.startsWith("ja-")) {
    return "ja-jp";
  }

  return DEFAULT_LOCALE_CODE;
}

export function toPersonaCivilizationLanguageCode(
  value: unknown,
  localeCode: PersonaCivilizationLocaleCode,
): PersonaCivilizationLanguageCode {
  const normalized = readTrimmedText(value)?.toLowerCase();

  if (normalized === "en") {
    return "en";
  }

  if (normalized === "ja") {
    return "ja";
  }

  return localeCode === "en-us" ? "en" : "ja";
}

export function normalizePersonaCivilizationLoginContext(
  input: PersonaCivilizationLoginContextInput = {},
): PersonaCivilizationLoginContext {
  const localeCode = normalizePersonaCivilizationLocaleCode(input.localeCode);
  const languageCode = toPersonaCivilizationLanguageCode(input.languageCode, localeCode);

  const civilizationId = readTrimmedText(input.civilizationId) ?? "";
  const owner = readTrimmedText(input.owner) ?? civilizationId;
  const sessionRef = readTrimmedText(input.sessionRef);
  const requestedOsCode = readTrimmedText(input.requestedOsCode);
  const returnTo = readTrimmedText(input.returnTo);
  const afterLoginPath = readTrimmedText(input.afterLoginPath);
  const issuedAt = readTrimmedText(input.issuedAt);
  const expiresAt = readTrimmedText(input.expiresAt);

  return {
    civilizationId,
    owner,
    localeCode,
    languageCode,
    ...(sessionRef ? { sessionRef } : {}),
    ...(requestedOsCode ? { requestedOsCode } : {}),
    ...(returnTo ? { returnTo } : {}),
    ...(afterLoginPath ? { afterLoginPath } : {}),
    ...(issuedAt ? { issuedAt } : {}),
    ...(expiresAt ? { expiresAt } : {}),
  };
}

export function createPersonaCivilizationLoginContext(
  input: PersonaCivilizationLoginContextInput = {},
): PersonaCivilizationLoginContext {
  return normalizePersonaCivilizationLoginContext(input);
}

export function hasPersonaCivilizationIdentity(
  input: PersonaCivilizationLoginContextInput | PersonaCivilizationLoginContext,
): boolean {
  const context = normalizePersonaCivilizationLoginContext(input);

  return context.civilizationId.length > 0 && context.owner.length > 0;
}

export function isPersonaCivilizationContextExpired(
  input: PersonaCivilizationLoginContextInput | PersonaCivilizationLoginContext,
): boolean {
  const expiresAt = readTrimmedText(input.expiresAt);

  if (!expiresAt) {
    return false;
  }

  const expiresAtTime = Date.parse(expiresAt);

  if (!Number.isFinite(expiresAtTime)) {
    return true;
  }

  return expiresAtTime <= Date.now();
}

export function getPersonaCivilizationContextSafeFields(
  input: PersonaCivilizationLoginContextInput | PersonaCivilizationLoginContext,
): PersonaCivilizationLoginContextSafeFields {
  return normalizePersonaCivilizationLoginContext(input);
}

export function getPersonaCivilizationContextSafeHeaders(
  input: PersonaCivilizationLoginContextInput | PersonaCivilizationLoginContext,
): Record<string, string> {
  const context = normalizePersonaCivilizationLoginContext(input);
  const headers: Record<string, string> = {
    "x-civilization-locale-code": context.localeCode,
    "x-civilization-language-code": context.languageCode,
  };

  if (context.civilizationId) {
    headers["x-civilization-id"] = context.civilizationId;
  }

  if (context.owner) {
    headers["x-civilization-owner"] = context.owner;
  }

  if (context.sessionRef) {
    headers["x-civilization-session-ref"] = context.sessionRef;
  }

  if (context.requestedOsCode) {
    headers["x-civilization-requested-os-code"] = context.requestedOsCode;
  }

  if (context.returnTo) {
    headers["x-civilization-return-to"] = context.returnTo;
  }

  if (context.afterLoginPath) {
    headers["x-civilization-after-login-path"] = context.afterLoginPath;
  }

  if (context.issuedAt) {
    headers["x-civilization-issued-at"] = context.issuedAt;
  }

  if (context.expiresAt) {
    headers["x-civilization-expires-at"] = context.expiresAt;
  }

  return headers;
}
