import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { appendRecentAction } from "../../../../../../../../services/mock-server/personalization-store";
import type {
  PortalPersonalRecentAppendRequest,
  PortalPersonalRecentAppendResponse,
} from "../../../../../../../../types/portal-personalization-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPersonalRecentAppendRequest>;

    if (
      !body.session ||
      !body.actionCode ||
      !body.actionLabel ||
      !body.targetCode ||
      !body.targetTitle ||
      !body.targetHref ||
      (body.targetKind !== "page" &&
        body.targetKind !== "os" &&
        body.targetKind !== "auth" &&
        body.targetKind !== "launcher" &&
        body.targetKind !== "admin" &&
        body.targetKind !== "search")
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PERSONAL_RECENT_APPEND_REQUEST",
          "The personal recent append request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    try {
      const item = appendRecentAction(body.session, {
        actionCode: body.actionCode,
        actionLabel: body.actionLabel,
        targetCode: body.targetCode,
        targetTitle: body.targetTitle,
        targetHref: body.targetHref,
        targetKind: body.targetKind,
      });

      const response: PortalPersonalRecentAppendResponse = {
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
          : "A logged-in Civilization session is required.";

      return NextResponse.json(
        createPortalErrorBody(
          "PERSONAL_RECENT_ACCESS_DENIED",
          message,
        ),
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PERSONAL_RECENT_APPEND_PARSE_ERROR",
        "The personal recent append request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
