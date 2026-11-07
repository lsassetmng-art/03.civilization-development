import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { civilizationOrigin, newState, noStore, setState } from "../../../../../lib/lifeos-server-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const origin = civilizationOrigin();
  if (!origin) return noStore(NextResponse.json({ ok: false }, { status: 503 }));
  const state = newState();
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const target = new URL("/api/civilization/auth/lifeos/start", origin);
  target.searchParams.set("state", state);
  target.searchParams.set("code_challenge", challenge);
  target.searchParams.set("code_challenge_method", "S256");
  const response = NextResponse.redirect(target, 303);
  setState(response, state);
  response.cookies.set("lifeos_portal_pkce_v1", verifier, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/lifeos/auth", maxAge: 600
  });
  return noStore(response);
}
