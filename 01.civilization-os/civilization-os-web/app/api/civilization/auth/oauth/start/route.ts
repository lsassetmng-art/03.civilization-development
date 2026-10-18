import { buildOAuthAuthorizationUrl, parseOAuthProvider, resolveOAuthProviderEnv } from "@/lib/oauth-provider-config";
import {
  createOAuthCallbackContext,
  createOAuthState,
  encodeOAuthCallbackContext,
  normalizeOAuthLanguageCode,
  normalizeRequestedOsCode,
  normalizeSafeRedirectPath,
  OAUTH_CONTEXT_COOKIE_NAME,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_STATE_COOKIE_NAME
} from "@/lib/oauth-state";
import {
  NextRequest,
  NextResponse
} from "next/server";

function normalizeOAuthStartLocaleCode(
  value:
    string |
    null |
    undefined
): "ja-jp" | "en-us" {
  const raw =
    String(
      value ??
      "ja"
    )
      .trim()
      .toLowerCase()
      .replace(
        "_",
        "-"
      );

  if (
    raw === "en" ||
    raw === "en-us" ||
    raw.startsWith(
      "en-"
    )
  ) {
    return "en-us";
  }

  return "ja-jp";
}

function boundedParam(
  value:
    string |
    null,
  minLength: number,
  maxLength: number
): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed =
    value.trim();

  if (
    trimmed.length <
      minLength ||
    trimmed.length >
      maxLength ||
    !/^[A-Za-z0-9_-]+$/
      .test(
        trimmed
      )
  ) {
    return undefined;
  }

  return trimmed;
}

export const runtime =
  "nodejs";

export async function GET(
  request: NextRequest
) {
  const provider =
    parseOAuthProvider(
      request.nextUrl
        .searchParams
        .get(
          "provider"
        )
    );

  if (!provider) {
    return NextResponse.json(
      {
        ok: false,
        errorCode:
          "invalid_oauth_provider",
        message:
          "Unsupported CivilizationOS OAuth provider.",
        allowedProviders: [
          "google",
          "yahoo"
        ]
      },
      {
        status: 400
      }
    );
  }

  const env =
    resolveOAuthProviderEnv(
      provider
    );

  if (
    env.missingEnvNames
      .length >
    0
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode:
          "oauth_not_configured",
        provider,
        missingEnvNames:
          env.missingEnvNames,
        message:
          "CivilizationOS OAuth provider is not configured."
      },
      {
        status: 503
      }
    );
  }

  const searchParams =
    request.nextUrl
      .searchParams;

  const localeCode =
    normalizeOAuthStartLocaleCode(
      searchParams.get(
        "locale_code"
      ) ||
      searchParams.get(
        "localeCode"
      ) ||
      searchParams.get(
        "language_code"
      )
    );

  const languageCode =
    normalizeOAuthLanguageCode(
      searchParams.get(
        "language_code"
      ) ||
      (
        localeCode ===
          "en-us"
          ? "en"
          : "ja"
      )
    );

  const afterLoginPath =
    normalizeSafeRedirectPath(
      searchParams.get(
        "after_login_path"
      ),
      "/civilization-menu"
    );

  const returnTo =
    normalizeSafeRedirectPath(
      searchParams.get(
        "return_to"
      ),
      "/"
    );

  const requestedOsCode =
    normalizeRequestedOsCode(
      searchParams.get(
        "requested_os_code"
      ) ||
      searchParams.get(
        "requestedOsCode"
      )
    );

  const handoffState =
    boundedParam(
      searchParams.get(
        "handoff_state"
      ),
      32,
      128
    );

  const codeChallenge =
    boundedParam(
      searchParams.get(
        "code_challenge"
      ),
      43,
      43
    );

  const codeChallengeMethod =
    searchParams.get(
      "code_challenge_method"
    ) ??
    undefined;

  if (
    requestedOsCode ===
      "aiworker" &&
    (
      !handoffState ||
      !codeChallenge ||
      codeChallengeMethod !==
        "S256"
    )
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode:
          "aiworker_handoff_required"
      },
      {
        status: 400
      }
    );
  }

  const state =
    createOAuthState();

  const context =
    createOAuthCallbackContext(
      {
        provider,
        localeCode,
        languageCode,
        afterLoginPath,
        returnTo,
        requestedOsCode,
        handoffState,
        codeChallenge,
        codeChallengeMethod
      }
    );

  const {
    authorizationUrl,
    missingEnvNames
  } =
    buildOAuthAuthorizationUrl(
      {
        provider,
        state,
        languageCode,
        afterLoginPath,
        returnTo
      }
    );

  if (
    missingEnvNames.length >
    0
  ) {
    return NextResponse.json(
      {
        ok: false,
        errorCode:
          "oauth_not_configured",
        provider,
        missingEnvNames,
        message:
          "CivilizationOS OAuth provider is not configured."
      },
      {
        status: 503
      }
    );
  }

  const response =
    NextResponse.redirect(
      authorizationUrl,
      302
    );

  const secureCookie =
    env.publicBaseUrl
      .startsWith(
        "https://"
      );

  response.cookies.set(
    OAUTH_STATE_COOKIE_NAME,
    state,
    {
      httpOnly: true,
      maxAge:
        OAUTH_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite:
        "lax",
      secure:
        secureCookie
    }
  );

  response.cookies.set(
    OAUTH_CONTEXT_COOKIE_NAME,
    encodeOAuthCallbackContext(
      context
    ),
    {
      httpOnly: true,
      maxAge:
        OAUTH_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite:
        "lax",
      secure:
        secureCookie
    }
  );

  return response;
}
