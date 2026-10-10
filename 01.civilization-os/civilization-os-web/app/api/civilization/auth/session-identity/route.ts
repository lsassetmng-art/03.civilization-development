import {
  readCivilizationServerSession
} from "@/lib/civilization-server-session";

import {
  NextRequest,
  NextResponse
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function noStoreJson(
  body: Record<string, string>,
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

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const result =
    readCivilizationServerSession(
      request
    );

  if (
    result.status ===
    "not_configured"
  ) {
    return noStoreJson(
      {
        error:
          "session_signing_not_configured"
      },
      503
    );
  }

  if (
    result.status !==
    "ok"
  ) {
    return noStoreJson(
      {
        error:
          "unauthenticated"
      },
      401
    );
  }

  return noStoreJson(
    {
      server_session_actor_key:
        result.session.civilizationId
    },
    200
  );
}
