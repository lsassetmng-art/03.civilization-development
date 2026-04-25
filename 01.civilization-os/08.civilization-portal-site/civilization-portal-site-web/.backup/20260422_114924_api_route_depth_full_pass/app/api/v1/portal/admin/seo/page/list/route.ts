import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { listAdminSeoPages } from "../../../../../../../../services/mock-server/seo-store";
import type {
  PortalAdminSeoPageListRequest,
  PortalAdminSeoPageListResponse,
} from "../../../../../../../../types/portal-seo-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminSeoPageListRequest>;

    if (body.scope !== "admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_SEO_PAGE_LIST_REQUEST",
          "The admin SEO page list request payload is incomplete.",
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

    const response: PortalAdminSeoPageListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminSeoPages(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_SEO_PAGE_LIST_PARSE_ERROR",
        "The admin SEO page list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
