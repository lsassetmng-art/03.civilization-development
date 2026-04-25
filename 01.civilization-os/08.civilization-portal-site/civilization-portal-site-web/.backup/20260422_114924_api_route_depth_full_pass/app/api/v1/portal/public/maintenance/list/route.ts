import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { listPublicMaintenance } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalPublicMaintenanceListRequest,
  PortalPublicMaintenanceListResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicMaintenanceListRequest>;

    if (body.targetScope !== "portal" && body.targetScope !== "all") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_MAINTENANCE_REQUEST",
          "The public maintenance request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const items = listPublicMaintenance();
    const filtered =
      body.targetScope === "portal"
        ? items.filter(
            (item) =>
              (item.targetType === "global" && item.targetCode === "portal") ||
              (item.targetType === "os"),
          )
        : items;

    const response: PortalPublicMaintenanceListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: filtered,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_MAINTENANCE_PARSE_ERROR",
        "The public maintenance request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
