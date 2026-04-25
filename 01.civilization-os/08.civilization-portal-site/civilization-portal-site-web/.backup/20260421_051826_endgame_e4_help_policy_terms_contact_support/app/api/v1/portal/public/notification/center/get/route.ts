import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { getPublicNotificationCenter } from "../../../../../../../../services/mock-server/notification-store";
import type {
  PortalPublicNotificationCenterGetRequest,
  PortalPublicNotificationCenterGetResponse,
} from "../../../../../../../../types/portal-notification-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicNotificationCenterGetRequest>;

    if (
      (body.surface !== "home" && body.surface !== "launcher") ||
      !body.session ||
      typeof body.limit !== "number"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_NOTIFICATION_CENTER_GET_REQUEST",
          "The public notification center get request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicNotificationCenterGetResponse = {
      meta: createPortalApiMeta(true),
      data: getPublicNotificationCenter({
        surface: body.surface,
        session: body.session,
        limit: body.limit,
      }),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_NOTIFICATION_CENTER_GET_PARSE_ERROR",
        "The public notification center get request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
