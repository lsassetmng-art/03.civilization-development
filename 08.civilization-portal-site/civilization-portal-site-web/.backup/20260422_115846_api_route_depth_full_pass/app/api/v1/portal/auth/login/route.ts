import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../services/mock-server/api-meta";
import { buildMockPortalAuthData } from "../../../../../../services/mock-server/auth-mock";
import type { PortalAuthResponse, PortalLoginRequest } from "../../../../../../types/portal-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalLoginRequest>;

    if (
      body.operation !== "login" ||
      !body.profilePreset ||
      !body.returnContext ||
      !body.returnContext.returnTarget ||
      !body.returnContext.requestTimestamp
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_LOGIN_REQUEST",
          "The login request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalAuthResponse = {
      meta: createPortalApiMeta(true),
      data: buildMockPortalAuthData("login", body as PortalLoginRequest),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "LOGIN_REQUEST_PARSE_ERROR",
        "The login request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
