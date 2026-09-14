import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { appendAnalyticsEvent } from "../../../../../../../../services/mock-server/analytics-store";
import type {
  PortalPublicAnalyticsEventAppendRequest,
  PortalPublicAnalyticsEventAppendResponse,
} from "../../../../../../../../types/portal-analytics-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicAnalyticsEventAppendRequest>;

    if (
      !body.session ||
      (body.surface !== "home" &&
        body.surface !== "search" &&
        body.surface !== "launcher" &&
        body.surface !== "os-detail" &&
        body.surface !== "admin") ||
      (body.action !== "page_view" &&
        body.action !== "search_query" &&
        body.action !== "open_target" &&
        body.action !== "save_shortcut" &&
        body.action !== "save_favorite" &&
        body.action !== "ack_announcement" &&
        body.action !== "save_profile_settings") ||
      !body.targetCode ||
      !body.targetTitle ||
      (body.targetKind !== "page" &&
        body.targetKind !== "os" &&
        body.targetKind !== "auth" &&
        body.targetKind !== "launcher" &&
        body.targetKind !== "admin" &&
        body.targetKind !== "search")
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_ANALYTICS_EVENT_APPEND_REQUEST",
          "The public analytics event append request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const item = appendAnalyticsEvent({
      session: body.session,
      surface: body.surface,
      action: body.action,
      targetCode: body.targetCode,
      targetTitle: body.targetTitle,
      targetKind: body.targetKind,
      metadata: body.metadata,
    });

    const response: PortalPublicAnalyticsEventAppendResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_ANALYTICS_EVENT_APPEND_PARSE_ERROR",
        "The public analytics event append request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
