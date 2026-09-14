"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationCard } from "../../components/common/notification-card";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { PersonalEntryCard } from "../../components/common/personal-entry-card";
import { StatusMessage } from "../../components/feedback/status-message";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { PORTAL_LAUNCHER_STATE } from "../../mocks/launcher/state";
import {
  getActiveAuthBridgeMode,
  getGatewaySessionSummary,
} from "../../services/civilization-auth/auth-gateway";
import {
  requestPublicNotificationAnnouncementAck,
  requestPublicNotificationCenterGet,
} from "../../services/portal-api/notification-client";
import {
  requestPersonalEntriesGet,
  requestPersonalShortcutUpsert,
  requestPersonalRecentAppend,
} from "../../services/portal-api/personalization-client";
import {
  requestPublicProfileSettingsGet,
  requestPublicProfileSettingsUpsert,
} from "../../services/portal-api/profile-settings-client";
import { requestPortalLaunchMatrix } from "../../services/portal-api/launch-client";
import { requestPublicAnalyticsEventAppend } from "../../services/portal-api/analytics-client";
import { saveReturnContext } from "../../services/return-context/storage";
import type { PortalSessionSummary } from "../../types/auth";
import type { PortalLaunchMatrixItem } from "../../types/portal-api";
import type { PortalNotificationCenterItem } from "../../types/portal-notification-api";
import type {
  PortalFavoriteEntryItem,
  PortalRecentActionItem,
  PortalSavedShortcutItem,
} from "../../types/portal-personalization-api";
import type {
  PortalCardDensity,
  PortalHomeSurfacePreference,
  PortalLauncherLayout,
  PortalPreferredCurrency,
  PortalPreferredLanguage,
  PortalRecommendationPreference,
  PortalStartPage,
  PortalThemeMode,
  PortalUserPreferenceState,
  PortalUserProfileState,
  PortalUserSettingsState,
} from "../../types/portal-profile-settings-api";
import {
  ROUTES,
  buildLoginRoute,
  buildOsDetailRoute,
} from "../../lib/routing/routes";

const orderItemsByCodes = (
  items: PortalLaunchMatrixItem[],
  codes: string[],
): PortalLaunchMatrixItem[] => {
  const map = new Map(items.map((item) => [item.os.code, item]));
  return codes
    .map((code) => map.get(code))
    .filter((item): item is PortalLaunchMatrixItem => Boolean(item));
};

const mergeDistinctCodes = (first: string[], second: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];

  [...first, ...second].forEach((code) => {
    if (!seen.has(code)) {
      seen.add(code);
      out.push(code);
    }
  });

  return out;
};

export function LauncherPage() {
  const router = useRouter();

  const [session, setSession] = useState<PortalSessionSummary>({
    isLoggedIn: false,
    entityType: "guest",
    affiliations: [],
    contractTier: "none",
    betaFlags: [],
    region: "JP",
  });

  const [items, setItems] = useState<PortalLaunchMatrixItem[]>([]);
  const [savedShortcuts, setSavedShortcuts] = useState<PortalSavedShortcutItem[]>([]);
  const [favoriteEntries, setFavoriteEntries] = useState<PortalFavoriteEntryItem[]>([]);
  const [recentActions, setRecentActions] = useState<PortalRecentActionItem[]>([]);

  const [bannerItems, setBannerItems] = useState<PortalNotificationCenterItem[]>([]);
  const [inboxItems, setInboxItems] = useState<PortalNotificationCenterItem[]>([]);
  const [announcementItems, setAnnouncementItems] = useState<PortalNotificationCenterItem[]>([]);

  const [profile, setProfile] = useState<PortalUserProfileState | null>(null);
  const [preferences, setPreferences] = useState<PortalUserPreferenceState | null>(null);
  const [settings, setSettings] = useState<PortalUserSettingsState | null>(null);

  const [displayNameInput, setDisplayNameInput] = useState("");
  const [regionInput, setRegionInput] = useState("JP");
  const [preferredLanguageInput, setPreferredLanguageInput] =
    useState<PortalPreferredLanguage>("ja");
  const [preferredCurrencyInput, setPreferredCurrencyInput] =
    useState<PortalPreferredCurrency>("JPY");
  const [homeSurfaceInput, setHomeSurfaceInput] =
    useState<PortalHomeSurfacePreference>("recommended");
  const [launcherLayoutInput, setLauncherLayoutInput] =
    useState<PortalLauncherLayout>("comfortable");
  const [recommendationModeInput, setRecommendationModeInput] =
    useState<PortalRecommendationPreference>("balanced");
  const [saveRecentActionsInput, setSaveRecentActionsInput] = useState(true);
  const [pinLauncherShortcutInput, setPinLauncherShortcutInput] = useState(true);
  const [themeModeInput, setThemeModeInput] =
    useState<PortalThemeMode>("system");
  const [cardDensityInput, setCardDensityInput] =
    useState<PortalCardDensity>("comfortable");
  const [startPageInput, setStartPageInput] =
    useState<PortalStartPage>("launcher");
  const [defaultOsCodeInput, setDefaultOsCodeInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [profileSettingsLoading, setProfileSettingsLoading] = useState(false);
  const [profileSettingsSaving, setProfileSettingsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [personalErrorMessage, setPersonalErrorMessage] = useState<string | null>(null);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState<string | null>(null);
  const [profileSettingsErrorMessage, setProfileSettingsErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const bridgeMode = getActiveAuthBridgeMode();

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const currentSession = getGatewaySessionSummary();
        if (!active) {
          return;
        }

        setSession(currentSession);

        const response = await requestPortalLaunchMatrix({
          requestedOsCodes: OS_CATALOG.map((os) => os.code),
          requestSource: "launcher",
          session: currentSession,
        });

        if (!active) {
          return;
        }

        setItems(response.data.items);
      } catch (error) {
        if (!active) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Launcher decisions could not be loaded.";
        setErrorMessage(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  const loadProfileSettings = async (currentSession: PortalSessionSummary) => {
    if (!currentSession.isLoggedIn || !currentSession.civilizationUserId) {
      setProfile(null);
      setPreferences(null);
      setSettings(null);
      setProfileSettingsErrorMessage(null);
      return;
    }

    try {
      setProfileSettingsLoading(true);
      setProfileSettingsErrorMessage(null);

      const response = await requestPublicProfileSettingsGet({
        session: currentSession,
      });

      setProfile(response.data.profile);
      setPreferences(response.data.preferences);
      setSettings(response.data.settings);

      setDisplayNameInput(response.data.profile.displayName);
      setRegionInput(response.data.profile.region);
      setPreferredLanguageInput(response.data.profile.preferredLanguage);
      setPreferredCurrencyInput(response.data.profile.preferredCurrency);

      setHomeSurfaceInput(response.data.preferences.homeSurface);
      setLauncherLayoutInput(response.data.preferences.launcherLayout);
      setRecommendationModeInput(response.data.preferences.recommendationMode);
      setSaveRecentActionsInput(response.data.preferences.saveRecentActions);
      setPinLauncherShortcutInput(response.data.preferences.pinLauncherShortcut);

      setThemeModeInput(response.data.settings.themeMode);
      setCardDensityInput(response.data.settings.cardDensity);
      setStartPageInput(response.data.settings.startPage);
      setDefaultOsCodeInput(response.data.settings.defaultOsCode || "");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Profile settings could not be loaded.";
      setProfileSettingsErrorMessage(message);
    } finally {
      setProfileSettingsLoading(false);
    }
  };

  const reloadPersonalEntries = async (currentSession: PortalSessionSummary) => {
    if (!currentSession.isLoggedIn || !currentSession.civilizationUserId) {
      setSavedShortcuts([]);
      setFavoriteEntries([]);
      setRecentActions([]);
      setPersonalErrorMessage(null);
      return;
    }

    try {
      setPersonalLoading(true);
      setPersonalErrorMessage(null);

      const response = await requestPersonalEntriesGet({
        session: currentSession,
        limit: 8,
      });

      setSavedShortcuts(response.data.savedShortcuts);
      setFavoriteEntries(response.data.favoriteEntries);
      setRecentActions(response.data.recentActions);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Personal entries could not be loaded.";
      setPersonalErrorMessage(message);
    } finally {
      setPersonalLoading(false);
    }
  };

  const reloadNotifications = async (currentSession: PortalSessionSummary) => {
    try {
      setNotificationLoading(true);
      setNotificationErrorMessage(null);

      const response = await requestPublicNotificationCenterGet({
        surface: "launcher",
        session: currentSession,
        limit: 8,
      });

      setBannerItems(response.data.bannerItems);
      setInboxItems(response.data.inboxItems);
      setAnnouncementItems(response.data.announcementItems);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Notifications could not be loaded.";
      setNotificationErrorMessage(message);
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    reloadPersonalEntries(session);
    reloadNotifications(session);
    loadProfileSettings(session);
  }, [session.isLoggedIn, session.civilizationUserId, session.contractTier, session.affiliations.join(",")]);

  useEffect(() => {
    const currentSession = getGatewaySessionSummary();
    requestPublicAnalyticsEventAppend({
      session: currentSession,
      surface: "launcher",
      action: "page_view",
      targetCode: "launcher",
      targetTitle: "Launcher",
      targetKind: "launcher",
      metadata: "analytics_launcher_page_view",
    }).catch(() => undefined);
  }, [session.isLoggedIn, session.civilizationUserId]);

  const available = useMemo(
    () => items.filter((item) => item.decision.result === "launchable"),
    [items],
  );

  const unavailable = useMemo(
    () => items.filter((item) => item.decision.result !== "launchable"),
    [items],
  );

  const recent = useMemo(
    () => orderItemsByCodes(items, PORTAL_LAUNCHER_STATE.recentCodes),
    [items],
  );

  const recommended = useMemo(() => {
    if (!preferences) {
      return orderItemsByCodes(items, PORTAL_LAUNCHER_STATE.recommendedCodes);
    }

    if (preferences.recommendationMode === "recent") {
      return recent;
    }

    if (preferences.recommendationMode === "featured") {
      return orderItemsByCodes(items, PORTAL_LAUNCHER_STATE.recommendedCodes);
    }

    return orderItemsByCodes(
      items,
      mergeDistinctCodes(
        PORTAL_LAUNCHER_STATE.recommendedCodes,
        PORTAL_LAUNCHER_STATE.recentCodes,
      ),
    );
  }, [items, preferences, recent]);

  const preferredDefaultItem = useMemo(() => {
    if (!settings?.defaultOsCode) {
      return null;
    }
    return items.find((item) => item.os.code === settings.defaultOsCode) || null;
  }, [items, settings]);

  const personalGridClass = useMemo(() => {
    if (
      settings?.cardDensity === "compact" ||
      preferences?.launcherLayout === "compact"
    ) {
      return "grid-3";
    }
    return "grid-2";
  }, [preferences, settings]);

  const handleLoginRequest = () => {
    saveReturnContext({
      returnTarget: ROUTES.launcher,
      requestTimestamp: new Date().toISOString(),
    });
    router.push(buildLoginRoute(ROUTES.launcher));
  };

  const handleOpen = async (item: PortalLaunchMatrixItem) => {
    if (item.decision.result === "login_required") {
      saveReturnContext({
        requestedOsCode: item.os.code,
        returnTarget: ROUTES.launcher,
        requestTimestamp: new Date().toISOString(),
      });
      router.push(item.decision.target);
      return;
    }

    if (
      session.isLoggedIn &&
      session.civilizationUserId &&
      preferences?.saveRecentActions !== false
    ) {
      try {
        await requestPersonalRecentAppend({
          session,
          actionCode: "launcher_open",
          actionLabel: "Opened from launcher",
          targetCode: item.os.code,
          targetTitle: item.os.name,
          targetHref: item.decision.target,
          targetKind: "os",
        });
        await reloadPersonalEntries(session);
      } catch {
        return router.push(item.decision.target);
      }
    }

    router.push(item.decision.target);
  };

  const handleSaveLauncherShortcut = async () => {
    if (!session.isLoggedIn || !session.civilizationUserId) {
      handleLoginRequest();
      return;
    }

    try {
      setActionMessage(null);

      await requestPersonalShortcutUpsert({
        session,
        code: "shortcut-launcher-manual",
        title: "Launcher",
        href: ROUTES.launcher,
        targetKind: "launcher",
        note: "Saved from launcher page",
        sortOrder: 5,
      });

      await reloadPersonalEntries(session);
      await requestPublicAnalyticsEventAppend({
        session,
        surface: "launcher",
        action: "save_shortcut",
        targetCode: "launcher",
        targetTitle: "Launcher",
        targetKind: "launcher",
        metadata: "analytics_launcher_save_shortcut",
      }).catch(() => undefined);
      setActionMessage("Launcher shortcut saved.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Launcher shortcut could not be saved.";
      setActionMessage(message);
    }
  };

  const handleAckAnnouncement = async (code: string) => {
    if (!session.isLoggedIn || !session.civilizationUserId) {
      handleLoginRequest();
      return;
    }

    try {
      setActionMessage(null);

      await requestPublicNotificationAnnouncementAck({
        session,
        code,
        surface: "launcher",
      });

      await reloadNotifications(session);
      await requestPublicAnalyticsEventAppend({
        session,
        surface: "launcher",
        action: "ack_announcement",
        targetCode: code,
        targetTitle: "Launcher announcement",
        targetKind: "launcher",
        metadata: "analytics_launcher_ack_announcement",
      }).catch(() => undefined);
      setActionMessage("Announcement acknowledged.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Announcement could not be acknowledged.";
      setActionMessage(message);
    }
  };

  const handleSaveProfileSettings = async () => {
    if (!session.isLoggedIn || !session.civilizationUserId) {
      handleLoginRequest();
      return;
    }

    try {
      setProfileSettingsSaving(true);
      setActionMessage(null);
      setProfileSettingsErrorMessage(null);

      const response = await requestPublicProfileSettingsUpsert({
        session,
        profile: {
          displayName: displayNameInput,
          region: regionInput,
          preferredLanguage: preferredLanguageInput,
          preferredCurrency: preferredCurrencyInput,
        },
        preferences: {
          homeSurface: homeSurfaceInput,
          launcherLayout: launcherLayoutInput,
          recommendationMode: recommendationModeInput,
          saveRecentActions: saveRecentActionsInput,
          pinLauncherShortcut: pinLauncherShortcutInput,
        },
        settings: {
          themeMode: themeModeInput,
          cardDensity: cardDensityInput,
          startPage: startPageInput,
          defaultOsCode: defaultOsCodeInput || undefined,
        },
      });

      setProfile(response.data.profile);
      setPreferences(response.data.preferences);
      setSettings(response.data.settings);

      if (response.data.preferences.pinLauncherShortcut) {
        await requestPersonalShortcutUpsert({
          session,
          code: "shortcut-launcher-manual",
          title: "Launcher",
          href: ROUTES.launcher,
          targetKind: "launcher",
          note: "Pinned by profile settings",
          sortOrder: 5,
        });
        await reloadPersonalEntries(session);
      }

      await requestPublicAnalyticsEventAppend({
        session,
        surface: "launcher",
        action: "save_profile_settings",
        targetCode: response.data.settings.defaultOsCode || "launcher-settings",
        targetTitle: "Launcher profile settings",
        targetKind: response.data.settings.defaultOsCode ? "os" : "launcher",
        metadata: "analytics_launcher_save_profile_settings",
      }).catch(() => undefined);

      setActionMessage("Profile settings saved.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Profile settings could not be saved.";
      setProfileSettingsErrorMessage(message);
    } finally {
      setProfileSettingsSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="My Launcher"
        title="Launcher entry"
        description="The launcher now reads profile, preference, settings, personal entries, and notification center payloads."
      />

      <StatusMessage
        title={`Auth bridge mode: ${bridgeMode}`}
        message="Launcher session access remains centralized in the auth gateway."
        variant="info"
      />

      {errorMessage ? (
        <StatusMessage
          title="Launcher load failed"
          message={errorMessage}
          variant="danger"
        />
      ) : null}

      {personalErrorMessage ? (
        <StatusMessage
          title="Personal entry fallback active"
          message={personalErrorMessage}
          variant="warning"
        />
      ) : null}

      {notificationErrorMessage ? (
        <StatusMessage
          title="Notification fallback active"
          message={notificationErrorMessage}
          variant="warning"
        />
      ) : null}

      {profileSettingsErrorMessage ? (
        <StatusMessage
          title="Profile settings fallback active"
          message={profileSettingsErrorMessage}
          variant="warning"
        />
      ) : null}

      {actionMessage ? (
        <StatusMessage
          title="Launcher update"
          message={actionMessage}
          variant="success"
        />
      ) : null}

      <section className="page-section">
        <h2 className="section-title">Support entry</h2>
        <div className="grid-2">
          <article className="card">
            <p className="eyebrow">HELP</p>
            <h3 className="card-title">Launcher help</h3>
            <p className="card-copy">
              Review support articles for launcher behavior, routing, and supported entry rules.
            </p>
            <div className="button-row">
              <Link href={ROUTES.help} className="button-link">
                Open Help
              </Link>
              <Link href={ROUTES.contact} className="secondary-link">
                Contact Support
              </Link>
            </div>
          </article>

          <article className="card">
            <p className="eyebrow">POLICY</p>
            <h3 className="card-title">Operational references</h3>
            <p className="card-copy">
              Review policy and terms when you need operational or contractual clarification.
            </p>
            <div className="button-row">
              <Link href={ROUTES.policy} className="button-link">
                Open Policy
              </Link>
              <Link href={ROUTES.terms} className="secondary-link">
                Open Terms
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Session summary</h2>
          <ul className="list">
            <li>Logged in: {session.isLoggedIn ? "yes" : "no"}</li>
            <li>Display name: {session.displayName ?? "guest"}</li>
            <li>Entity type: {session.entityType}</li>
            <li>Contract tier: {session.contractTier}</li>
            <li>
              Affiliations: {session.affiliations.length > 0 ? session.affiliations.join(", ") : "none"}
            </li>
            <li>
              Preferred start page: {settings?.startPage ?? "launcher"}
            </li>
            <li>
              Launcher layout: {preferences?.launcherLayout ?? "comfortable"}
            </li>
          </ul>

          <div className="button-row">
            {!session.isLoggedIn ? (
              <button type="button" className="button-link" onClick={handleLoginRequest}>
                Login to Personalize Launcher
              </button>
            ) : (
              <button type="button" className="button-link" onClick={handleSaveLauncherShortcut}>
                Save Launcher Shortcut
              </button>
            )}
          </div>
        </article>
      </section>

      {profileSettingsLoading ? (
        <StatusMessage
          title="Loading profile settings"
          message="Reading profile, preferences, and settings."
          variant="info"
        />
      ) : null}

      {session.isLoggedIn ? (
        <>
          <section className="page-section">
            <h2 className="section-title">Profile and settings</h2>
            <article className="card">
              <div className="form-grid">
                <label className="field-block">
                  <span className="label-text">Display name</span>
                  <input
                    className="text-input"
                    value={displayNameInput}
                    onChange={(event) => setDisplayNameInput(event.target.value)}
                    placeholder="Display name"
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Region</span>
                  <input
                    className="text-input"
                    value={regionInput}
                    onChange={(event) => setRegionInput(event.target.value)}
                    placeholder="JP"
                  />
                </label>

                <label className="field-block">
                  <span className="label-text">Preferred language</span>
                  <select
                    className="select-input"
                    value={preferredLanguageInput}
                    onChange={(event) =>
                      setPreferredLanguageInput(
                        event.target.value as PortalPreferredLanguage,
                      )
                    }
                  >
                    <option value="ja">ja</option>
                    <option value="en">en</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Preferred currency</span>
                  <select
                    className="select-input"
                    value={preferredCurrencyInput}
                    onChange={(event) =>
                      setPreferredCurrencyInput(
                        event.target.value as PortalPreferredCurrency,
                      )
                    }
                  >
                    <option value="JPY">JPY</option>
                    <option value="USD">USD</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Home surface</span>
                  <select
                    className="select-input"
                    value={homeSurfaceInput}
                    onChange={(event) =>
                      setHomeSurfaceInput(
                        event.target.value as PortalHomeSurfacePreference,
                      )
                    }
                  >
                    <option value="recommended">recommended</option>
                    <option value="catalog">catalog</option>
                    <option value="search">search</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Launcher layout</span>
                  <select
                    className="select-input"
                    value={launcherLayoutInput}
                    onChange={(event) =>
                      setLauncherLayoutInput(
                        event.target.value as PortalLauncherLayout,
                      )
                    }
                  >
                    <option value="comfortable">comfortable</option>
                    <option value="compact">compact</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Recommendation mode</span>
                  <select
                    className="select-input"
                    value={recommendationModeInput}
                    onChange={(event) =>
                      setRecommendationModeInput(
                        event.target.value as PortalRecommendationPreference,
                      )
                    }
                  >
                    <option value="balanced">balanced</option>
                    <option value="featured">featured</option>
                    <option value="recent">recent</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Theme mode</span>
                  <select
                    className="select-input"
                    value={themeModeInput}
                    onChange={(event) =>
                      setThemeModeInput(event.target.value as PortalThemeMode)
                    }
                  >
                    <option value="system">system</option>
                    <option value="light">light</option>
                    <option value="dark">dark</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Card density</span>
                  <select
                    className="select-input"
                    value={cardDensityInput}
                    onChange={(event) =>
                      setCardDensityInput(event.target.value as PortalCardDensity)
                    }
                  >
                    <option value="comfortable">comfortable</option>
                    <option value="compact">compact</option>
                  </select>
                </label>

                <label className="field-block">
                  <span className="label-text">Preferred start page</span>
                  <select
                    className="select-input"
                    value={startPageInput}
                    onChange={(event) =>
                      setStartPageInput(event.target.value as PortalStartPage)
                    }
                  >
                    <option value="home">home</option>
                    <option value="search">search</option>
                    <option value="launcher">launcher</option>
                  </select>
                </label>

                <label className="field-block field-span-2">
                  <span className="label-text">Default OS code</span>
                  <input
                    className="text-input"
                    value={defaultOsCodeInput}
                    onChange={(event) => setDefaultOsCodeInput(event.target.value)}
                    placeholder="civilization-os"
                  />
                </label>

                <label className="field-block checkbox-field">
                  <input
                    type="checkbox"
                    checked={saveRecentActionsInput}
                    onChange={(event) => setSaveRecentActionsInput(event.target.checked)}
                  />
                  <span className="label-text">Save recent actions</span>
                </label>

                <label className="field-block checkbox-field">
                  <input
                    type="checkbox"
                    checked={pinLauncherShortcutInput}
                    onChange={(event) => setPinLauncherShortcutInput(event.target.checked)}
                  />
                  <span className="label-text">Pin launcher shortcut</span>
                </label>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="button-link"
                  onClick={handleSaveProfileSettings}
                  disabled={profileSettingsSaving}
                >
                  {profileSettingsSaving ? "Saving..." : "Save Profile Settings"}
                </button>
              </div>
            </article>
          </section>

          <section className="page-section">
            <h2 className="section-title">Preferred defaults</h2>
            <div className={personalGridClass}>
              <PersonalEntryCard
                eyebrow="PROFILE"
                title={profile?.displayName || "Member"}
                summary={`Region ${profile?.region || "JP"} / ${profile?.preferredLanguage || "ja"} / ${profile?.preferredCurrency || "JPY"}`}
                href={ROUTES.launcher}
                meta={`Theme ${settings?.themeMode || "system"} / Density ${settings?.cardDensity || "comfortable"}`}
              />
              <PersonalEntryCard
                eyebrow="PREFERENCE"
                title={`Home ${preferences?.homeSurface || "recommended"} / Start ${settings?.startPage || "launcher"}`}
                summary={`Launcher ${preferences?.launcherLayout || "comfortable"} / Recommend ${preferences?.recommendationMode || "balanced"}`}
                href={ROUTES.launcher}
                meta={`Recent ${preferences?.saveRecentActions ? "on" : "off"} / Pin shortcut ${preferences?.pinLauncherShortcut ? "on" : "off"}`}
              />
              {preferredDefaultItem ? (
                <PersonalEntryCard
                  eyebrow="DEFAULT OS"
                  title={preferredDefaultItem.os.name}
                  summary={preferredDefaultItem.os.summary}
                  href={preferredDefaultItem.decision.target}
                  meta={`Code: ${preferredDefaultItem.os.code}`}
                />
              ) : (
                <PersonalEntryCard
                  eyebrow="DEFAULT OS"
                  title="No default OS selected"
                  summary="Set a default OS code above to keep a preferred quick entry."
                  href={ROUTES.osCatalog}
                  meta="Open OS Catalog"
                />
              )}
            </div>
          </section>
        </>
      ) : (
        <StatusMessage
          title="Guest profile mode"
          message="Profile, preferences, and settings become available after login."
          variant="warning"
        />
      )}

      {notificationLoading ? (
        <StatusMessage
          title="Loading notifications"
          message="Reading launcher banners, inbox items, and announcements."
          variant="info"
        />
      ) : null}

      <section className="page-section">
        <h2 className="section-title">Active banners</h2>
        {bannerItems.length === 0 ? (
          <article className="card">
            <p className="card-copy">No active banner is currently available.</p>
          </article>
        ) : (
          <div className={personalGridClass}>
            {bannerItems.map((item) => (
              <NotificationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <h2 className="section-title">Inbox</h2>
        {inboxItems.length === 0 ? (
          <article className="card">
            <p className="card-copy">No inbox item is currently available.</p>
          </article>
        ) : (
          <div className={personalGridClass}>
            {inboxItems.map((item) => (
              <NotificationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="page-section">
        <h2 className="section-title">Announcements</h2>
        {announcementItems.length === 0 ? (
          <article className="card">
            <p className="card-copy">No announcement is currently pending.</p>
          </article>
        ) : (
          <div className={personalGridClass}>
            {announcementItems.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                actionLabel={item.ackRequired ? "Acknowledge" : undefined}
                onAction={
                  item.ackRequired
                    ? () => handleAckAnnouncement(item.code)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {personalLoading ? (
        <StatusMessage
          title="Loading personal entries"
          message="Reading saved shortcuts, favorites, and recent actions."
          variant="info"
        />
      ) : null}

      {session.isLoggedIn ? (
        <>
          <section className="page-section">
            <h2 className="section-title">Saved shortcuts</h2>
            {savedShortcuts.length === 0 ? (
              <article className="card">
                <p className="card-copy">No saved shortcut is currently available.</p>
              </article>
            ) : (
              <div className={personalGridClass}>
                {savedShortcuts.map((item) => (
                  <PersonalEntryCard
                    key={item.id}
                    eyebrow={`SHORTCUT / ${item.targetKind.toUpperCase()}`}
                    title={item.title}
                    summary={item.note}
                    href={item.href}
                    meta={`Updated: ${item.lastUpdatedAt}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="page-section">
            <h2 className="section-title">Favorite entries</h2>
            {favoriteEntries.length === 0 ? (
              <article className="card">
                <p className="card-copy">No favorite entry is currently available.</p>
              </article>
            ) : (
              <div className={personalGridClass}>
                {favoriteEntries.map((item) => (
                  <PersonalEntryCard
                    key={item.id}
                    eyebrow={`FAVORITE / ${item.targetKind.toUpperCase()}`}
                    title={item.title}
                    summary={item.reason}
                    href={item.href}
                    meta={`Updated: ${item.lastUpdatedAt}`}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="page-section">
            <h2 className="section-title">Recent actions</h2>
            {recentActions.length === 0 ? (
              <article className="card">
                <p className="card-copy">No recent action is currently available.</p>
              </article>
            ) : (
              <div className={personalGridClass}>
                {recentActions.map((item) => (
                  <PersonalEntryCard
                    key={item.id}
                    eyebrow={`RECENT / ${item.targetKind.toUpperCase()}`}
                    title={item.targetTitle}
                    summary={item.actionLabel}
                    href={item.targetHref}
                    meta={`At: ${item.occurredAt}`}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <StatusMessage
          title="Guest launcher mode"
          message="Saved shortcuts, favorites, recent actions, and settings become available after login."
          variant="warning"
        />
      )}

      {loading ? (
        <StatusMessage
          title="Loading launcher decisions"
          message="Requesting the launch matrix from the portal API."
          variant="info"
        />
      ) : null}

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Available now</h2>
            {available.length === 0 ? (
              <p className="card-copy">No OS is currently launchable for this session.</p>
            ) : (
              <div className="stack">
                {available.map((item) => (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.decision.reason}</p>
                    </div>
                    <button
                      type="button"
                      className="button-link"
                      onClick={() => handleOpen(item)}
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="card">
            <h2 className="section-title">Blocked or delayed</h2>
            {unavailable.length === 0 ? (
              <p className="card-copy">No blocked entries.</p>
            ) : (
              <div className="stack">
                {unavailable.map((item) => (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.decision.reason}</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleOpen(item)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Recent OS</h2>
            <div className="stack">
              {recent.map((item) => (
                <div key={item.os.code} className="inline-card">
                  <div>
                    <p className="inline-title">{item.os.name}</p>
                    <p className="inline-copy">{item.os.tagline}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleOpen(item)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <h2 className="section-title">Recommended OS</h2>
            <div className="stack">
              {recommended.map((item) => (
                <div key={item.os.code} className="inline-card">
                  <div>
                    <p className="inline-title">{item.os.name}</p>
                    <p className="inline-copy">{item.os.summary}</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleOpen(item)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Notices for launcher users</h2>
          <div className="stack">
            {HOME_NOTICES.map((notice) => (
              <div key={notice.slug} className="inline-card">
                <div>
                  <p className="inline-title">{notice.title}</p>
                  <p className="inline-copy">{notice.summary}</p>
                </div>
                <span className="chip">{notice.level}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
