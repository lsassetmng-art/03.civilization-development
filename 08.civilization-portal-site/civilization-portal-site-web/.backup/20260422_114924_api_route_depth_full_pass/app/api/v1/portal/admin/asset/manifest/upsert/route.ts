import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../../services/mock-server/audit-store";
import { upsertAsset } from "../../../../../../../../services/mock-server/asset-store";
import type {
  PortalAdminAssetManifestUpsertRequest,
  PortalAdminAssetManifestUpsertResponse,
} from "../../../../../../../../types/portal-asset-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalAdminAssetManifestUpsertRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      !body.code ||
      (body.kind !== "image" && body.kind !== "file") ||
      !body.title ||
      !body.description ||
      !body.sourceUrl ||
      (body.visibility !== "public" && body.visibility !== "admin") ||
      body.usageScope !== "cms" ||
      typeof body.sortOrder !== "number"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_ASSET_MANIFEST_UPSERT_REQUEST",
          "The admin asset manifest upsert request payload is incomplete.",
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

    const item = upsertAsset({
      code: body.code,
      kind: body.kind,
      title: body.title,
      description: body.description,
      sourceUrl: body.sourceUrl,
      altText: body.altText,
      fileLabel: body.fileLabel,
      mimeType: body.mimeType,
      visibility: body.visibility,
      usageScope: body.usageScope,
      sortOrder: body.sortOrder,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "asset_manifest_upsert",
      session: body.session,
      targetCode: item.code,
      summary: `Saved asset manifest: ${item.code} -> ${item.sourceUrl}`,
    });

    const response: PortalAdminAssetManifestUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_ASSET_MANIFEST_UPSERT_PARSE_ERROR",
        "The admin asset manifest upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
