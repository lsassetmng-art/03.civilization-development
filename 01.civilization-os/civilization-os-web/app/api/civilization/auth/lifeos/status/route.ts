import { NextRequest, NextResponse } from "next/server";
import { authorizedExchange, validLifeosSession } from "@/lib/lifeos-handoff-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const deny = (status: number) =>
  NextResponse.json(
    { ok: false },
    { status, headers: { "cache-control": "no-store" } }
  );

export async function POST(request: NextRequest) {
  if (!authorizedExchange(request)) return deny(401);
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return deny(400);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return deny(400);
  }

  if (Buffer.byteLength(raw) > 2048) return deny(400);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return deny(400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return deny(400);
  }

  const { civilizationId, sid } = body as Record<string, unknown>;
  if (typeof civilizationId !== "string" || typeof sid !== "string") {
    return deny(400);
  }

  try {
    const valid = await validLifeosSession(civilizationId, sid);
    return valid
      ? NextResponse.json(
          { ok: true, valid: true },
          { headers: { "cache-control": "no-store" } }
        )
      : deny(401);
  } catch {
    return deny(503);
  }
}
