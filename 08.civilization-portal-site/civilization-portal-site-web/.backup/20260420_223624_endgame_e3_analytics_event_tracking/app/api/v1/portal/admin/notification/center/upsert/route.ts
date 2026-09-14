import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../../services/mock-server/audit-store";
import { upsertNotificationCenterItem } from "../../../../../../../../services/mock-server/notification-store";
import type {
  PortalAdminNotificationCenterUpsertRequest,
  PortalAdminNotificationCenterUpsertResponse,
} from "../../../../../../../../types/portal-notification-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminNotificationCenterUpsertRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      !body.code ||
      (body.channel !== "banner" &&
        body.channel !== "inbox" &&
        body.channel !== "announcement") ||
      (body.surface !== "home" && body.surface !== "launcher") ||
      (body.audience !== "public" &&
        body.audience !== "member" &&
        body.audience !== "operator") ||
      !body.title ||
      !body.body ||
      (body.tone !== "info" &&
        body.tone !== "warning" &&
        body.tone !== "success") ||
      typeof body.priority !== "number" ||
      (body.visibility !== "visible" && body.visibility !== "hidden") ||
      typeof body.ackRequired !== "boolean" ||
      typeof body.dismissible !== "boolean"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_NOTIFICATION_CENTER_UPSERT_REQUEST",
          "The admin notification center upsert request payload is incomplete.",
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

    const item = upsertNotificationCenterItem({
      code: body.code,
      channel: body.channel,
      surface: body.surface,
      audience: body.audience,
      title: body.title,
      body: body.body,
      href: body.href,
      tone: body.tone,
      priority: body.priority,
      visibility: body.visibility,
      ackRequired: body.ackRequired,
      dismissible: body.dismissible,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "notification_center_upsert",
      session: body.session,
      targetCode: item.code,
      summary: `Saved notification item: ${item.code} -> ${item.surface}/${item.channel}`,
    });

    const response: PortalAdminNotificationCenterUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_NOTIFICATION_CENTER_UPSERT_PARSE_ERROR",
        "The admin notification center upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
