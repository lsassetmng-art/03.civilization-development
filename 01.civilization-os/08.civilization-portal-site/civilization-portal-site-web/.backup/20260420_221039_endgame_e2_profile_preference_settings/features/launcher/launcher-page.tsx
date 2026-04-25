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
  requestPublicNotificationAnnouncementAck,
  requestPublicNotificationCenterGet,
} from "../../services/portal-api/notification-client";
  requestPersonalEntriesGet,
  requestPersonalShortcutUpsert,
  requestPersonalRecentAppend,
} from "../../services/portal-api/personalization-client";
import { requestPortalLaunchMatrix } from "../../services/portal-api/launch-client";
import { saveReturnContext } from "../../services/return-context/storage";
import type { PortalSessionSummary } from "../../types/auth";
import type { PortalLaunchMatrixItem } from "../../types/portal-api";
import type {
  PortalNotificationCenterItem,
} from "../../types/portal-notification-api";
  PortalFavoriteEntryItem,
  PortalRecentActionItem,
  PortalSavedShortcutItem,
} from "../../types/portal-personalization-api";
import { ROUTES, buildLoginRoute } from "../../lib/routing/routes";

const orderItemsByCodes = (
  items: PortalLaunchMatrixItem[],
  codes: string[],
): PortalLaunchMatrixItem[] => {
  const map = new Map(items.map((item) => [item.os.code, item]));
  return codes
    .map((code) => map.get(code))
    .filter((item): item is PortalLaunchMatrixItem => Boolean(item));
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

  const [loading, setLoading] = useState(true);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [personalErrorMessage, setPersonalErrorMessage] = useState<string | null>(null);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState<string | null>(null);
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
  }, [session.isLoggedIn, session.civilizationUserId, session.contractTier, session.affiliations.join(",")]);

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

  const recommended = useMemo(
    () => orderItemsByCodes(items, PORTAL_LAUNCHER_STATE.recommendedCodes),
    [items],
  );

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

    if (session.isLoggedIn && session.civilizationUserId) {
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
      setActionMessage("Announcement acknowledged.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Announcement could not be acknowledged.";
      setActionMessage(message);
    }
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="My Launcher"
        title="Launcher entry"
        description="The launcher now reads personal quick access entries and notification center payloads."
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
              <button type="button" className="button-link" onClick={handleSaveLauncherShortcut}>
                Save Launcher Shortcut
              </button>
            )}
          </div>
        </article>
      </section>

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
          message="Saved shortcuts, favorites, recent actions, and acknowledgements become available after login."
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
