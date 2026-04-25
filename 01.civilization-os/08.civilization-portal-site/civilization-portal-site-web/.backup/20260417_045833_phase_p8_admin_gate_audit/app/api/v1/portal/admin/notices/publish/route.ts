import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { publishAdminNotice } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalAdminNoticePublishRequest,
  PortalAdminNoticePublishResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminNoticePublishRequest>;

    if (
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

    const response: PortalAdminNoticePublishResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item: publishAdminNotice({
          title: body.title,
          summary: body.summary,
          level: body.level,
          visibility: body.visibility,
          publishedOn: body.publishedOn,
        }),
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
