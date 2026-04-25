import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { submitSupportContact } from "../../../../../../../../services/mock-server/support-store";
import type {
  PortalPublicSupportContactSubmitRequest,
  PortalPublicSupportContactSubmitResponse,
} from "../../../../../../../../types/portal-support-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicSupportContactSubmitRequest>;

    if (
      !body.session ||
      (body.category !== "general" &&
        body.category !== "policy" &&
        body.category !== "technical" &&
        body.category !== "account") ||
      !body.subject ||
      !body.body
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_SUPPORT_CONTACT_SUBMIT_REQUEST",
          "The public support contact submit request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    const item = submitSupportContact({
      session: body.session,
      category: body.category,
      subject: body.subject,
      body: body.body,
      replyEmail: body.replyEmail,
    });

    const response: PortalPublicSupportContactSubmitResponse = {
      meta: createPortalApiMeta(true),
      data: {
        item,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_SUPPORT_CONTACT_SUBMIT_PARSE_ERROR",
        "The public support contact submit request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
