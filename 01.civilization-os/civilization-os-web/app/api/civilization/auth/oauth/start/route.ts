import { NextResponse } from "next/server";
import { appendLoginRedirectParams } from "@/lib/civilization-auth-redirect";

const supportedProviders = new Set(["google", "yahoo"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") ?? "";
  const languageCode = url.searchParams.get("language_code") ?? "ja";

  if (!supportedProviders.has(provider)) {
    return NextResponse.json(
      { ok: false, error: "unsupported_oauth_provider" },
      { status: 400 }
    );
  }

  const loginUrl = new URL("/login", url.origin);
  appendLoginRedirectParams(loginUrl.searchParams, url.search, languageCode);
  loginUrl.searchParams.set("auth_provider", provider);
  loginUrl.searchParams.set("auth_provider_status", "not_configured");

  return NextResponse.redirect(loginUrl);
}
