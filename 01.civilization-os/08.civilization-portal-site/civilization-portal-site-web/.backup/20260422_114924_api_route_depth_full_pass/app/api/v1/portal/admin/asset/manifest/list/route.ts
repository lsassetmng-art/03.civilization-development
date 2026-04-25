import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { listAdminAssets } from "../../../../../../../../services/mock-server/asset-store";
import type {
  PortalAdminAssetManifestListRequest,
  PortalAdminAssetManifestListResponse,
} from "../../../../../../../../types/portal-asset-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalAdminAssetManifestListRequest>;

    if (body.scope !== "admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_ASSET_MANIFEST_LIST_REQUEST",
          "The admin asset manifest list request payload is incomplete.",
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

    const response: PortalAdminAssetManifestListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminAssets(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_ASSET_MANIFEST_LIST_PARSE_ERROR",
        "The admin asset manifest list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
