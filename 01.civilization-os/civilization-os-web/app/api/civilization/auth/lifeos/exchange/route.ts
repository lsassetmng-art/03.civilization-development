import { NextRequest, NextResponse } from "next/server";
import { authorizedExchange, configuredPortalOrigin, consumeLifeosCode } from "@/lib/lifeos-handoff-db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const deny = (status: number) => NextResponse.json({ ok: false }, { status, headers: { "cache-control": "no-store" } });
export async function POST(request: NextRequest) {
  if (!authorizedExchange(request)) return deny(401);
  const origin = configuredPortalOrigin();
  if (!origin || !request.headers.get("content-type")?.startsWith("application/json")) return deny(400);
  let raw: string;
  try { raw = await request.text(); } catch { return deny(400); }
  if (Buffer.byteLength(raw) > 2048) return deny(400);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return deny(400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return deny(400);
  const data = body as Record<string, unknown>;
  try {
    const id = await consumeLifeosCode(data.code, origin, data.state, data.code_verifier);
    if (!id) return deny(401);
    return NextResponse.json({ ok: true, civilizationId: id }, { headers: { "cache-control": "no-store" } });
  } catch { return deny(503); }
}
