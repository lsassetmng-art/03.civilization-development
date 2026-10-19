import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function configuredPortalUrl(): URL | null {
  const raw = process.env.CIVILIZATION_PORTAL_PUBLIC_BASE_URL?.trim();

  if (!raw) return null;

  try {
    const url = new URL(raw);

    const allowed =
      url.protocol === "https:" ||
      (
        url.protocol === "http:" &&
        process.env.CIVILIZATION_PORTAL_ALLOW_HTTP === "true"
      );

    if (
      !allowed ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function GET(): NextResponse {
  const portal = configuredPortalUrl();

  if (!portal) {
    return NextResponse.json(
      { ok: false, error: "portal_return_not_configured" },
      {
        status: 503,
        headers: { "cache-control": "no-store" }
      }
    );
  }

  const response = NextResponse.redirect(portal, 302);

  response.headers.set("cache-control", "no-store");
  response.headers.set("referrer-policy", "no-referrer");

  return response;
}
