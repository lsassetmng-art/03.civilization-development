import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../services/mock-server/audit-store";
import { upsertMaintenance } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalAdminMaintenanceUpsertRequest,
  PortalAdminMaintenanceUpsertResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminMaintenanceUpsertRequest>;

    if (
      !body.session ||
      (body.targetType !== "global" && body.targetType !== "os") ||
      !body.targetCode ||
      typeof body.enabled !== "boolean" ||
      !body.title ||
      !body.message
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_MAINTENANCE_UPSERT_REQUEST",
          "The admin maintenance upsert request payload is incomplete.",
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

    const item = upsertMaintenance({
      targetType: body.targetType,
      targetCode: body.targetCode,
      enabled: body.enabled,
      title: body.title,
      message: body.message,
      startAt: body.startAt,
      endAt: body.endAt,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "maintenance_upsert",
      session: body.session,
      targetCode: item.targetCode,
      summary: `Saved maintenance state for ${item.targetCode}. Enabled=${item.enabled ? "true" : "false"}`,
    });

    const response: PortalAdminMaintenanceUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_MAINTENANCE_UPSERT_PARSE_ERROR",
        "The admin maintenance upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
