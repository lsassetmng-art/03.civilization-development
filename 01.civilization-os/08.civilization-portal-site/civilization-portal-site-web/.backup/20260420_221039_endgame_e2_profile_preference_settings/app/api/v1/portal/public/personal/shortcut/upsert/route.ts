import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { upsertSavedShortcut } from "../../../../../../../../services/mock-server/personalization-store";
import type {
  PortalPersonalShortcutUpsertRequest,
  PortalPersonalShortcutUpsertResponse,
} from "../../../../../../../../types/portal-personalization-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPersonalShortcutUpsertRequest>;

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
        body.targetKind !== "search") ||
      typeof body.sortOrder !== "number"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PERSONAL_SHORTCUT_UPSERT_REQUEST",
          "The personal shortcut upsert request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    try {
      const item = upsertSavedShortcut(body.session, {
        code: body.code,
        title: body.title,
        href: body.href,
        targetKind: body.targetKind,
        note: body.note,
        sortOrder: body.sortOrder,
      });

      const response: PortalPersonalShortcutUpsertResponse = {
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
          "PERSONAL_SHORTCUT_ACCESS_DENIED",
          message,
        ),
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PERSONAL_SHORTCUT_UPSERT_PARSE_ERROR",
        "The personal shortcut upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
