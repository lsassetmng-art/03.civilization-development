import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { listPublicAssets } from "../../../../../../../../services/mock-server/asset-store";
import type {
  PortalPublicAssetManifestListRequest,
  PortalPublicAssetManifestListResponse,
} from "../../../../../../../../types/portal-asset-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalPublicAssetManifestListRequest>;

    if (body.usageScope !== "cms") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_ASSET_MANIFEST_LIST_REQUEST",
          "The public asset manifest request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicAssetManifestListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listPublicAssets("cms"),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_ASSET_MANIFEST_PARSE_ERROR",
        "The public asset manifest request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
