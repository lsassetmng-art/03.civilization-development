import { NextResponse } from "next/server";
import { createPortalApiMeta, createPortalErrorBody } from "../../../../../../../../services/mock-server/api-meta";
import { upsertProfileSettings } from "../../../../../../../../services/mock-server/profile-settings-store";
import type {
  PortalPublicProfileSettingsUpsertRequest,
  PortalPublicProfileSettingsUpsertResponse,
} from "../../../../../../../../types/portal-profile-settings-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<PortalPublicProfileSettingsUpsertRequest>;

    if (
      !body.session ||
      !body.profile ||
      !body.preferences ||
      !body.settings ||
      typeof body.profile.displayName !== "string" ||
      typeof body.profile.region !== "string" ||
      (body.profile.preferredLanguage !== "ja" &&
        body.profile.preferredLanguage !== "en") ||
      (body.profile.preferredCurrency !== "JPY" &&
        body.profile.preferredCurrency !== "USD") ||
      (body.preferences.homeSurface !== "recommended" &&
        body.preferences.homeSurface !== "catalog" &&
        body.preferences.homeSurface !== "search") ||
      (body.preferences.launcherLayout !== "comfortable" &&
        body.preferences.launcherLayout !== "compact") ||
      (body.preferences.recommendationMode !== "balanced" &&
        body.preferences.recommendationMode !== "featured" &&
        body.preferences.recommendationMode !== "recent") ||
      typeof body.preferences.saveRecentActions !== "boolean" ||
      typeof body.preferences.pinLauncherShortcut !== "boolean" ||
      (body.settings.themeMode !== "system" &&
        body.settings.themeMode !== "light" &&
        body.settings.themeMode !== "dark") ||
      (body.settings.cardDensity !== "comfortable" &&
        body.settings.cardDensity !== "compact") ||
      (body.settings.startPage !== "home" &&
        body.settings.startPage !== "search" &&
        body.settings.startPage !== "launcher")
    ) {
      return NextResponse.json(
        createPortalErrorBody(
          "INVALID_PUBLIC_PROFILE_SETTINGS_UPSERT_REQUEST",
          "The public profile settings upsert request payload is incomplete.",
        ),
        { status: 400 },
      );
    }

    try {
      const data = upsertProfileSettings(body.session, {
        profile: body.profile,
        preferences: body.preferences,
        settings: body.settings,
      });

      const response: PortalPublicProfileSettingsUpsertResponse = {
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
          "PUBLIC_PROFILE_SETTINGS_UPSERT_DENIED",
          message,
        ),
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      createPortalErrorBody(
        "PUBLIC_PROFILE_SETTINGS_UPSERT_PARSE_ERROR",
        "The public profile settings upsert request body could not be parsed.",
      ),
      { status: 400 },
    );
  }
}
