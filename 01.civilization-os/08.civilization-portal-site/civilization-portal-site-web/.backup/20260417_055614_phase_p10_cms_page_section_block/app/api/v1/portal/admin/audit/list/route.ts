import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../services/mock-server/admin-access";
import { listAuditLogs } from "../../../../../../../services/mock-server/audit-store";
import type {
  PortalAdminAuditListRequest,
  PortalAdminAuditListResponse,
} from "../../../../../../../types/portal-admin-security-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminAuditListRequest>;

    if (body.area !== "portal-admin" || !body.session || typeof body.limit !== "number") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_AUDIT_LIST_REQUEST",
          "The admin audit list request payload is incomplete.",
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

    const response: PortalAdminAuditListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAuditLogs("portal-admin", body.limit),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_AUDIT_LIST_PARSE_ERROR",
        "The admin audit list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
