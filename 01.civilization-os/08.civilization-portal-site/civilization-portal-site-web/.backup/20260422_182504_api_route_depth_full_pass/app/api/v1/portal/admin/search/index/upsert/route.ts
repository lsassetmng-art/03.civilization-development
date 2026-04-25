import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { evaluatePortalAdminAccess } from "../../../../../../../../services/mock-server/admin-access";
import { appendAuditLog } from "../../../../../../../../services/mock-server/audit-store";
import { upsertSearchIndex } from "../../../../../../../../services/mock-server/search-store";
import type {
  PortalAdminSearchIndexUpsertRequest,
  PortalAdminSearchIndexUpsertResponse,
} from "../../../../../../../../types/portal-search-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalAdminSearchIndexUpsertRequest>;

    if (
      body.scope !== "admin" ||
      !body.session ||
      !body.code ||
      (body.kind !== "page" &&
        body.kind !== "os" &&
        body.kind !== "auth" &&
        body.kind !== "launcher" &&
        body.kind !== "admin") ||
      !body.title ||
      !body.summary ||
      !body.href ||
      !Array.isArray(body.keywords) ||
      (body.visibility !== "public" && body.visibility !== "admin") ||
      typeof body.sortOrder !== "number"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_ADMIN_SEARCH_INDEX_UPSERT_REQUEST",
          "The admin search index upsert request payload is incomplete.",
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

    const item = upsertSearchIndex({
      code: body.code,
      kind: body.kind,
      title: body.title,
      summary: body.summary,
      href: body.href,
      keywords: body.keywords,
      visibility: body.visibility,
      sortOrder: body.sortOrder,
    });

    appendAuditLog({
      area: "portal-admin",
      actionType: "search_index_upsert",
      session: body.session,
      targetCode: item.code,
      summary: `Saved search index item: ${item.code} -> ${item.href}`,
    });

    const response: PortalAdminSearchIndexUpsertResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "ADMIN_SEARCH_INDEX_UPSERT_PARSE_ERROR",
        "The admin search index upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
