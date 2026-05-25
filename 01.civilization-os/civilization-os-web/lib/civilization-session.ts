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
