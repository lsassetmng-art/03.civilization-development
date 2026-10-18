import {
  exchangeAiWorkerHandoff
} from "@/lib/civilization-auth-handoff";

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

function json(
  body: unknown,
  status: number
): NextResponse {
  return NextResponse.json(
    body,
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
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const length =
    Number(
      request.headers.get(
        "content-length"
      ) ?? "0"
    );

  if (
    Number.isFinite(length) &&
    length >
      MAX_BODY_BYTES
  ) {
    return json(
      {
        ok: false,
        error: "invalid_request"
      },
      400
    );
  }

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "invalid_request"
      },
      400
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return json(
      {
        ok: false,
        error: "invalid_request"
      },
      400
    );
  }

  const value =
    body as
      Record<string, unknown>;

  const result =
    await exchangeAiWorkerHandoff(
      {
        code:
          value.code,
        state:
          value.state,
        codeVerifier:
          value.code_verifier
      }
    );

  if (
    result.status ===
      "invalid_request"
  ) {
    return json(
      {
        ok: false,
        error: "invalid_request"
      },
      400
    );
  }

  if (
    result.status ===
      "invalid"
  ) {
    return json(
      {
        ok: false,
        error: "invalid_handoff"
      },
      401
    );
  }

  if (
    result.status !==
      "ok"
  ) {
    return json(
      {
        ok: false,
        error:
          "handoff_unavailable"
      },
      503
    );
  }

  return json(
    {
      ok: true,
      server_session_actor_key:
        result
          .serverSessionActorKey
    },
    200
  );
}
