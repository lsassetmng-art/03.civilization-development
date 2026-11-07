import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { civilizationOrigin, clearState, noStore, setSession, STATE_COOKIE } from "../../../../../lib/lifeos-server-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const deny = (status: number) => noStore(NextResponse.json({ ok: false }, { status }));
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const state = params.get("state");
  const code = params.get("code");
  const expected = request.cookies.get(STATE_COOKIE)?.value;
  const verifier = request.cookies.get("lifeos_portal_pkce_v1")?.value;
  const valid = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{43}$/.test(v);
  if (params.getAll("state").length !== 1 || params.getAll("code").length !== 1 ||
      !valid(state) || !valid(code) || !valid(expected) || !valid(verifier)) return deny(400);
  const a = Buffer.from(state); const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return deny(401);
  const origin = civilizationOrigin();
  const secret = process.env.LIFEOS_HANDOFF_EXCHANGE_SECRET;
  if (!origin || !secret || secret.length < 32) return deny(503);
  try {
    const exchange = await fetch(new URL("/api/civilization/auth/lifeos/exchange", origin), {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify({ code, state, code_verifier: verifier }), cache: "no-store", signal: AbortSignal.timeout(5000)
    });
    if (!exchange.ok) return deny(exchange.status === 503 ? 503 : 401);
    const data: unknown = await exchange.json();
    if (!data || typeof data !== "object" || !("civilizationId" in data) || typeof data.civilizationId !== "string") return deny(401);
    const response = NextResponse.redirect(new URL("/lifeos", request.url), 303);
    if (!setSession(response, data.civilizationId)) return deny(503);
    clearState(response);
    response.cookies.set("lifeos_portal_pkce_v1", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/lifeos/auth", maxAge: 0 });
    return noStore(response);
  } catch { return deny(503); }
}
