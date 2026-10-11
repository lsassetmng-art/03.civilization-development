import {
  civilizationServerSessionConfigured,
  setCivilizationServerSessionCookie
} from "@/lib/civilization-server-session";

import {
  normalizeOAuthLanguageCode,
  normalizeRequestedOsCode,
  normalizeSafeRedirectPath,
  resolveOAuthPostLoginTarget
} from "@/lib/oauth-state";

import {
  verifyCivilizationTestLogin
} from "@/lib/civilization-test-login-server";

import {
  NextRequest,
  NextResponse
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const MAX_BODY_BYTES =
  8192;

const SESSION_TTL_MS =
  8 * 60 * 60 * 1000;

type JsonRecord =
  Record<string, unknown>;

function noStoreJson(
  body: unknown,
  status: number
): NextResponse {
  return NextResponse.json(
    body,
    {
      status,
      headers: {
        "cache-control":
          "no-store"
      }
    }
  );
}

function isRecord(
  value: unknown
): value is JsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function requiredString(
  value: unknown,
  maxLength: number
): string | null {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maxLength
  ) {
    return null;
  }

  return value;
}

function optionalString(
  value: unknown,
  maxLength: number
): string | undefined {
  if (
    typeof value !== "string" ||
    value.length === 0
  ) {
    return undefined;
  }

  if (
    value.length > maxLength
  ) {
    return undefined;
  }

  return value;
}

function normalizeLocaleCode(
  value: unknown,
  languageCode: string
): "ja-jp" | "en-us" {
  const raw =
    String(
      value ??
      languageCode ??
      "ja"
    )
      .trim()
      .toLowerCase()
      .replaceAll("_", "-");

  if (
    raw === "en" ||
    raw === "en-us" ||
    raw.startsWith("en-")
  ) {
    return "en-us";
  }

  return "ja-jp";
}

function configuredPublicOrigin():
  string | null {
  const raw =
    process.env
      .CIVILIZATION_OS_PUBLIC_BASE_URL
      ?.trim() ||
    process.env
      .NEXT_PUBLIC_CIVILIZATION_OS_BASE_URL
      ?.trim() ||
    "";

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
      url.protocol === "http:" &&
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

function requestOriginMatches(
  request: NextRequest,
  expectedOrigin: string
): boolean {
  const supplied =
    request.headers
      .get("origin")
      ?.trim();

  if (!supplied) {
    return false;
  }

  try {
    return (
      new URL(supplied)
        .origin ===
      expectedOrigin
    );
  } catch {
    return false;
  }
}

async function readRequestBody(
  request: NextRequest
): Promise<JsonRecord | null> {
  const contentType =
    request.headers
      .get("content-type")
      ?.toLowerCase() ??
    "";

  if (
    !contentType.startsWith(
      "application/json"
    )
  ) {
    return null;
  }

  const contentLength =
    request.headers
      .get("content-length");

  if (contentLength) {
    const declared =
      Number(contentLength);

    if (
      Number.isFinite(declared) &&
      declared >
        MAX_BODY_BYTES
    ) {
      return null;
    }
  }

  let raw: string;

  try {
    raw =
      await request.text();
  } catch {
    return null;
  }

  if (
    Buffer.byteLength(
      raw,
      "utf8"
    ) > MAX_BODY_BYTES
  ) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(raw);
  } catch {
    return null;
  }

  return isRecord(parsed)
    ? parsed
    : null;
}

function validAiWorkerTarget(
  target: string
): boolean {
  if (
    !target.startsWith(
      "http://"
    ) &&
    !target.startsWith(
      "https://"
    )
  ) {
    return false;
  }

  try {
    const url =
      new URL(target);

    const secure =
      url.protocol ===
      "https:";

    const localHttp =
      url.protocol === "http:" &&
      (
        url.hostname ===
          "localhost" ||
        url.hostname ===
          "127.0.0.1" ||
        url.hostname ===
          "[::1]"
      );

    return (
      (secure || localHttp) &&
      !url.username &&
      !url.password &&
      url.pathname ===
        "/aiworker-menu"
    );
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const publicOrigin =
    configuredPublicOrigin();

  if (!publicOrigin) {
    return noStoreJson(
      {
        ok: false,
        error:
          "test_login_not_configured"
      },
      503
    );
  }

  if (
    !requestOriginMatches(
      request,
      publicOrigin
    )
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "invalid_origin"
      },
      403
    );
  }

  const body =
    await readRequestBody(
      request
    );

  if (!body) {
    return noStoreJson(
      {
        ok: false,
        error:
          "invalid_request"
      },
      400
    );
  }

  const loginIdentifier =
    requiredString(
      body.loginIdentifier,
      128
    );

  const password =
    requiredString(
      body.password,
      1024
    );

  if (
    !loginIdentifier ||
    !password
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "invalid_request"
      },
      400
    );
  }

  const verification =
    verifyCivilizationTestLogin(
      {
        loginIdentifier,
        password
      }
    );

  if (
    verification.status ===
      "disabled" ||
    verification.status ===
      "not_configured"
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "test_login_unavailable"
      },
      503
    );
  }

  if (
    verification.status !==
    "ok"
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "invalid_credentials"
      },
      401
    );
  }

  if (
    !civilizationServerSessionConfigured()
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "session_signing_not_configured"
      },
      503
    );
  }

  const languageCode =
    normalizeOAuthLanguageCode(
      optionalString(
        body.languageCode,
        32
      )
    );

  const localeCode =
    normalizeLocaleCode(
      optionalString(
        body.localeCode,
        32
      ),
      languageCode
    );

  const afterLoginPath =
    normalizeSafeRedirectPath(
      optionalString(
        body.afterLoginPath,
        2048
      ),
      "/civilization-menu"
    );

  const returnTo =
    normalizeSafeRedirectPath(
      optionalString(
        body.returnTo,
        2048
      ),
      "/"
    );

  const requestedOsCode =
    normalizeRequestedOsCode(
      optionalString(
        body.requestedOsCode,
        64
      )
    );

  const redirectTarget =
    resolveOAuthPostLoginTarget(
      {
        afterLoginPath,
        requestedOsCode
      },
      process.env
        .AIWORKEROS_PUBLIC_BASE_URL
    );

  if (
    requestedOsCode ===
      "aiworker" &&
    !validAiWorkerTarget(
      redirectTarget
    )
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "aiworker_target_not_configured"
      },
      503
    );
  }

  const issuedAtMs =
    Date.now();

  const expiresAtMs =
    issuedAtMs +
    SESSION_TTL_MS;

  const issuedAt =
    new Date(
      issuedAtMs
    ).toISOString();

  const expiresAt =
    new Date(
      expiresAtMs
    ).toISOString();

  const response =
    noStoreJson(
      {
        ok: true,
        clientSession: {
          version: 1,
          issuedAt:
            issuedAtMs,
          expiresAt:
            expiresAtMs,
          loginMethod:
            "civilization",
          loginIdentifier:
            verification
              .civilizationId,
          requestedOsCode,
          returnTo,
          afterLoginPath,
          localeCode,
          languageCode
        },
        redirectTarget
      },
      200
    );

  const cookieSet =
    setCivilizationServerSessionCookie(
      response,
      {
        version: 1,
        civilizationId:
          verification
            .civilizationId,
        issuedAt,
        expiresAt,
        localeCode,
        languageCode,
        requestedOsCode
      },
      publicOrigin.startsWith(
        "https://"
      )
    );

  if (!cookieSet) {
    return noStoreJson(
      {
        ok: false,
        error:
          "session_signing_failed"
      },
      503
    );
  }

  return response;
}
