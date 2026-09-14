import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { resolvePublicRecommendations } from "../../../../../../../services/mock-server/recommendation-store";
import type {
  PortalPublicRecommendationResolveRequest,
  PortalPublicRecommendationResolveResponse,
} from "../../../../../../../types/portal-recommendation-api";

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as Partial<PortalPublicRecommendationResolveRequest>;

    if (
      (body.anchorPage !== "home" &&
        body.anchorPage !== "search" &&
        body.anchorPage !== "launcher") ||
      !body.session ||
      typeof body.limit !== "number"
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_RECOMMENDATION_RESOLVE_REQUEST",
          "The public recommendation resolve request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicRecommendationResolveResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: resolvePublicRecommendations({
          anchorPage: body.anchorPage,
          query: body.query,
          session: body.session,
          limit: body.limit,
        }),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_RECOMMENDATION_RESOLVE_PARSE_ERROR",
        "The public recommendation resolve request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
