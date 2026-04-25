import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../services/mock-server/api-meta";
import { buildMockPortalAuthData } from "../../../../../../services/mock-server/auth-mock";
import type { PortalAuthResponse, PortalSignupRequest } from "../../../../../../types/portal-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalSignupRequest>;

    if (
      body.operation !== "signup" ||
      !body.profilePreset ||
      !body.returnContext ||
      !body.returnContext.returnTarget ||
      !body.returnContext.requestTimestamp
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_SIGNUP_REQUEST",
          "The signup request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalAuthResponse = {
      meta: createPortalApiMeta(true),
      data: buildMockPortalAuthData("signup", body as PortalSignupRequest),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "SIGNUP_REQUEST_PARSE_ERROR",
        "The signup request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
