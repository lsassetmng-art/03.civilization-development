import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { listPublicNotices } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalPublicNoticesListRequest,
  PortalPublicNoticesListResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicNoticesListRequest>;

    if (body.channel !== "home" && body.channel !== "launcher") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_NOTICES_REQUEST",
          "The public notices request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicNoticesListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listPublicNotices(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_NOTICES_PARSE_ERROR",
        "The public notices request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
