import { NextResponse } from "next/server";
import { findOsByCode } from "../../../../../../mocks/os/catalog";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../services/mock-server/api-meta";
import { buildPortalLaunchMatrixData } from "../../../../../../services/mock-server/launch-mock";
import type {
  PortalLaunchMatrixRequest,
  PortalLaunchMatrixResponse,
} from "../../../../../../types/portal-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalLaunchMatrixRequest>;

    if (
      body.requestSource !== "launcher" ||
      !Array.isArray(body.requestedOsCodes) ||
      body.requestedOsCodes.length === 0 ||
      !body.session
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_LAUNCH_MATRIX_REQUEST",
          "The launch matrix request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const unknown = body.requestedOsCodes.filter((code) => !findOsByCode(code));
    if (unknown.length > 0) {
      return NextResponse.json(
        createPortalErrorBody(
          "UNKNOWN_OS_CODE",
          "One or more requested OS codes do not exist.",
          { requestedOsCodes: unknown.join(",") },
        ),
        { status: 404 },
      );
    }

    const response: PortalLaunchMatrixResponse = {
      meta: createPortalApiMeta(true),
      data: buildPortalLaunchMatrixData(
        body.requestedOsCodes,
        body.session,
      ),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "LAUNCH_MATRIX_PARSE_ERROR",
        "The launch matrix request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
