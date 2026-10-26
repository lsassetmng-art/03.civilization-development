import {
  createHash,
  randomBytes
} from "crypto";
import type {
  NextRequest,
  NextResponse
} from "next/server";

export const PERSONA_AUTH_STATE_COOKIE_NAME =
  "persona_auth_state_v1";

export const PERSONA_AUTH_PKCE_COOKIE_NAME =
  "persona_auth_pkce_v1";

export const PERSONA_AUTH_RETURN_COOKIE_NAME =
  "persona_auth_return_v1";

const AUTH_COOKIE_MAX_AGE_SECONDS =
  5 * 60;

// R19: exact public menu return destinations for CivilizationOS identity login.
// These paths do not authorize any OS application function.
const PORTAL_OS_MENU_RETURN_PATHS = new Set([
  "/streaming-menu",
  "/business-menu",
  "/staticart-menu",
  "/game-menu"
]);

function safeInternalReturnPath(
  value:
    string |
    null |
    undefined
): string {
  const candidate =
    String(
      value ??
      ""
    ).trim();

  if (
    !candidate ||
    !(candidate === "/persona-menu" || candidate.startsWith("/persona-menu/") || PORTAL_OS_MENU_RETURN_PATHS.has(candidate)) ||
    candidate.startsWith(
      "//"
    ) ||
    candidate.includes(
      "\\"
    ) ||
    candidate.includes(
      "://"
    )
  ) {
    return "/persona-menu";
  }

  return candidate;
}

function configuredCivilizationBaseUrl():
  string | null {
  const raw =
    process.env
      .CIVILIZATION_OS_PUBLIC_BASE_URL
      ?.trim() || process.env.NEXT_PUBLIC_CIVILIZATION_AUTH_AUTHORIZE_URL?.trim();

  if (!raw) {
    return null;
  }

  try {
    const url =
      new URL(raw);

    const secure =
      url.protocol ===
      "https:";

    const localHttp =
      url.protocol ===
        "http:" &&
      (
        url.hostname ===
          "localhost" ||
        url.hostname ===
          "127.0.0.1" ||
        url.hostname ===
          "[::1]"
      );

    if (
      !secure &&
      !localHttp
    ) {
      return null;
    }

    if (
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function configuredPersonaPublicBaseUrl():
  string | null {
  const raw =
    process.env
      .CIVILIZATION_PORTAL_PUBLIC_BASE_URL
      ?.trim();

  if (!raw) {
    return null;
  }

  try {
    const url =
      new URL(raw);

    const secure =
      url.protocol ===
      "https:";

    const localHttp =
      url.protocol ===
        "http:" &&
      (
        url.hostname ===
          "localhost" ||
        url.hostname ===
          "127.0.0.1" ||
        url.hostname ===
          "[::1]"
      );

    if (
      !secure &&
      !localHttp
    ) {
      return null;
    }

    if (
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function buildPersonaPublicReturnUrl(
  returnTo:
    string |
    null |
    undefined
): string | null {
  const base =
    configuredPersonaPublicBaseUrl();

  if (!base) {
    return null;
  }

  return new URL(
    safeInternalReturnPath(
      returnTo
    ),
    base
  ).toString();
}

export function secureCookieForRequest(
  request:
    NextRequest
): boolean {
  const configuredBase =
    configuredPersonaPublicBaseUrl();

  if (configuredBase) {
    return (
      new URL(
        configuredBase
      ).protocol ===
      "https:"
    );
  }

  const hostname =
    request.nextUrl
      .hostname;

  return !(
    hostname ===
      "localhost" ||
    hostname ===
      "127.0.0.1" ||
    hostname ===
      "[::1]"
  );
}

export function createPersonaAuthStart(
  returnTo:
    string |
    null |
    undefined
) {
  const state =
    randomBytes(32)
      .toString(
        "base64url"
      );

  const verifier =
    randomBytes(48)
      .toString(
        "base64url"
      );

  const challenge =
    createHash(
      "sha256"
    )
      .update(
        verifier,
        "utf8"
      )
      .digest(
        "base64url"
      );

  return {
    state,
    verifier,
    challenge,
    returnTo:
      safeInternalReturnPath(
        returnTo
      )
  };
}

export function buildCivilizationLoginUrl(
  input: {
    state: string;
    challenge: string;
    localeCode:
      string |
      null;
    languageCode:
      string |
      null;
  }
): string | null {
  const base =
    configuredCivilizationBaseUrl();

  if (!base) {
    return null;
  }

  const url =
    new URL(
      "/login",
      base
    );

  url.searchParams.set(
    "locale_code",
    input.localeCode ===
      "en-us"
      ? "en-us"
      : "ja-jp"
  );

  url.searchParams.set(
    "language_code",
    input.languageCode ===
      "en"
      ? "en"
      : "ja"
  );

  url.searchParams.set(
    "after_login_path",
    "/civilization-menu"
  );

  url.searchParams.set(
    "return_to",
    "/"
  );

  url.searchParams.set(
    "requested_os_code",
    "persona"
  );

  url.searchParams.set(
    "handoff_state",
    input.state
  );

  url.searchParams.set(
    "code_challenge",
    input.challenge
  );

  url.searchParams.set(
    "code_challenge_method",
    "S256"
  );

  return url.toString();
}

export function setPersonaAuthCookies(
  response:
    NextResponse,
  input: {
    state: string;
    verifier: string;
    returnTo: string;
    secure: boolean;
  }
): void {
  const options = {
    httpOnly: true,
    secure:
      input.secure,
    sameSite:
      "lax" as const,
    path: "/",
    maxAge:
      AUTH_COOKIE_MAX_AGE_SECONDS
  };

  response.cookies.set(
    PERSONA_AUTH_STATE_COOKIE_NAME,
    input.state,
    options
  );

  response.cookies.set(
    PERSONA_AUTH_PKCE_COOKIE_NAME,
    input.verifier,
    options
  );

  response.cookies.set(
    PERSONA_AUTH_RETURN_COOKIE_NAME,
    input.returnTo,
    options
  );
}

export function readPersonaAuthCookies(
  request:
    NextRequest
) {
  return {
    state:
      request.cookies.get(
        PERSONA_AUTH_STATE_COOKIE_NAME
      )?.value,
    verifier:
      request.cookies.get(
        PERSONA_AUTH_PKCE_COOKIE_NAME
      )?.value,
    returnTo:
      safeInternalReturnPath(
        request.cookies.get(
          PERSONA_AUTH_RETURN_COOKIE_NAME
        )?.value
      )
  };
}

export function clearPersonaAuthCookies(
  response:
    NextResponse,
  secure: boolean
): void {
  for (
    const name of [
      PERSONA_AUTH_STATE_COOKIE_NAME,
      PERSONA_AUTH_PKCE_COOKIE_NAME,
      PERSONA_AUTH_RETURN_COOKIE_NAME
    ]
  ) {
    response.cookies.set(
      name,
      "",
      {
        httpOnly: true,
        secure,
        sameSite:
          "lax",
        path: "/",
        maxAge: 0
      }
    );
  }
}
