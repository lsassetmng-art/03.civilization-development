import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../services/mock-server/audit-store";
import { upsertListing } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalAdminListingUpsertRequest,
  PortalAdminListingUpsertResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminListingUpsertRequest>;

    if (
      !body.session ||
      !body.osCode ||
      (body.visibility !== "listed" &&
        body.visibility !== "hidden" &&
        body.visibility !== "featured-only") ||
      typeof body.featured !== "boolean" ||
      typeof body.sortOrder !== "number"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_LISTING_UPSERT_REQUEST",
          "The admin listing upsert request payload is incomplete.",
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

    const item = upsertListing({
      osCode: body.osCode,
      visibility: body.visibility,
      featured: body.featured,
      badge: body.badge,
      sortOrder: body.sortOrder,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "listing_upsert",
      session: body.session,
      targetCode: item.osCode,
      summary: `Saved listing for ${item.osCode}. Visibility=${item.visibility}`,
    });

    const response: PortalAdminListingUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The admin listing upsert request could not be completed.";

    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_LISTING_UPSERT_PARSE_ERROR",
        message,
      ),
      { status: 400 },
    );
  }
}
