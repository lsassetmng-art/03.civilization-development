"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NotificationCard } from "../../components/common/notification-card";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { PersonalEntryCard } from "../../components/common/personal-entry-card";
import { StatusMessage } from "../../components/feedback/status-message";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG } from "../../mocks/os/catalog";
import {
  getActiveAuthBridgeMode,
  getGatewaySessionSummary,
} from "../../services/civilization-auth/auth-gateway";
import { requestPublicAnalyticsEventAppend } from "../../services/portal-api/analytics-client";
import { requestPortalLaunchMatrix } from "../../services/portal-api/launch-client";
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
  PortalUserPreferenceState,
  PortalUserProfileState,
  PortalUserSettingsState,
} from "../../types/portal-profile-settings-api";
import { ROUTES, buildLoginRoute } from "../../lib/routing/routes";

const DEFAULT_SESSION: PortalSessionSummary = {
  isLoggedIn: false,
  entityType: "guest",
  affiliations: [],
  contractTier: "none",
  betaFlags: [],
  region: "JP",
};

export function LauncherPage() {
  const [session, setSession] = useState<PortalSessionSummary>(DEFAULT_SESSION);
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

  const [loading, setLoading] = useState(true);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [personalErrorMessage, setPersonalErrorMessage] = useState<string | null>(null);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState<string | null>(null);
  const [profileErrorMessage, setProfileErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const bridgeMode = getActiveAuthBridgeMode();

  useEffect(() => {
    const currentSession = getGatewaySessionSummary();
    setSession(currentSession);

    requestPublicAnalyticsEventAppend({
      session: currentSession,
      surface: "launcher",
      action: "page_view",
      targetCode: "launcher",
      targetTitle: "Launcher",
      targetKind: "launcher",
      metadata: "analytics_launcher_page_view",
    }).catch(() => undefined);
  }, []);

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

  const reloadProfileSettings = async (currentSession: PortalSessionSummary) => {
    if (!currentSession.isLoggedIn || !currentSession.civilizationUserId) {
      setProfile(null);
      setPreferences(null);
      setSettings(null);
      setProfileErrorMessage(null);
      return;
    }

    try {
      setProfileLoading(true);
      setProfileErrorMessage(null);

      const response = await requestPublicProfileSettingsGet({
        session: currentSession,
      });

      setProfile(response.data.profile);
      setPreferences(response.data.preferences);
      setSettings(response.data.settings);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Profile settings could not be loaded.";
      setProfileErrorMessage(message);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    reloadPersonalEntries(session);
    reloadNotifications(session);
    reloadProfileSettings(session);
  }, [session]);

  const available = useMemo(
    () => items.filter((item) => item.decision.result === "launchable"),
    [items],
  );

  const blocked = useMemo(
    () => items.filter((item) => item.decision.result !== "launchable"),
    [items],
  );

  const handleLoginRequest = () => {
    saveReturnContext({
      returnTarget: ROUTES.launcher,
      requestTimestamp: new Date().toISOString(),
    });
    window.location.href = buildLoginRoute(ROUTES.launcher);
  };

  const handleOpen = async (item: PortalLaunchMatrixItem) => {
    if (item.decision.result === "login_required") {
      saveReturnContext({
        requestedOsCode: item.os.code,
        returnTarget: ROUTES.launcher,
        requestTimestamp: new Date().toISOString(),
      });
      window.location.href = item.decision.target;
      return;
    }

    if (
      session.isLoggedIn &&
      session.civilizationUserId &&
      preferences?.saveRecentActions !== false
    ) {
      await requestPersonalRecentAppend({
        session,
        actionCode: "launcher_open",
        actionLabel: "Opened from launcher",
        targetCode: item.os.code,
        targetTitle: item.os.name,
        targetHref: item.decision.target,
        targetKind: "os",
      }).catch(() => undefined);
    }

    await requestPublicAnalyticsEventAppend({
      session,
      surface: "launcher",
      action: "open_target",
      targetCode: item.os.code,
      targetTitle: item.os.name,
      targetKind: "os",
      metadata: "analytics_launcher_open_target",
    }).catch(() => undefined);

    window.location.href = item.decision.target;
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

      await requestPublicAnalyticsEventAppend({
        session,
        surface: "launcher",
        action: "save_shortcut",
        targetCode: "launcher",
        targetTitle: "Launcher",
        targetKind: "launcher",
        metadata: "analytics_launcher_save_shortcut",
      }).catch(() => undefined);

      await reloadPersonalEntries(session);
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

      await requestPublicAnalyticsEventAppend({
        session,
        surface: "launcher",
        action: "ack_announcement",
        targetCode: code,
        targetTitle: "Launcher announcement",
        targetKind: "launcher",
        metadata: "analytics_launcher_ack_announcement",
      }).catch(() => undefined);

      await reloadNotifications(session);
      setActionMessage("Announcement acknowledged.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Announcement could not be acknowledged.";
      setActionMessage(message);
    }
  };

  const handleSaveProfileDefaults = async () => {
    if (!session.isLoggedIn || !session.civilizationUserId) {
      handleLoginRequest();
      return;
    }

    if (!profile || !preferences || !settings) {
      setActionMessage("Profile settings are not ready yet.");
      return;
    }

    try {
      setProfileSaving(true);
      setActionMessage(null);

      const response = await requestPublicProfileSettingsUpsert({
        session,
        profile,
        preferences,
        settings,
      });

      setProfile(response.data.profile);
      setPreferences(response.data.preferences);
      setSettings(response.data.settings);

      await requestPublicAnalyticsEventAppend({
        session,
        surface: "launcher",
        action: "save_profile_settings",
        targetCode: response.data.settings.defaultOsCode || "launcher-settings",
        targetTitle: "Launcher profile settings",
        targetKind: response.data.settings.defaultOsCode ? "os" : "launcher",
        metadata: "analytics_launcher_save_profile_settings",
      }).catch(() => undefined);

      await reloadProfileSettings(session);
      setActionMessage("Profile settings saved.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Profile settings could not be saved.";
      setActionMessage(message);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="My Launcher"
        title="Launcher entry"
        description="The launcher is running in a compile-safe normalized mode with session, settings, personal entries, notifications, and launch decisions."
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

      {profileErrorMessage ? (
        <StatusMessage
          title="Profile settings fallback active"
          message={profileErrorMessage}
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
          </ul>

          <div className="button-row">
            {!session.isLoggedIn ? (
              <button type="button" className="button-link" onClick={handleLoginRequest}>
                Login to Personalize Launcher
              </button>
            ) : (
              <>
                <button type="button" className="button-link" onClick={handleSaveLauncherShortcut}>
                  Save Launcher Shortcut
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleSaveProfileDefaults}
                  disabled={profileSaving}
                >
                  {profileSaving ? "Saving..." : "Save Profile Settings"}
                </button>
              </>
            )}
          </div>
        </article>
      </section>

      {profileLoading ? (
        <StatusMessage
          title="Loading profile settings"
          message="Reading profile, preferences, and settings."
          variant="info"
        />
      ) : null}

      {profile ? (
        <section className="page-section">
          <h2 className="section-title">Profile defaults</h2>
          <div className="grid-2">
            <PersonalEntryCard
              eyebrow="PROFILE"
              title={profile.displayName}
              summary={`Region ${profile.region} / ${profile.preferredLanguage} / ${profile.preferredCurrency}`}
              href={ROUTES.launcher}
              meta={`Theme ${settings?.themeMode || "system"}`}
            />
            <PersonalEntryCard
              eyebrow="PREFERENCE"
              title={`Launcher ${preferences?.launcherLayout || "comfortable"}`}
              summary={`Recommendation ${preferences?.recommendationMode || "balanced"} / Recent ${preferences?.saveRecentActions ? "on" : "off"}`}
              href={ROUTES.launcher}
              meta={`Default OS ${settings?.defaultOsCode || "not set"}`}
            />
          </div>
        </section>
      ) : null}

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
          <div className="grid-2">
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
          <div className="grid-2">
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
          <div className="grid-2">
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
              <div className="grid-2">
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
              <div className="grid-2">
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
              <div className="grid-2">
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
            {blocked.length === 0 ? (
              <p className="card-copy">No blocked entries.</p>
            ) : (
              <div className="stack">
                {blocked.map((item) => (
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
        <article className="card">
          <h2 className="section-title">Support entry</h2>
          <div className="button-row">
            <Link href={ROUTES.help} className="button-link">
              Open Help
            </Link>
            <Link href={ROUTES.contact} className="secondary-button">
              Contact Support
            </Link>
          </div>
        </article>
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
