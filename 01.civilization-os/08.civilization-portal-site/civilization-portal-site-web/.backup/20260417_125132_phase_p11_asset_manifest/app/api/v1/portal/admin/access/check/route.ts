import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../services/mock-server/admin-access";
import type {
  PortalAdminAccessCheckRequest,
  PortalAdminAccessCheckResponse,
} from "../../../../../../../types/portal-admin-security-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminAccessCheckRequest>;

    if (body.area !== "portal-admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_ACCESS_CHECK_REQUEST",
          "The admin access check request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalAdminAccessCheckResponse = {
      meta: createPortalApiMeta(true),
      data: evaluatePortalAdminAccess(body.session),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_ACCESS_CHECK_PARSE_ERROR",
        "The admin access check request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
