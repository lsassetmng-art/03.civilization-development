import {
  normalizeCivilizationLocaleCode,
  toCivilizationLanguageCode
} from "./i18n";
import type {
  CivilizationLanguageCode,
  CivilizationLocaleCode
} from "../types/locale";

type CivilizationLoginContextRecord = Record<string, unknown>;

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

export type CivilizationLoginContextInput =
  | Partial<{
      civilizationId: unknown;
      civilization_id: unknown;
      owner: unknown;
      ownerId: unknown;
      owner_id: unknown;
      sessionRef: unknown;
      session_ref: unknown;
      sessionId: unknown;
      session_id: unknown;
      localeCode: unknown;
      locale_code: unknown;
      languageCode: unknown;
      language_code: unknown;
      requestedOsCode: unknown;
      requested_os_code: unknown;
      returnTo: unknown;
      return_to: unknown;
      afterLoginPath: unknown;
      after_login_path: unknown;
      issuedAt: unknown;
      issued_at: unknown;
      expiresAt: unknown;
      expires_at: unknown;
    }>
  | null
  | undefined;

export type CivilizationLoginContextSafeFields = Pick<
  CivilizationLoginContext,
  | "civilizationId"
  | "owner"
  | "sessionRef"
  | "localeCode"
  | "languageCode"
  | "requestedOsCode"
  | "returnTo"
  | "afterLoginPath"
  | "issuedAt"
  | "expiresAt"
>;

function isCivilizationLoginContextRecord(
  value: unknown
): value is CivilizationLoginContextRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readCivilizationLoginContextString(
  record: CivilizationLoginContextRecord,
  keys: readonly string[]
): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return undefined;
}

function readCivilizationLoginContextLocaleInput(
  record: CivilizationLoginContextRecord
): string {
  return (
    readCivilizationLoginContextString(record, [
      "localeCode",
      "locale_code",
      "languageCode",
      "language_code"
    ]) ?? "ja-jp"
  );
}

export function normalizeCivilizationLoginContext(
  input: CivilizationLoginContextInput
): CivilizationLoginContext {
  const record = isCivilizationLoginContextRecord(input) ? input : {};
  const localeCode = normalizeCivilizationLocaleCode(
    readCivilizationLoginContextLocaleInput(record)
  );
  const languageCode = toCivilizationLanguageCode(localeCode);

  const context: CivilizationLoginContext = {
    civilizationId:
      readCivilizationLoginContextString(record, [
        "civilizationId",
        "civilization_id"
      ]) ?? "",
    owner:
      readCivilizationLoginContextString(record, [
        "owner",
        "ownerId",
        "owner_id",
        "civilizationId",
        "civilization_id"
      ]) ?? "",
    localeCode,
    languageCode
  };

  const sessionRef = readCivilizationLoginContextString(record, [
    "sessionRef",
    "session_ref",
    "sessionId",
    "session_id"
  ]);
  const requestedOsCode = readCivilizationLoginContextString(record, [
    "requestedOsCode",
    "requested_os_code"
  ]);
  const returnTo = readCivilizationLoginContextString(record, [
    "returnTo",
    "return_to"
  ]);
  const afterLoginPath = readCivilizationLoginContextString(record, [
    "afterLoginPath",
    "after_login_path"
  ]);
  const issuedAt = readCivilizationLoginContextString(record, [
    "issuedAt",
    "issued_at"
  ]);
  const expiresAt = readCivilizationLoginContextString(record, [
    "expiresAt",
    "expires_at"
  ]);

  if (sessionRef) {
    context.sessionRef = sessionRef;
  }

  if (requestedOsCode) {
    context.requestedOsCode = requestedOsCode;
  }

  if (returnTo) {
    context.returnTo = returnTo;
  }

  if (afterLoginPath) {
    context.afterLoginPath = afterLoginPath;
  }

  if (issuedAt) {
    context.issuedAt = issuedAt;
  }

  if (expiresAt) {
    context.expiresAt = expiresAt;
  }

  return context;
}

export function createCivilizationLoginContext(
  input: CivilizationLoginContextInput
): CivilizationLoginContext {
  return normalizeCivilizationLoginContext(input);
}

export function isCivilizationLoginContextExpired(
  context: Pick<CivilizationLoginContext, "expiresAt">,
  now: Date = new Date()
): boolean {
  if (!context.expiresAt) {
    return false;
  }

  const expiresAtMs = Date.parse(context.expiresAt);

  if (Number.isNaN(expiresAtMs)) {
    return true;
  }

  return expiresAtMs <= now.getTime();
}

export function hasCivilizationLoginContextIdentity(
  context: Pick<CivilizationLoginContext, "civilizationId" | "owner">
): boolean {
  return context.civilizationId.trim().length > 0 && context.owner.trim().length > 0;
}
