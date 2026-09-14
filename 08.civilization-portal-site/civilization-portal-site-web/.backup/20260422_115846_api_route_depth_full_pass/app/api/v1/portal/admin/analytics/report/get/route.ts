import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { getAnalyticsReport } from "../../../../../../../../services/mock-server/analytics-store";
import type {
  PortalAdminAnalyticsReportGetRequest,
  PortalAdminAnalyticsReportGetResponse,
} from "../../../../../../../../types/portal-analytics-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminAnalyticsReportGetRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      typeof body.rangeDays !== "number" ||
      typeof body.limit !== "number"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_ANALYTICS_REPORT_GET_REQUEST",
          "The admin analytics report get request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const access = evaluatePortalAdminAccess(body.session);
    if (!access.allowed) {
      return NextResponse.json(
        createPortalErrorBody(
          "ADMIN_ACCESS_DENIED",
          access.reason,
        ),
        { status: 403 },
      );
    }

    const response: PortalAdminAnalyticsReportGetResponse = {
      meta: createPortalApiMeta(true),
      data: getAnalyticsReport({
        rangeDays: body.rangeDays,
        limit: body.limit,
      }),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_ANALYTICS_REPORT_GET_PARSE_ERROR",
        "The admin analytics report get request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
