import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { upsertFavoriteEntry } from "../../../../../../../../services/mock-server/personalization-store";
import type {
  PortalPersonalFavoriteUpsertRequest,
  PortalPersonalFavoriteUpsertResponse,
} from "../../../../../../../../types/portal-personalization-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPersonalFavoriteUpsertRequest>;

    if (
      !body.session ||
      !body.code ||
      !body.title ||
      !body.href ||
      (body.targetKind !== "page" &&
        body.targetKind !== "os" &&
        body.targetKind !== "auth" &&
        body.targetKind !== "launcher" &&
        body.targetKind !== "admin" &&
        body.targetKind !== "search")
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PERSONAL_FAVORITE_UPSERT_REQUEST",
          "The personal favorite upsert request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    try {
      const item = upsertFavoriteEntry(body.session, {
        code: body.code,
        title: body.title,
        href: body.href,
        targetKind: body.targetKind,
        reason: body.reason,
      });

      const response: PortalPersonalFavoriteUpsertResponse = {
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
          "PERSONAL_FAVORITE_ACCESS_DENIED",
          message,
        ),
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PERSONAL_FAVORITE_UPSERT_PARSE_ERROR",
        "The personal favorite upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
