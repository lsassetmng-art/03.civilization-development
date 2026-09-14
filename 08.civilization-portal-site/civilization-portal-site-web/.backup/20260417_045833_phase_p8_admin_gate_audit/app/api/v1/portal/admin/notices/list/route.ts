import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { listAdminNotices } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalAdminNoticesListRequest,
  PortalAdminNoticesListResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminNoticesListRequest>;

    if (body.scope !== "admin") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_NOTICES_LIST_REQUEST",
          "The admin notices list request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalAdminNoticesListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminNotices(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_NOTICES_LIST_PARSE_ERROR",
        "The admin notices list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
