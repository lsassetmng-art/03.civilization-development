import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../services/mock-server/admin-access";
import { listAdminMaintenance } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalAdminMaintenanceListRequest,
  PortalAdminMaintenanceListResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminMaintenanceListRequest>;

    if (body.scope !== "admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_MAINTENANCE_LIST_REQUEST",
          "The admin maintenance list request payload is incomplete.",
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

    const response: PortalAdminMaintenanceListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminMaintenance(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_MAINTENANCE_LIST_PARSE_ERROR",
        "The admin maintenance list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
