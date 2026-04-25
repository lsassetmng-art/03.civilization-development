import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { listAdminNotificationCenter } from "../../../../../../../../services/mock-server/notification-store";
import type {
  PortalAdminNotificationCenterListRequest,
  PortalAdminNotificationCenterListResponse,
} from "../../../../../../../../types/portal-notification-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminNotificationCenterListRequest>;

    if (body.scope !== "admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_NOTIFICATION_CENTER_LIST_REQUEST",
          "The admin notification center list request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const access = evaluatePortalAdminAccess(body.session);
    if (!access.allowed) {
      return NextResponse.json(
        createPortalErrorBody(
          "ADMIN_ACCESS_DENIED",
          access.reason,
        ),
        { status: 403 },
      );
    }

    const response: PortalAdminNotificationCenterListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminNotificationCenter(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_NOTIFICATION_CENTER_LIST_PARSE_ERROR",
        "The admin notification center list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
