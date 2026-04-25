import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalUserPreferenceState,
  PortalUserProfileState,
  PortalUserSettingsState,
} from "../../types/portal-profile-settings-api";

type PortalStoredProfileSettings = {
  profile: PortalUserProfileState;
  preferences: PortalUserPreferenceState;
  settings: PortalUserSettingsState;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const profileSettingsByUser = new Map<string, PortalStoredProfileSettings>();

const requireUserKey = (session: PortalSessionSummary): string => {
  if (!session.isLoggedIn || !session.civilizationUserId) {
    throw new Error("A logged-in Civilization session is required.");
  }
  return session.civilizationUserId;
};

const defaultProfile = (session: PortalSessionSummary): PortalUserProfileState => ({
  displayName: session.displayName || "Member",
  region: session.region || "JP",
  preferredLanguage: "ja",
  preferredCurrency: "JPY",
});

const defaultPreferences = (): PortalUserPreferenceState => ({
  homeSurface: "recommended",
  launcherLayout: "comfortable",
  recommendationMode: "balanced",
  saveRecentActions: true,
  pinLauncherShortcut: true,
});

const defaultSettings = (): PortalUserSettingsState => ({
  themeMode: "system",
  cardDensity: "comfortable",
  startPage: "launcher",
  defaultOsCode: undefined,
});

const ensureProfileSettings = (
  session: PortalSessionSummary,
): PortalStoredProfileSettings => {
  const userKey = requireUserKey(session);

  if (!profileSettingsByUser.has(userKey)) {
    profileSettingsByUser.set(userKey, {
      profile: defaultProfile(session),
      preferences: defaultPreferences(),
      settings: defaultSettings(),
    });
  }

  return profileSettingsByUser.get(userKey) as PortalStoredProfileSettings;
};

export const getProfileSettings = (
  session: PortalSessionSummary,
): PortalStoredProfileSettings => clone(ensureProfileSettings(session));

export const upsertProfileSettings = (
  session: PortalSessionSummary,
  input: PortalStoredProfileSettings,
): PortalStoredProfileSettings => {
  const userKey = requireUserKey(session);

  const next: PortalStoredProfileSettings = {
    profile: {
      displayName: input.profile.displayName,
      region: input.profile.region,
      preferredLanguage: input.profile.preferredLanguage,
      preferredCurrency: input.profile.preferredCurrency,
    },
    preferences: {
      homeSurface: input.preferences.homeSurface,
      launcherLayout: input.preferences.launcherLayout,
      recommendationMode: input.preferences.recommendationMode,
      saveRecentActions: input.preferences.saveRecentActions,
      pinLauncherShortcut: input.preferences.pinLauncherShortcut,
    },
    settings: {
      themeMode: input.settings.themeMode,
      cardDensity: input.settings.cardDensity,
      startPage: input.settings.startPage,
      defaultOsCode: input.settings.defaultOsCode || undefined,
    },
  };

  profileSettingsByUser.set(userKey, next);
  return clone(next);
};
