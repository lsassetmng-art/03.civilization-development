import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { getPublicSeoPage } from "../../../../../../../../services/mock-server/seo-store";
import type {
  PortalPublicSeoPageGetRequest,
  PortalPublicSeoPageGetResponse,
} from "../../../../../../../../types/portal-seo-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicSeoPageGetRequest>;

    if (
      body.pageCode !== "home" &&
      body.pageCode !== "civilization" &&
      body.pageCode !== "guide"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_SEO_PAGE_GET_REQUEST",
          "The public SEO page request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const item = getPublicSeoPage(body.pageCode);
    if (!item) {
      return NextResponse.json(
        createPortalErrorBody(
          "SEO_PAGE_NOT_FOUND",
          "The requested SEO page does not exist.",
        ),
        { status: 404 },
      );
    }

    const response: PortalPublicSeoPageGetResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_SEO_PAGE_GET_PARSE_ERROR",
        "The public SEO page request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
