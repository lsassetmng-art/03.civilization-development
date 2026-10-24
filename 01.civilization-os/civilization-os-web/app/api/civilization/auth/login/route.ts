import {
  issueAiWorkerHandoff
} from "@/lib/civilization-auth-handoff";
import { issuePersonaHandoff } from "@/lib/persona-auth-handoff";

import {
  civilizationServerSessionConfigured,
  readCivilizationServerSession,
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

type HandoffFields = {
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
};

function handoffFieldsFromSearch(
  params: URLSearchParams
): HandoffFields {
  return {
    state:
      params.get(
        "handoff_state"
      ) ??
      undefined,
    codeChallenge:
      params.get(
        "code_challenge"
      ) ??
      undefined,
    codeChallengeMethod:
      params.get(
        "code_challenge_method"
      ) ??
      undefined
  };
}

function handoffFieldsFromBody(
  body: JsonRecord
): HandoffFields {
  return {
    state:
      optionalString(
        body.handoffState,
        256
      ),
    codeChallenge:
      optionalString(
        body.codeChallenge,
        256
      ),
    codeChallengeMethod:
      optionalString(
        body.codeChallengeMethod,
        32
      )
  };
}

function buildAiWorkerContinuationTarget(
  input: {
    localeCode: string;
    languageCode: string;
    afterLoginPath: string;
    returnTo: string;
    handoff: HandoffFields;
  }
): string {
  const params =
    new URLSearchParams();

  params.set(
    "locale_code",
    input.localeCode
  );

  params.set(
    "language_code",
    input.languageCode
  );

  params.set(
    "after_login_path",
    input.afterLoginPath
  );

  params.set(
    "return_to",
    input.returnTo
  );

  params.set(
    "requested_os_code",
    "aiworker"
  );

  if (input.handoff.state) {
    params.set(
      "handoff_state",
      input.handoff.state
    );
  }

  if (
    input.handoff
      .codeChallenge
  ) {
    params.set(
      "code_challenge",
      input.handoff
        .codeChallenge
    );
  }

  if (
    input.handoff
      .codeChallengeMethod
  ) {
    params.set(
      "code_challenge_method",
      input.handoff
        .codeChallengeMethod
    );
  }

  return (
    "/login?" +
    params.toString()
  );
}

async function resolveAuthenticatedTarget(
  input: {
    civilizationId: string;
    afterLoginPath: string;
    requestedOsCode: string;
    handoff: HandoffFields;
  }
): Promise<
  | {
      ok: true;
      redirectTarget: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    }
> {
  const normalTarget =
    resolveOAuthPostLoginTarget(
      {
        afterLoginPath:
          input.afterLoginPath,
        requestedOsCode:
          input.requestedOsCode
      },
      process.env
        .AIWORKEROS_PUBLIC_BASE_URL
    );

  if (input.requestedOsCode === "persona") {
    const issued = await issuePersonaHandoff({
      serverSessionActorKey: input.civilizationId,
      state: input.handoff.state,
      codeChallenge: input.handoff.codeChallenge,
      codeChallengeMethod: input.handoff.codeChallengeMethod
    });
    if (issued.status !== "ok") {
      return { ok: false, status: issued.status === "invalid_request" ? 400 : 503, error: "persona_handoff_unavailable" };
    }
    return { ok: true, redirectTarget: issued.redirectTarget };
  }

  if (
    input.requestedOsCode !==
      "aiworker"
  ) {
    return {
      ok: true,
      redirectTarget:
        normalTarget
    };
  }

  if (
    !validAiWorkerTarget(
      normalTarget
    )
  ) {
    return {
      ok: false,
      status: 503,
      error:
        "aiworker_target_not_configured"
    };
  }

  const handoffResult =
    await issueAiWorkerHandoff(
      {
        serverSessionActorKey:
          input.civilizationId,
        state:
          input.handoff.state,
        codeChallenge:
          input.handoff
            .codeChallenge,
        codeChallengeMethod:
          input.handoff
            .codeChallengeMethod
      }
    );

  if (
    handoffResult.status ===
      "ok"
  ) {
    return {
      ok: true,
      redirectTarget:
        handoffResult
          .redirectTarget
    };
  }

  if (
    handoffResult.status ===
      "invalid_request"
  ) {
    return {
      ok: false,
      status: 400,
      error:
        "invalid_aiworker_handoff"
    };
  }

  return {
    ok: false,
    status: 503,
    error:
      "aiworker_handoff_unavailable"
  };
}

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const sessionResult =
    readCivilizationServerSession(
      request
    );

  if (
    sessionResult.status ===
      "not_configured"
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

  if (
    sessionResult.status !==
      "ok"
  ) {
    return noStoreJson(
      {
        ok: false,
        error:
          "unauthenticated"
      },
      401
    );
  }

  const params =
    request.nextUrl.searchParams;

  const languageCode =
    normalizeOAuthLanguageCode(
      params.get("language_code") ??
      params.get("languageCode")
    );

  const localeCode =
    normalizeLocaleCode(
      params.get("locale_code") ??
      params.get("localeCode"),
      languageCode
    );

  const afterLoginPath =
    normalizeSafeRedirectPath(
      params.get("after_login_path"),
      "/civilization-menu"
    );

  const returnTo =
    normalizeSafeRedirectPath(
      params.get("return_to"),
      "/"
    );

  const requestedOsCode =
    normalizeRequestedOsCode(
      params.get("requested_os_code") ??
      params.get("requestedOsCode")
    );

  const targetResult =
    await resolveAuthenticatedTarget(
      {
        civilizationId:
          sessionResult
            .session
            .civilizationId,
        afterLoginPath,
        requestedOsCode,
        handoff:
          handoffFieldsFromSearch(
            params
          )
      }
    );

  if (!targetResult.ok) {
    return noStoreJson(
      {
        ok: false,
        error:
          targetResult.error
      },
      targetResult.status
    );
  }

  const redirectTarget =
    targetResult
      .redirectTarget;

  return noStoreJson(
    {
      ok: true,
      redirectTarget,
      context: {
        localeCode,
        languageCode,
        afterLoginPath,
        returnTo,
        requestedOsCode
      }
    },
    200
  );
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

  const handoff =
    handoffFieldsFromBody(
      body
    );

  let redirectTarget:
    string;

  if (requestedOsCode === "persona") {
    const issued = await issuePersonaHandoff({
      serverSessionActorKey: verification.civilizationId,
      state: handoff.state,
      codeChallenge: handoff.codeChallenge,
      codeChallengeMethod: handoff.codeChallengeMethod
    });
    if (issued.status !== "ok") {
      return noStoreJson({ ok: false, error: "persona_handoff_unavailable" },
        issued.status === "invalid_request" ? 400 : 503);
    }
    redirectTarget = issued.redirectTarget;
  } else if (
    requestedOsCode ===
      "aiworker"
  ) {
    if (
      !handoff.state ||
      !handoff.codeChallenge ||
      handoff.codeChallengeMethod !==
        "S256"
    ) {
      return noStoreJson(
        {
          ok: false,
          error:
            "invalid_aiworker_handoff"
        },
        400
      );
    }

    const configuredTarget =
      resolveOAuthPostLoginTarget(
        {
          afterLoginPath,
          requestedOsCode
        },
        process.env
          .AIWORKEROS_PUBLIC_BASE_URL
      );

    if (
      !validAiWorkerTarget(
        configuredTarget
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

    redirectTarget =
      buildAiWorkerContinuationTarget(
        {
          localeCode,
          languageCode,
          afterLoginPath,
          returnTo,
          handoff
        }
      );
  } else {
    redirectTarget =
      resolveOAuthPostLoginTarget(
        {
          afterLoginPath,
          requestedOsCode
        },
        process.env
          .AIWORKEROS_PUBLIC_BASE_URL
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
