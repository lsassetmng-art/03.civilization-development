import {
  buildAiWorkerPublicReturnUrl,
  clearAiWorkerAuthCookies,
  readAiWorkerAuthCookies,
  secureCookieForRequest
} from "../../../../../lib/auth/aiworker-auth-start";

import {
  aiWorkerServerSessionConfigured,
  createAiWorkerServerSession,
  setAiWorkerServerSessionCookie
} from "../../../../../lib/auth/aiworker-server-session";

import {
  exchangeCivilizationHandoff
} from "../../../../../lib/auth/civilization-handoff-client";

import {
  NextRequest,
  NextResponse
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function errorResponse(
  request: NextRequest,
  error: string,
  status: number
): NextResponse {
  const secure =
    secureCookieForRequest(
      request
    );

  const response =
    NextResponse.json(
      {
        ok: false,
        error
      },
      {
        status,
        headers: {
          "cache-control":
            "no-store",
          "referrer-policy":
            "no-referrer"
        }
      }
    );

  clearAiWorkerAuthCookies(
    response,
    secure
  );

  return response;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const code =
    request.nextUrl
      .searchParams
      .get("code");

  const state =
    request.nextUrl
      .searchParams
      .get("state");

  const auth =
    readAiWorkerAuthCookies(
      request
    );

  if (
    !code ||
    !state ||
    !auth.state ||
    !auth.verifier ||
    state !== auth.state
  ) {
    return errorResponse(
      request,
      "invalid_handoff",
      401
    );
  }

  if (
    !aiWorkerServerSessionConfigured()
  ) {
    return errorResponse(
      request,
      "aiworker_session_not_configured",
      503
    );
  }

  const exchange =
    await exchangeCivilizationHandoff(
      {
        code,
        state,
        codeVerifier:
          auth.verifier
      }
    );

  if (
    exchange.status ===
      "invalid"
  ) {
    return errorResponse(
      request,
      "invalid_handoff",
      401
    );
  }

  if (
    exchange.status !==
      "ok"
  ) {
    return errorResponse(
      request,
      "handoff_unavailable",
      503
    );
  }

  const session =
    createAiWorkerServerSession(
      exchange
        .serverSessionActorKey
    );

  if (!session) {
    return errorResponse(
      request,
      "invalid_identity",
      401
    );
  }

  const target =
    buildAiWorkerPublicReturnUrl(
      auth.returnTo
    );

  if (!target) {
    return errorResponse(
      request,
      "aiworker_public_base_not_configured",
      503
    );
  }

  const secure =
    secureCookieForRequest(
      request
    );

  const response =
    NextResponse.redirect(
      target,
      303
    );

  response.headers.set(
    "cache-control",
    "no-store"
  );

  response.headers.set(
    "referrer-policy",
    "no-referrer"
  );

  if (
    !setAiWorkerServerSessionCookie(
      response,
      session,
      secure
    )
  ) {
    return errorResponse(
      request,
      "aiworker_session_issue_failed",
      503
    );
  }

  clearAiWorkerAuthCookies(
    response,
    secure
  );

  return response;
}
