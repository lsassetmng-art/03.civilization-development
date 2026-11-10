import { revokeLifeosSession } from "@/lib/lifeos-handoff-db";
import {
  clearCivilizationServerSessionCookie,
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

function configuredPublicBaseUrl(): string {
  return (
    process.env.CIVILIZATION_OS_PUBLIC_BASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_CIVILIZATION_OS_BASE_URL?.trim() ??
    ""
  );
}

function secureCookie(
  request: NextRequest
): boolean {
  const configured =
    configuredPublicBaseUrl();

  if (configured) {
    try {
      return (
        new URL(configured).protocol ===
        "https:"
      );
    } catch {
      return false;
    }
  }

  return (
    request.nextUrl.protocol ===
    "https:"
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { ok: false, error: "invalid_origin" },
      {
        status: 403,
        headers: { "cache-control": "no-store" }
      }
    );
  }

  const response =
    new NextResponse(
      null,
      {
        status: 204,
        headers: {
          "cache-control":
            "no-store"
        }
      }
    );

  const existing = readCivilizationServerSession(request);
  if (existing.status === "ok" && existing.session.lifeosSessionId) {
    try {
      const revoked = await revokeLifeosSession(existing.session.lifeosSessionId);
      if (!revoked) {
        return NextResponse.json(
          { ok: false, error: "session_revocation_failed" },
          { status: 503, headers: { "cache-control": "no-store" } }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "session_revocation_unavailable" },
        { status: 503, headers: { "cache-control": "no-store" } }
      );
    }
  }

  clearCivilizationServerSessionCookie(
    response,
    secureCookie(request)
  );

  return response;
}
