import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { resolvePublicMenuItems } from "../../../../../../../../services/mock-server/navigation-store";
import type {
  PortalPublicMenuResolveRequest,
  PortalPublicMenuResolveResponse,
} from "../../../../../../../../types/portal-navigation-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalPublicMenuResolveRequest>;

    if (
      (body.placement !== "header" && body.placement !== "footer") ||
      !body.session
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_MENU_RESOLVE_REQUEST",
          "The public menu resolve request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicMenuResolveResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: resolvePublicMenuItems(body.placement, body.session),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_MENU_RESOLVE_PARSE_ERROR",
        "The public menu resolve request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
