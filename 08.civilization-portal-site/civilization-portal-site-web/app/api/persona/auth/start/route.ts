import {
  buildCivilizationLoginUrl,
  createPersonaAuthStart,
  secureCookieForRequest,
  setPersonaAuthCookies
} from "../../../../../lib/auth/persona-auth-start";
import {
  NextRequest,
  NextResponse
} from "next/server";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function GET(
  request:
    NextRequest
): Promise<NextResponse> {
  const auth =
    createPersonaAuthStart(
      request.nextUrl
        .searchParams
        .get(
          "return_to"
        )
    );

  const loginUrl =
    buildCivilizationLoginUrl(
      {
        state:
          auth.state,
        challenge:
          auth.challenge,
        localeCode:
          request.nextUrl
            .searchParams
            .get(
              "locale_code"
            ),
        languageCode:
          request.nextUrl
            .searchParams
            .get(
              "language_code"
            )
      }
    );

  if (!loginUrl) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "civilization_auth_not_configured"
      },
      {
        status: 503,
        headers: {
          "cache-control":
            "no-store"
        }
      }
    );
  }

  const secure =
    secureCookieForRequest(
      request
    );

  const continuationUrl =
    new URL(loginUrl);

  continuationUrl.pathname =
    "/api/civilization/auth/continue";

  const response =
    NextResponse.redirect(
      continuationUrl,
      302
    );

  response.headers.set(
    "cache-control",
    "no-store"
  );

  setPersonaAuthCookies(
    response,
    {
      state:
        auth.state,
      verifier:
        auth.verifier,
      returnTo:
        auth.returnTo,
      secure
    }
  );

  return response;
}
