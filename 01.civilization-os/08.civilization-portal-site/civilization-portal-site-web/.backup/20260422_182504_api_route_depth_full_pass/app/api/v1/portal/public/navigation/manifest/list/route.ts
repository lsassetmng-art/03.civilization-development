import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { listPublicNavigationManifest } from "../../../../../../../../services/mock-server/navigation-store";
import type {
  PortalPublicNavigationManifestListRequest,
  PortalPublicNavigationManifestListResponse,
} from "../../../../../../../../types/portal-navigation-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalPublicNavigationManifestListRequest>;

    if (
      body.placement !== "all" &&
      body.placement !== "header" &&
      body.placement !== "footer" &&
      body.placement !== "launcher" &&
      body.placement !== "admin"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_NAVIGATION_MANIFEST_LIST_REQUEST",
          "The public navigation manifest request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicNavigationManifestListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listPublicNavigationManifest(body.placement),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_NAVIGATION_MANIFEST_PARSE_ERROR",
        "The public navigation manifest request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
