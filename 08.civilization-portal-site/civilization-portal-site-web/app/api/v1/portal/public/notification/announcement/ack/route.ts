import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { ackAnnouncement } from "../../../../../../../../services/mock-server/notification-store";
import type {
  PortalPublicNotificationAnnouncementAckRequest,
  PortalPublicNotificationAnnouncementAckResponse,
} from "../../../../../../../../types/portal-notification-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicNotificationAnnouncementAckRequest>;

    if (
      !body.session ||
      !body.code ||
      (body.surface !== "home" && body.surface !== "launcher")
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_NOTIFICATION_ANNOUNCEMENT_ACK_REQUEST",
          "The public announcement ack request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    try {
      const item = ackAnnouncement(body.session, {
        code: body.code,
        surface: body.surface,
      });

      const response: PortalPublicNotificationAnnouncementAckResponse = {
        meta: createPortalApiMeta(true),
        data: {
          item,
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Announcement ack could not be completed.";

      return NextResponse.json(
        createPortalErrorBody(
          "PUBLIC_NOTIFICATION_ANNOUNCEMENT_ACK_DENIED",
          message,
        ),
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_NOTIFICATION_ANNOUNCEMENT_ACK_PARSE_ERROR",
        "The public announcement ack request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
