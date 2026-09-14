import { NextResponse } from "next/server";
import { findOsByCode } from "../../../../../../mocks/os/catalog";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../services/mock-server/api-meta";
import { buildPortalLaunchEvaluateData } from "../../../../../../services/mock-server/launch-mock";
import type {
  PortalLaunchEvaluateRequest,
  PortalLaunchEvaluateResponse,
} from "../../../../../../types/portal-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalLaunchEvaluateRequest>;

    if (
      !body.requestedOsCode ||
      !body.requestSource ||
      !body.session
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_LAUNCH_EVALUATE_REQUEST",
          "The launch evaluate request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    if (!findOsByCode(body.requestedOsCode)) {
      return NextResponse.json(
        createPortalErrorBody(
          "UNKNOWN_OS_CODE",
          "The requested OS code does not exist.",
          { requestedOsCode: body.requestedOsCode },
        ),
        { status: 404 },
      );
    }

    const response: PortalLaunchEvaluateResponse = {
      meta: createPortalApiMeta(true),
      data: buildPortalLaunchEvaluateData(
        body.requestedOsCode,
        body.session,
      ),
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "LAUNCH_EVALUATE_PARSE_ERROR",
        "The launch evaluate request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
