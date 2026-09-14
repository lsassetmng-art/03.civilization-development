import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalPreferredLanguage = "ja" | "en";
export type PortalPreferredCurrency = "JPY" | "USD";
export type PortalHomeSurfacePreference = "recommended" | "catalog" | "search";
export type PortalLauncherLayout = "comfortable" | "compact";
export type PortalRecommendationPreference = "balanced" | "featured" | "recent";
export type PortalThemeMode = "system" | "light" | "dark";
export type PortalCardDensity = "comfortable" | "compact";
export type PortalStartPage = "home" | "search" | "launcher";

export type PortalUserProfileState = {
  displayName: string;
  region: string;
  preferredLanguage: PortalPreferredLanguage;
  preferredCurrency: PortalPreferredCurrency;
};

export type PortalUserPreferenceState = {
  homeSurface: PortalHomeSurfacePreference;
  launcherLayout: PortalLauncherLayout;
  recommendationMode: PortalRecommendationPreference;
  saveRecentActions: boolean;
  pinLauncherShortcut: boolean;
};

export type PortalUserSettingsState = {
  themeMode: PortalThemeMode;
  cardDensity: PortalCardDensity;
  startPage: PortalStartPage;
  defaultOsCode?: string;
};

export type PortalPublicProfileSettingsGetRequest = {
  session: PortalSessionSummary;
};

export type PortalPublicProfileSettingsGetResponse = {
  meta: PortalApiMeta;
  data: {
    profile: PortalUserProfileState;
    preferences: PortalUserPreferenceState;
    settings: PortalUserSettingsState;
  };
};

export type PortalPublicProfileSettingsUpsertRequest = {
  session: PortalSessionSummary;
  profile: PortalUserProfileState;
  preferences: PortalUserPreferenceState;
  settings: PortalUserSettingsState;
};

export type PortalPublicProfileSettingsUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    profile: PortalUserProfileState;
    preferences: PortalUserPreferenceState;
    settings: PortalUserSettingsState;
  };
};
