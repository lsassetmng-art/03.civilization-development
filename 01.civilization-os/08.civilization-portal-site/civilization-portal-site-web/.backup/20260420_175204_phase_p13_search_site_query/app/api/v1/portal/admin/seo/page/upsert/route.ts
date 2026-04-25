import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../../services/mock-server/audit-store";
import { upsertSeoPage } from "../../../../../../../../services/mock-server/seo-store";
import type {
  PortalAdminSeoPageUpsertRequest,
  PortalAdminSeoPageUpsertResponse,
} from "../../../../../../../../types/portal-seo-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminSeoPageUpsertRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      (body.pageCode !== "home" &&
        body.pageCode !== "civilization" &&
        body.pageCode !== "guide") ||
      !body.pageTitle ||
      !body.metaDescription ||
      !body.canonicalPath ||
      typeof body.robotsIndex !== "boolean" ||
      typeof body.robotsFollow !== "boolean" ||
      !body.ogTitle ||
      !body.ogDescription ||
      (body.structuredType !== "WebPage" &&
        body.structuredType !== "AboutPage" &&
        body.structuredType !== "HowToPage") ||
      !body.structuredName ||
      !body.structuredDescription
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_SEO_PAGE_UPSERT_REQUEST",
          "The admin SEO page upsert request payload is incomplete.",
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

    const item = upsertSeoPage({
      pageCode: body.pageCode,
      pageTitle: body.pageTitle,
      metaDescription: body.metaDescription,
      canonicalPath: body.canonicalPath,
      robotsIndex: body.robotsIndex,
      robotsFollow: body.robotsFollow,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      ogImageAssetCode: body.ogImageAssetCode,
      structuredType: body.structuredType,
      structuredName: body.structuredName,
      structuredDescription: body.structuredDescription,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "seo_page_upsert",
      session: body.session,
      targetCode: item.pageCode,
      summary: `Saved SEO descriptor: ${item.pageCode}`,
    });

    const response: PortalAdminSeoPageUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_SEO_PAGE_UPSERT_PARSE_ERROR",
        "The admin SEO page upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
