import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "lifeos_portal_session_v1";
export const STATE_COOKIE = "lifeos_portal_handoff_state_v1";
const TTL_SECONDS = 8 * 60 * 60;
function key(): string | null {
  const secret = process.env.LIFEOS_PORTAL_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}
function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
function secure() { return process.env.NODE_ENV === "production"; }
export function newState() { return randomBytes(32).toString("base64url"); }
export function setState(response: NextResponse, state: string) {
  response.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: secure(), sameSite: "lax", path: "/api/lifeos/auth", maxAge: 600 });
}
export function clearState(response: NextResponse) {
  response.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: secure(), sameSite: "lax", path: "/api/lifeos/auth", maxAge: 0 });
}
export function setSession(response: NextResponse, id: string): boolean {
  const secret = key();
  if (!secret || !id || id.length > 256) return false;
  const payload = Buffer.from(JSON.stringify({ id, exp: Date.now() + TTL_SECONDS * 1000 })).toString("base64url");
  response.cookies.set(SESSION_COOKIE, `${payload}.${sign(payload, secret)}`, { httpOnly: true, secure: secure(), sameSite: "lax", path: "/", maxAge: TTL_SECONDS });
  return true;
}
export function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: secure(), sameSite: "lax", path: "/", maxAge: 0 });
}
export async function readSession(): Promise<string | null> {
  const secret = key();
  if (!secret) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const actual = Buffer.from(signature, "base64url");
  const expected = Buffer.from(sign(payload, secret), "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const value: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!value || typeof value !== "object" || !("id" in value) || !("exp" in value)) return null;
    const { id, exp } = value as { id: unknown; exp: unknown };
    return typeof id === "string" && id.length > 0 && id.length <= 256 && typeof exp === "number" && exp > Date.now() ? id : null;
  } catch { return null; }
}
export function noStore(response: NextResponse) {
  response.headers.set("cache-control", "no-store");
  response.headers.set("referrer-policy", "no-referrer");
  return response;
}
export function civilizationOrigin(): string | null {
  const raw = process.env.LIFEOS_CIVILIZATION_ORIGIN;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if ((url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) || url.origin !== raw || url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}
