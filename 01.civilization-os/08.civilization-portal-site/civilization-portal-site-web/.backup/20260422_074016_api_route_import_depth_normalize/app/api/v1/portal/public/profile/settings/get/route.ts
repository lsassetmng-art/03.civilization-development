import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { getProfileSettings } from "../../../../../../../../services/mock-server/profile-settings-store";
import type {
  PortalPublicProfileSettingsGetRequest,
  PortalPublicProfileSettingsGetResponse,
} from "../../../../../../../../types/portal-profile-settings-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicProfileSettingsGetRequest>;

    if (!body.session) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_PROFILE_SETTINGS_GET_REQUEST",
          "The public profile settings get request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    try {
      const data = getProfileSettings(body.session);

      const response: PortalPublicProfileSettingsGetResponse = {
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
          "PUBLIC_PROFILE_SETTINGS_GET_DENIED",
          message,
        ),
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_PROFILE_SETTINGS_GET_PARSE_ERROR",
        "The public profile settings get request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
