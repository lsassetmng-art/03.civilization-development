import { GET as existingLoginContinuation }
  from "../login/route";

import { NextRequest, NextResponse }
  from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE64URL = /^[A-Za-z0-9_-]+$/;

function redirectNoStore(target: URL): NextResponse {
  const response = NextResponse.redirect(target, 302);
  response.headers.set("cache-control", "no-store");
  response.headers.set("referrer-policy", "no-referrer");
  return response;
}

function fail(error: string, status: number): NextResponse {
  return NextResponse.json(
    { ok: false, error },
    { status, headers: { "cache-control": "no-store" } }
  );
}

function checkedCallback(
  raw: string,
  expectedState: string
): URL | null {
  const rawBase = process.env.AIWORKEROS_PUBLIC_BASE_URL?.trim();
  if (!rawBase) return null;

  try {
    const base = new URL(rawBase);
    const target = new URL(raw);

    const allowedBase =
      base.protocol === "https:" ||
      (base.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname));

    if (
      !allowedBase ||
      base.username ||
      base.password ||
      target.origin !== base.origin ||
      target.username ||
      target.password ||
      target.hash ||
      target.pathname !== "/api/civilization/auth/callback" ||
      target.searchParams.getAll("state").length !== 1 ||
      target.searchParams.get("state") !== expectedState ||
      target.searchParams.getAll("code").length !== 1 ||
      !target.searchParams.get("code")
    ) {
      return null;
    }

    return target;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const state = params.get("handoff_state");
  const challenge = params.get("code_challenge");

  if (
    params.getAll("requested_os_code").length !== 1 ||
    params.get("requested_os_code") !== "aiworker" ||
    params.getAll("handoff_state").length !== 1 ||
    !state ||
    state.length < 43 ||
    state.length > 128 ||
    !BASE64URL.test(state) ||
    params.getAll("code_challenge").length !== 1 ||
    !challenge ||
    challenge.length !== 43 ||
    !BASE64URL.test(challenge) ||
    params.getAll("code_challenge_method").length !== 1 ||
    params.get("code_challenge_method") !== "S256"
  ) {
    return fail("invalid_aiworker_handoff", 400);
  }

  // Canonical session validation and PKCE handoff issuance.
  const result = await existingLoginContinuation(request);

  if (result.status === 401) {
    const login = new URL("/login", request.url);
    login.search = request.nextUrl.search;
    return redirectNoStore(login);
  }

  if (result.status !== 200) {
    return result;
  }

  const data: unknown = await result.json().catch(() => null);

  if (
    !data ||
    typeof data !== "object" ||
    !("ok" in data) ||
    data.ok !== true ||
    !("redirectTarget" in data) ||
    typeof data.redirectTarget !== "string"
  ) {
    return fail("invalid_continuation_response", 503);
  }

  const callback = checkedCallback(
    data.redirectTarget,
    state
  );

  if (!callback) {
    return fail("invalid_aiworker_callback", 503);
  }

  return redirectNoStore(callback);
}
