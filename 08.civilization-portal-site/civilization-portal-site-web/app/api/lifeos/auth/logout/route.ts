import { NextResponse } from "next/server";
import { clearSession, clearState, noStore } from "../../../../../lib/lifeos-server-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return noStore(NextResponse.json({ ok: false }, { status: 403 }));
  const response = NextResponse.redirect(new URL("/lifeos", request.url), 303);
  clearSession(response);
  clearState(response);
  response.cookies.set("lifeos_portal_pkce_v1", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/lifeos/auth", maxAge: 0 });
  return noStore(response);
}
