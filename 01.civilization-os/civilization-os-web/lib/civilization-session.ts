import {
  createCivilizationLoginContext,
  hasCivilizationLoginContextIdentity
} from "./civilization-login-context";
import type {
  CivilizationLoginContext,
  CivilizationLoginContextInput
} from "./civilization-login-context";

const CIVILIZATION_SESSION_KEY = "civilization_os_session_v1";
const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type CivilizationLoginMethod = "civilization" | "google" | "yahoo";

export type CivilizationSession = {
  version: 1;
  issuedAt: number;
  expiresAt: number;
  loginMethod: CivilizationLoginMethod;
  loginIdentifier?: string;
  requestedOsCode?: string;
  returnTo?: string;
  afterLoginPath?: string;
};

function now(): number {
  return Date.now();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLoginMethod(value: unknown): value is CivilizationLoginMethod {
  return value === "civilization" || value === "google" || value === "yahoo";
}

export function createCivilizationSession(input: {
  loginMethod: CivilizationLoginMethod;
  loginIdentifier?: string;
  requestedOsCode?: string;
  returnTo?: string;
  afterLoginPath?: string;
}): CivilizationSession {
  const issuedAt = now();

  return {
    version: 1,
    issuedAt,
    expiresAt: issuedAt + DEFAULT_SESSION_TTL_MS,
    loginMethod: input.loginMethod,
    loginIdentifier: input.loginIdentifier,
    requestedOsCode: input.requestedOsCode,
    returnTo: input.returnTo,
    afterLoginPath: input.afterLoginPath
  };
}

export function saveCivilizationSession(session: CivilizationSession): void {
  try {
    window.localStorage.setItem(CIVILIZATION_SESSION_KEY, JSON.stringify(session));
  } catch {
    // client-side fallback storage is best-effort until formal auth/session implementation
  }
}

export function readCivilizationSession(): CivilizationSession | null {
  try {
    const raw = window.localStorage.getItem(CIVILIZATION_SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isObject(parsed)) return null;
    if (parsed.version !== 1) return null;
    if (typeof parsed.issuedAt !== "number") return null;
    if (typeof parsed.expiresAt !== "number") return null;
    if (!isLoginMethod(parsed.loginMethod)) return null;

    return {
      version: 1,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
      loginMethod: parsed.loginMethod,
      loginIdentifier: typeof parsed.loginIdentifier === "string" ? parsed.loginIdentifier : undefined,
      requestedOsCode: typeof parsed.requestedOsCode === "string" ? parsed.requestedOsCode : undefined,
      returnTo: typeof parsed.returnTo === "string" ? parsed.returnTo : undefined,
      afterLoginPath: typeof parsed.afterLoginPath === "string" ? parsed.afterLoginPath : undefined
    };
  } catch {
    return null;
  }
}

export function isCivilizationSessionActive(session: CivilizationSession | null): boolean {
  return Boolean(session && session.expiresAt > now());
}

export function hasActiveCivilizationSession(): boolean {
  return isCivilizationSessionActive(readCivilizationSession());
}

export function clearCivilizationSession(): void {
  try {
    window.localStorage.removeItem(CIVILIZATION_SESSION_KEY);
  } catch {
    // best-effort only
  }
}

export function civilizationSessionStorageKey(): string {
  return CIVILIZATION_SESSION_KEY;
}

export function civilizationSessionTtlDays(): number {
  return Math.round(DEFAULT_SESSION_TTL_MS / (1000 * 60 * 60 * 24));
}

/* MULTILINGUAL_R2_R5A_SESSION_HELPER */
export type CivilizationLocaleSessionFields = {
  localeCode: "ja-jp" | "en-us";
  languageCode: "ja" | "en";
};

function normalizeCivilizationSessionLocaleCode(value: unknown): "ja-jp" | "en-us" {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/_/g, "-");

  if (normalized === "en" || normalized === "en-us") {
    return "en-us";
  }

  return "ja-jp";
}

function toCivilizationSessionLanguageCode(value: unknown): "ja" | "en" {
  return normalizeCivilizationSessionLocaleCode(value) === "en-us" ? "en" : "ja";
}

export function withCivilizationSessionLocale<T extends Record<string, unknown>>(
  session: T,
  localeInput?: unknown,
  languageInput?: unknown
): T & CivilizationLocaleSessionFields {
  const localeCode = normalizeCivilizationSessionLocaleCode(
    localeInput ??
      session.localeCode ??
      session.locale_code ??
      session.languageCode ??
      session.language_code ??
      languageInput
  );

  return {
    ...session,
    localeCode,
    languageCode: toCivilizationSessionLanguageCode(localeCode)
  };
}


export type CivilizationLoginContextRuntimeFields = {
  requestedOsCode?: string;
  returnTo?: string;
  afterLoginPath?: string;
};

type CivilizationLoginContextSessionLike = Record<string, unknown>;

function readCivilizationLoginContextString(
  source: CivilizationLoginContextSessionLike,
  keys: readonly string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function assignCivilizationLoginContextString(
  input: Record<string, unknown>,
  key: string,
  value: string | undefined
): void {
  if (typeof value === "string" && value.trim().length > 0) {
    input[key] = value;
  }
}

/**
 * Creates a safe login context from the CivilizationOS session boundary.
 *
 * This helper maps only safe session/runtime fields and intentionally excludes
 * password, OAuth token, refresh token, client secret, DB URL, service role key,
 * and private key material.
 */
export function createCivilizationLoginContextFromSession(
  session: unknown,
  runtimeFields: CivilizationLoginContextRuntimeFields = {}
): CivilizationLoginContext | null {
  if (!session || typeof session !== "object") {
    return null;
  }

  const sessionLike = session as CivilizationLoginContextSessionLike;
  const input: Record<string, unknown> = {};

  assignCivilizationLoginContextString(
    input,
    "civilizationId",
    readCivilizationLoginContextString(sessionLike, ["civilizationId", "civilization_id"])
  );
  assignCivilizationLoginContextString(
    input,
    "owner",
    readCivilizationLoginContextString(sessionLike, ["owner", "ownerId", "owner_id", "civilizationId", "civilization_id"])
  );
  assignCivilizationLoginContextString(
    input,
    "sessionRef",
    readCivilizationLoginContextString(sessionLike, ["sessionRef", "session_ref", "sessionId", "session_id"])
  );
  assignCivilizationLoginContextString(
    input,
    "localeCode",
    readCivilizationLoginContextString(sessionLike, ["localeCode", "locale_code", "languageCode", "language_code"])
  );
  assignCivilizationLoginContextString(
    input,
    "languageCode",
    readCivilizationLoginContextString(sessionLike, ["languageCode", "language_code"])
  );
  assignCivilizationLoginContextString(
    input,
    "issuedAt",
    readCivilizationLoginContextString(sessionLike, ["issuedAt", "issued_at"])
  );
  assignCivilizationLoginContextString(
    input,
    "expiresAt",
    readCivilizationLoginContextString(sessionLike, ["expiresAt", "expires_at"])
  );

  assignCivilizationLoginContextString(input, "requestedOsCode", runtimeFields.requestedOsCode);
  assignCivilizationLoginContextString(input, "returnTo", runtimeFields.returnTo);
  assignCivilizationLoginContextString(input, "afterLoginPath", runtimeFields.afterLoginPath);

  const context = createCivilizationLoginContext(
    input as CivilizationLoginContextInput
  );

  return hasCivilizationLoginContextIdentity(context) ? context : null;
}

