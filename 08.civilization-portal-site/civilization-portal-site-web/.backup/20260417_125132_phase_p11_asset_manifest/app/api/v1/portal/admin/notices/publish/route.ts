import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../services/mock-server/audit-store";
import { publishAdminNotice } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalAdminNoticePublishRequest,
  PortalAdminNoticePublishResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminNoticePublishRequest>;

    if (
      !body.session ||
      !body.title ||
      !body.summary ||
      !body.publishedOn ||
      (body.level !== "info" &&
        body.level !== "warning" &&
        body.level !== "maintenance") ||
      (body.visibility !== "public" && body.visibility !== "admin")
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_NOTICE_PUBLISH_REQUEST",
          "The admin notice publish request payload is incomplete.",
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

    const item = publishAdminNotice({
      title: body.title,
      summary: body.summary,
      level: body.level,
      visibility: body.visibility,
      publishedOn: body.publishedOn,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "notice_publish",
      session: body.session,
      targetCode: item.slug,
      summary: `Published notice: ${item.title}`,
    });

    const response: PortalAdminNoticePublishResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_NOTICE_PUBLISH_PARSE_ERROR",
        "The admin notice publish request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
