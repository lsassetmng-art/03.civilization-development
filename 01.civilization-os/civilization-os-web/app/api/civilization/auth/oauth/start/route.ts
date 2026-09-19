import { buildOAuthAuthorizationUrl, parseOAuthProvider, resolveOAuthProviderEnv } from "@/lib/oauth-provider-config";
import {
  createOAuthCallbackContext,
  createOAuthState,
  encodeOAuthCallbackContext,
  normalizeOAuthLanguageCode,
  normalizeSafeRedirectPath,
  OAUTH_CONTEXT_COOKIE_NAME,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_STATE_COOKIE_NAME
} from "@/lib/oauth-state";
import { NextRequest, NextResponse } from "next/server";

function normalizeOAuthStartLocaleCode(value: string | null | undefined): "ja-jp" | "en-us" {
  const raw = String(value ?? "ja").trim().toLowerCase().replace("_", "-");
  if (raw === "en" || raw === "en-us" || raw.startsWith("en-")) return "en-us";
  return "ja-jp";
}


export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const provider = parseOAuthProvider(request.nextUrl.searchParams.get("provider"));

  if (!provider) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "invalid_oauth_provider",
        message: "Unsupported CivilizationOS OAuth provider.",
        allowedProviders: ["google", "yahoo"]
      },
      { status: 400 }
    );
  }

  const env = resolveOAuthProviderEnv(provider);
  if (env.missingEnvNames.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "oauth_not_configured",
        provider,
        missingEnvNames: env.missingEnvNames,
        message: "CivilizationOS OAuth provider is not configured."
      },
      { status: 503 }
    );
  }

  const localeCode = normalizeOAuthStartLocaleCode(
    request.nextUrl.searchParams.get("locale_code") ||
      request.nextUrl.searchParams.get("localeCode") ||
      request.nextUrl.searchParams.get("language_code")
  );
  const languageCode = normalizeOAuthLanguageCode(
    request.nextUrl.searchParams.get("language_code") || (localeCode === "en-us" ? "en" : "ja")
  );
  const afterLoginPath = normalizeSafeRedirectPath(
    request.nextUrl.searchParams.get("after_login_path"),
    "/civilization-menu"
  );
  const returnTo = normalizeSafeRedirectPath(request.nextUrl.searchParams.get("return_to"), "/");
  const state = createOAuthState();
  const context = createOAuthCallbackContext({
    provider,
    localeCode,
    languageCode,
    afterLoginPath,
    returnTo
  });

  const { authorizationUrl, missingEnvNames } = buildOAuthAuthorizationUrl({
    provider,
    state,
    languageCode,
    afterLoginPath,
    returnTo
  });

  if (missingEnvNames.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "oauth_not_configured",
        provider,
        missingEnvNames,
        message: "CivilizationOS OAuth provider is not configured."
      },
      { status: 503 }
    );
  }

  const response = NextResponse.redirect(authorizationUrl, 302);
  const secureCookie = env.publicBaseUrl.startsWith("https://");

  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: secureCookie
  });

  response.cookies.set(OAUTH_CONTEXT_COOKIE_NAME, encodeOAuthCallbackContext(context), {
    httpOnly: true,
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: secureCookie
  });

  return response;
}
