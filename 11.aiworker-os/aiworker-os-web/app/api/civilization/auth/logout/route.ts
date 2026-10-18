import {
  clearAiWorkerAuthCookies,
  secureCookieForRequest
} from "../../../../../lib/auth/aiworker-auth-start";
import {
  clearAiWorkerServerSessionCookie
} from "../../../../../lib/auth/aiworker-server-session";
import {
  NextRequest,
  NextResponse
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function POST(
  request:
    NextRequest
): Promise<NextResponse> {
  const secure =
    secureCookieForRequest(
      request
    );

  const response =
    NextResponse.json(
      {
        ok: true
      },
      {
        status: 200,
        headers: {
          "cache-control":
            "no-store"
        }
      }
    );

  clearAiWorkerServerSessionCookie(
    response,
    secure
  );

  clearAiWorkerAuthCookies(
    response,
    secure
  );

  return response;
}
