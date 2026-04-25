import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { upsertMaintenance } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalAdminMaintenanceUpsertRequest,
  PortalAdminMaintenanceUpsertResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminMaintenanceUpsertRequest>;

    if (
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

    const response: PortalAdminMaintenanceUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item: upsertMaintenance({
          targetType: body.targetType,
          targetCode: body.targetCode,
          enabled: body.enabled,
          title: body.title,
          message: body.message,
          startAt: body.startAt,
          endAt: body.endAt,
        }),
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
