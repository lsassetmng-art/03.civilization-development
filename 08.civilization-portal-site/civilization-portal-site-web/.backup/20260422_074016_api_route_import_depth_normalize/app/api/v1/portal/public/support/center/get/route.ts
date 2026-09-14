import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { getSupportCenter } from "../../../../../../../../services/mock-server/support-store";
import type {
  PortalPublicSupportCenterGetRequest,
  PortalPublicSupportCenterGetResponse,
} from "../../../../../../../../types/portal-support-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicSupportCenterGetRequest>;

    if (
      (body.surface !== "help" &&
        body.surface !== "policy" &&
        body.surface !== "terms" &&
        body.surface !== "contact" &&
        body.surface !== "home" &&
        body.surface !== "launcher") ||
      !body.session
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_SUPPORT_CENTER_GET_REQUEST",
          "The public support center get request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicSupportCenterGetResponse = {
      meta: createPortalApiMeta(true),
      data: getSupportCenter({
        surface: body.surface,
        session: body.session,
      }),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_SUPPORT_CENTER_GET_PARSE_ERROR",
        "The public support center get request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
