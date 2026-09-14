import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { listAdminSearchIndex } from "../../../../../../../../services/mock-server/search-store";
import type {
  PortalAdminSearchIndexListRequest,
  PortalAdminSearchIndexListResponse,
} from "../../../../../../../../types/portal-search-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminSearchIndexListRequest>;

    if (body.scope !== "admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_SEARCH_INDEX_LIST_REQUEST",
          "The admin search index list request payload is incomplete.",
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

    const response: PortalAdminSearchIndexListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminSearchIndex(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_SEARCH_INDEX_LIST_PARSE_ERROR",
        "The admin search index list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
