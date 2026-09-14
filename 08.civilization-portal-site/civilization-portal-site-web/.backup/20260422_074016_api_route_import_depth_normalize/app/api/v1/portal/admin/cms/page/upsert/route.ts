import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../../services/mock-server/audit-store";
import { upsertCmsPage } from "../../../../../../../../services/mock-server/cms-store";
import type {
  PortalAdminCmsPageUpsertRequest,
  PortalAdminCmsPageUpsertResponse,
} from "../../../../../../../../types/portal-cms-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminCmsPageUpsertRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      (body.pageCode !== "home" &&
        body.pageCode !== "civilization" &&
        body.pageCode !== "guide") ||
      !body.eyebrow ||
      !body.title ||
      !body.description ||
      !Array.isArray(body.sections)
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_CMS_PAGE_UPSERT_REQUEST",
          "The admin CMS page upsert request payload is incomplete.",
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

    const item = upsertCmsPage({
      pageCode: body.pageCode,
      eyebrow: body.eyebrow,
      title: body.title,
      description: body.description,
      sections: body.sections,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "cms_page_upsert",
      session: body.session,
      targetCode: item.pageCode,
      summary: `Saved CMS page document: ${item.pageCode}`,
    });

    const response: PortalAdminCmsPageUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_CMS_PAGE_UPSERT_PARSE_ERROR",
        "The admin CMS page upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
