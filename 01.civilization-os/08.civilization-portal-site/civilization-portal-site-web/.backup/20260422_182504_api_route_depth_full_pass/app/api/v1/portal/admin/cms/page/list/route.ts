import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { listAdminCmsPages } from "../../../../../../../../services/mock-server/cms-store";
import type {
  PortalAdminCmsPageListRequest,
  PortalAdminCmsPageListResponse,
} from "../../../../../../../../types/portal-cms-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminCmsPageListRequest>;

    if (body.scope !== "admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_CMS_PAGE_LIST_REQUEST",
          "The admin CMS page list request payload is incomplete.",
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

    const response: PortalAdminCmsPageListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminCmsPages(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_CMS_PAGE_LIST_PARSE_ERROR",
        "The admin CMS page list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
