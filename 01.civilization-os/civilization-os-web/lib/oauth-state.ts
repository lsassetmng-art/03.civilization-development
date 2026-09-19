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

export function createOAuthCallbackContext(input: {
  provider: OAuthProviderCode;
  localeCode: string;
  languageCode: string;
  afterLoginPath: string;
  returnTo: string;
}): OAuthCallbackContext {
  return {
    provider: input.provider,
    localeCode: normalizeOAuthLocaleCode(input.localeCode ?? input.languageCode),
    languageCode: input.languageCode,
    afterLoginPath: normalizeSafeRedirectPath(input.afterLoginPath, "/civilization-menu"),
    returnTo: normalizeSafeRedirectPath(input.returnTo, "/"),
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
      createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}
