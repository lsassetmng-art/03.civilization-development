import { NextResponse } from "next/server";

/** Portal does not own credentials or issue authentication sessions. */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false, error: "AUTH_OWNED_BY_CIVILIZATION_OS" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
