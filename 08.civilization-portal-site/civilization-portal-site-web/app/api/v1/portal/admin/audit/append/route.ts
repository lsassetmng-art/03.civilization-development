import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../services/mock-server/audit-store";
import type {
  PortalAdminAuditAppendRequest,
  PortalAdminAuditAppendResponse,
} from "../../../../../../../types/portal-admin-security-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminAuditAppendRequest>;

    if (
      body.area !== "portal-admin" ||
      !body.session ||
      !body.targetCode ||
      !body.summary
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_AUDIT_APPEND_REQUEST",
          "The admin audit append request payload is incomplete.",
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

    const response: PortalAdminAuditAppendResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item: appendAuditLog({
          area: "portal-admin",
          actionType: "audit_note_append",
          session: body.session,
          targetCode: body.targetCode,
          summary: body.summary,
        }),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_AUDIT_APPEND_PARSE_ERROR",
        "The admin audit append request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
