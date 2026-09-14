import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { getPersonalEntries } from "../../../../../../../../services/mock-server/personalization-store";
import type {
  PortalPersonalEntriesGetRequest,
  PortalPersonalEntriesGetResponse,
} from "../../../../../../../../types/portal-personalization-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPersonalEntriesGetRequest>;

    if (!body.session || typeof body.limit !== "number") {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PERSONAL_ENTRIES_GET_REQUEST",
          "The personal entries get request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    try {
      const data = getPersonalEntries(body.session, body.limit);

      const response: PortalPersonalEntriesGetResponse = {
        meta: createPortalApiMeta(true),
        data,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "A logged-in Civilization session is required.";

      return NextResponse.json(
        createPortalErrorBody(
          "PERSONAL_ENTRIES_ACCESS_DENIED",
          message,
        ),
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PERSONAL_ENTRIES_GET_PARSE_ERROR",
        "The personal entries get request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
