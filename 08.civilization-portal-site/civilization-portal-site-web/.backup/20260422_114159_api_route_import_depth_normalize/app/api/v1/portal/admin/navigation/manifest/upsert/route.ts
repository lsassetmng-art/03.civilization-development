import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../../services/mock-server/audit-store";
import { upsertNavigationManifest } from "../../../../../../../../services/mock-server/navigation-store";
import type {
  PortalAdminNavigationManifestUpsertRequest,
  PortalAdminNavigationManifestUpsertResponse,
} from "../../../../../../../../types/portal-navigation-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalAdminNavigationManifestUpsertRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      !body.code ||
      !body.title ||
      !body.href ||
      !body.description ||
      (body.placement !== "header" &&
        body.placement !== "footer" &&
        body.placement !== "launcher" &&
        body.placement !== "admin") ||
      (body.audience !== "public" &&
        body.audience !== "member" &&
        body.audience !== "operator") ||
      (body.visibility !== "visible" &&
        body.visibility !== "hidden") ||
      typeof body.sortOrder !== "number" ||
      typeof body.requiresLogin !== "boolean" ||
      typeof body.operatorOnly !== "boolean"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_NAVIGATION_MANIFEST_UPSERT_REQUEST",
          "The admin navigation manifest upsert request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const access = evaluatePortalAdminAccess(body.session);
    if (!access.allowed) {
      return NextResponse.json(
        createPortalErrorBody("ADMIN_ACCESS_DENIED", access.reason),
        { status: 403 },
      );
    }

    const item = upsertNavigationManifest({
      code: body.code,
      title: body.title,
      href: body.href,
      placement: body.placement,
      audience: body.audience,
      visibility: body.visibility,
      sortOrder: body.sortOrder,
      description: body.description,
      requiresLogin: body.requiresLogin,
      operatorOnly: body.operatorOnly,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "navigation_manifest_upsert",
      session: body.session,
      targetCode: item.code,
      summary: `Saved navigation manifest: ${item.code} -> ${item.href}`,
    });

    const response: PortalAdminNavigationManifestUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_NAVIGATION_MANIFEST_UPSERT_PARSE_ERROR",
        "The admin navigation manifest upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
