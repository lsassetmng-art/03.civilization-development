import { randomBytes } from "crypto";
import type { OAuthProviderCode } from "@/lib/oauth-provider-config";

function normalizeOAuthLocaleCode(value: unknown, fallbackLanguageCode: string = "ja"): "ja-jp" | "en-us" {
  const raw = String(value ?? fallbackLanguageCode ?? "ja").trim().toLowerCase().replace("_", "-");
  if (raw === "en" || raw === "en-us" || raw.startsWith("en-")) return "en-us";
  return "ja-jp";
}


export const OAUTH_STATE_COOKIE_NAME = "civilization_oauth_state";
export const OAUTH_CONTEXT_COOKIE_NAME = "civilization_oauth_context";
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export type OAuthCallbackContext = {
  provider: OAuthProviderCode;
  localeCode: string;
  languageCode: string;
  afterLoginPath: string;
  returnTo: string;
  requestedOsCode: string;
  createdAt: string;
};

export function createOAuthState(): string {
  return randomBytes(32).toString("base64url");
}

export function normalizeOAuthLanguageCode(value: string | null | undefined): string {
  if (value === "en" || value === "en-us") {
    return "en";
  }
  return "ja";
}

export function normalizeRequestedOsCode(
  value: string | null | undefined
): string {
  const candidate = String(value ?? "").trim().toLowerCase();

  if (/^[a-z0-9][a-z0-9_-]{0,63}$/.test(candidate)) {
    return candidate;
  }

  return "civilization";
}

export function normalizeSafeRedirectPath(value: string | null | undefined, fallback: string): string {
  const candidate = value?.trim();
  if (!candidate) {
    return fallback;
  }

  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return fallback;
  }

  if (/^\/(?:api|_next)\b/.test(candidate)) {
    return fallback;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return fallback;
  }

  return candidate;
}

export function resolveOAuthPostLoginTarget(
  context: Pick<OAuthCallbackContext, "afterLoginPath" | "requestedOsCode">,
  aiworkerBaseUrl: string | null | undefined
): string {
  const internalTarget = normalizeSafeRedirectPath(
    context.afterLoginPath,
    "/civilization-menu"
  );

  if (normalizeRequestedOsCode(context.requestedOsCode) !== "aiworker") {
    return internalTarget;
  }

  const configuredBaseUrl = String(aiworkerBaseUrl ?? "").trim();

  if (!configuredBaseUrl) {
    return internalTarget;
  }

  try {
    const baseUrl = new URL(configuredBaseUrl);

    const isHttps = baseUrl.protocol === "https:";
    const isLocalHttp =
      baseUrl.protocol === "http:" &&
      (
        baseUrl.hostname === "localhost" ||
        baseUrl.hostname === "127.0.0.1" ||
        baseUrl.hostname === "[::1]"
      );

    if (!isHttps && !isLocalHttp) {
      return internalTarget;
    }

    if (baseUrl.username || baseUrl.password) {
      return internalTarget;
    }

    return new URL("/aiworker-menu", baseUrl.origin).toString();
  } catch {
    return internalTarget;
  }
}

export function createOAuthCallbackContext(input: {
  provider: OAuthProviderCode;
  localeCode: string;
  languageCode: string;
  afterLoginPath: string;
  returnTo: string;
  requestedOsCode: string;
}): OAuthCallbackContext {
  return {
    provider: input.provider,
    localeCode: normalizeOAuthLocaleCode(input.localeCode ?? input.languageCode),
    languageCode: input.languageCode,
    afterLoginPath: normalizeSafeRedirectPath(input.afterLoginPath, "/civilization-menu"),
    returnTo: normalizeSafeRedirectPath(input.returnTo, "/"),
    requestedOsCode: normalizeRequestedOsCode(input.requestedOsCode),
    createdAt: new Date().toISOString()
  };
}

export function encodeOAuthCallbackContext(context: OAuthCallbackContext): string {
  return Buffer.from(JSON.stringify(context), "utf8").toString("base64url");
}

export function decodeOAuthCallbackContext(value: string | undefined): OAuthCallbackContext | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<OAuthCallbackContext>;
    if (parsed.provider !== "google" && parsed.provider !== "yahoo") {
      return null;
    }

    return {
      provider: parsed.provider,
      localeCode: normalizeOAuthLocaleCode((parsed as { localeCode?: unknown; locale_code?: unknown }).localeCode ?? (parsed as { locale_code?: unknown }).locale_code ?? parsed.languageCode),
      languageCode: normalizeOAuthLanguageCode(parsed.languageCode),
      afterLoginPath: normalizeSafeRedirectPath(parsed.afterLoginPath, "/civilization-menu"),
      returnTo: normalizeSafeRedirectPath(parsed.returnTo, "/"),
        requestedOsCode: normalizeRequestedOsCode(
          typeof parsed.requestedOsCode === "string"
            ? parsed.requestedOsCode
            : typeof (parsed as { requested_os_code?: unknown }).requested_os_code === "string"
              ? (parsed as { requested_os_code?: string }).requested_os_code
              : undefined
        ),
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}
