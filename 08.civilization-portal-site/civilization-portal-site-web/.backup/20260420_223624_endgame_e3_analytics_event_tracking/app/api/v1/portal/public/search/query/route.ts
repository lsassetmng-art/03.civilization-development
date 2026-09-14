import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { queryPublicSearchIndex } from "../../../../../../../../services/mock-server/search-store";
import type {
  PortalPublicSearchQueryRequest,
  PortalPublicSearchQueryResponse,
} from "../../../../../../../../types/portal-search-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicSearchQueryRequest>;

    if (typeof body.query !== "string" || typeof body.limit !== "number") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_SEARCH_QUERY_REQUEST",
          "The public search query request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const responseData = queryPublicSearchIndex(body.query, body.limit);

    const response: PortalPublicSearchQueryResponse = {
      meta: createPortalApiMeta(true),
      data: responseData,
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_SEARCH_QUERY_PARSE_ERROR",
        "The public search query request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
