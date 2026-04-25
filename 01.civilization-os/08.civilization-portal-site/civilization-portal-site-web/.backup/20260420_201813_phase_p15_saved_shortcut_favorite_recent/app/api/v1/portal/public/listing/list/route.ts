import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../services/mock-server/api-meta";
import { listPublicListings } from "../../../../../../../services/mock-server/admin-store";
import type {
  PortalPublicListingListRequest,
  PortalPublicListingListResponse,
} from "../../../../../../../types/portal-admin-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicListingListRequest>;

    if (body.catalog !== "os") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_LISTING_REQUEST",
          "The public listing request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const response: PortalPublicListingListResponse = {
      meta: createPortalApiMeta(true),
      data: {
        items: listPublicListings(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_LISTING_PARSE_ERROR",
        "The public listing request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
