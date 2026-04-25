import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { listAdminRecommendationRules } from "../../../../../../../../services/mock-server/recommendation-store";
import type {
  PortalAdminRecommendationRuleListRequest,
  PortalAdminRecommendationRuleListResponse,
} from "../../../../../../../../types/portal-recommendation-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalAdminRecommendationRuleListRequest>;

    if (body.scope !== "admin" || !body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_RECOMMENDATION_RULE_LIST_REQUEST",
          "The admin recommendation rule list request payload is incomplete.",
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

    const response: PortalAdminRecommendationRuleListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listAdminRecommendationRules(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_RECOMMENDATION_RULE_LIST_PARSE_ERROR",
        "The admin recommendation rule list request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
