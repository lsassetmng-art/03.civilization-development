import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../../services/mock-server/audit-store";
import { upsertRecommendationRule } from "../../../../../../../../services/mock-server/recommendation-store";
import type {
  PortalAdminRecommendationRuleUpsertRequest,
  PortalAdminRecommendationRuleUpsertResponse,
} from "../../../../../../../../types/portal-recommendation-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalAdminRecommendationRuleUpsertRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      !body.code ||
      (body.anchorPage !== "home" &&
        body.anchorPage !== "search" &&
        body.anchorPage !== "launcher") ||
      (body.targetKind !== "page" &&
        body.targetKind !== "os" &&
        body.targetKind !== "auth" &&
        body.targetKind !== "launcher" &&
        body.targetKind !== "admin") ||
      !body.title ||
      !body.summary ||
      !body.href ||
      (body.audience !== "public" &&
        body.audience !== "member" &&
        body.audience !== "operator") ||
      !Array.isArray(body.keywords) ||
      typeof body.featured !== "boolean" ||
      typeof body.priority !== "number" ||
      (body.visibility !== "visible" &&
        body.visibility !== "hidden")
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_RECOMMENDATION_RULE_UPSERT_REQUEST",
          "The admin recommendation rule upsert request payload is incomplete.",
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

    const item = upsertRecommendationRule({
      code: body.code,
      anchorPage: body.anchorPage,
      targetKind: body.targetKind,
      title: body.title,
      summary: body.summary,
      href: body.href,
      audience: body.audience,
      keywords: body.keywords,
      featured: body.featured,
      priority: body.priority,
      visibility: body.visibility,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "recommendation_rule_upsert",
      session: body.session,
      targetCode: item.code,
      summary: `Saved recommendation rule: ${item.code} -> ${item.href}`,
    });

    const response: PortalAdminRecommendationRuleUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_RECOMMENDATION_RULE_UPSERT_PARSE_ERROR",
        "The admin recommendation rule upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
