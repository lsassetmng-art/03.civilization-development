import {
  clearCivilizationServerSessionCookie
} from "@/lib/civilization-server-session";

import {
  NextRequest,
  NextResponse
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function configuredPublicBaseUrl(): string {
  return (
    process.env.CIVILIZATION_OS_PUBLIC_BASE_URL?.trim() ??
    process.env.NEXT_PUBLIC_CIVILIZATION_OS_BASE_URL?.trim() ??
    ""
  );
}

function secureCookie(
  request: NextRequest
): boolean {
  const configured =
    configuredPublicBaseUrl();

  if (configured) {
    try {
      return (
        new URL(configured).protocol ===
        "https:"
      );
    } catch {
      return false;
    }
  }

  return (
    request.nextUrl.protocol ===
    "https:"
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const response =
    new NextResponse(
      null,
      {
        status: 204,
        headers: {
          "cache-control":
            "no-store"
        }
      }
    );

  clearCivilizationServerSessionCookie(
    response,
    secureCookie(request)
  );

  return response;
}
