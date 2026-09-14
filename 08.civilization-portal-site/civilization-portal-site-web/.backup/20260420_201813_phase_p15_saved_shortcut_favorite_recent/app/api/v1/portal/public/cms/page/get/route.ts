import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { getPublicCmsPage } from "../../../../../../../../services/mock-server/cms-store";
import type {
  PortalPublicCmsPageGetRequest,
  PortalPublicCmsPageGetResponse,
} from "../../../../../../../../types/portal-cms-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicCmsPageGetRequest>;

    if (
      body.pageCode !== "home" &&
      body.pageCode !== "civilization" &&
      body.pageCode !== "guide"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_CMS_PAGE_GET_REQUEST",
          "The public CMS page request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const item = getPublicCmsPage(body.pageCode);
    if (!item) {
      return NextResponse.json(
        createPortalErrorBody(
          "CMS_PAGE_NOT_FOUND",
          "The requested CMS page does not exist.",
        ),
        { status: 404 },
      );
    }

    const response: PortalPublicCmsPageGetResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_CMS_PAGE_GET_PARSE_ERROR",
        "The public CMS page request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
