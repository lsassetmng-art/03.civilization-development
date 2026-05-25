import { NextResponse } from "next/server";

const supportedProviders = new Set(["google", "yahoo"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.pathname.split("/").filter(Boolean).pop() ?? "";

  if (!supportedProviders.has(provider)) {
    return NextResponse.json(
      { ok: false, error: "unsupported_oauth_provider" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      provider,
      error: "oauth_not_configured",
      message: "OAuth callback verification is not configured yet. No CivilizationOS session was created."
    },
    { status: 501 }
  );
}
