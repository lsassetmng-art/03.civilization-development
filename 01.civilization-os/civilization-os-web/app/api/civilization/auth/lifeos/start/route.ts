import { NextRequest, NextResponse } from "next/server";
import { readCivilizationServerSession } from "@/lib/civilization-server-session";
import { configuredPortalOrigin, issueLifeosCode } from "@/lib/lifeos-handoff-db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const deny = (status: number) => NextResponse.json({ ok: false }, { status, headers: { "cache-control": "no-store" } });
export async function GET(request: NextRequest) {
  const origin = configuredPortalOrigin();
  if (!origin) return deny(503);
  const params = request.nextUrl.searchParams;
  const state = params.get("state");
  const challenge = params.get("code_challenge");
  if (params.getAll("state").length !== 1 || params.getAll("code_challenge").length !== 1 ||
      params.getAll("code_challenge_method").length !== 1 || params.get("code_challenge_method") !== "S256" ||
      !state || !challenge || !/^[A-Za-z0-9_-]{43}$/.test(state) || !/^[A-Za-z0-9_-]{43}$/.test(challenge)) return deny(400);
  const session = readCivilizationServerSession(request);
  if (session.status === "not_configured") return deny(503);
  if (session.status !== "ok") {
    // Keep the continuation on the CivilizationOS origin. Never accept a caller-supplied return URL.
    const resume = new URL("/api/civilization/auth/lifeos/start", request.nextUrl.origin);
    resume.searchParams.set("state", state);
    resume.searchParams.set("code_challenge", challenge);
    resume.searchParams.set("code_challenge_method", "S256");
    const login = new URL("/login", request.nextUrl.origin);
    login.searchParams.set("after_login_path", resume.pathname + resume.search);
    const response = NextResponse.redirect(login, 303);
    response.headers.set("cache-control", "no-store");
    response.headers.set("referrer-policy", "no-referrer");
    return response;
  }
  try {
    if (!session.session.lifeosSessionId) return deny(401);
    const code = await issueLifeosCode(
      session.session.civilizationId,
      session.session.lifeosSessionId,
      session.session.expiresAt,
      origin,
      state,
      challenge
    );
    if (!code) return deny(503);
    const callback = new URL("/api/lifeos/auth/callback", origin);
    callback.searchParams.set("code", code);
    callback.searchParams.set("state", state);
    const response = NextResponse.redirect(callback, 303);
    response.headers.set("cache-control", "no-store");
    response.headers.set("referrer-policy", "no-referrer");
    return response;
  } catch { return deny(503); }
}
