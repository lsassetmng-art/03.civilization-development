"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import {
  getActiveAuthBridgeMode,
  getGatewaySessionSummary,
} from "../../services/civilization-auth/auth-gateway";
  requestPersonalFavoriteUpsert,
  requestPersonalRecentAppend,
  requestPersonalShortcutUpsert,
} from "../../services/portal-api/personalization-client";
import { requestPublicAnalyticsEventAppend } from "../../services/portal-api/analytics-client";
import { requestPortalLaunchDecision } from "../../services/portal-api/launch-client";
import { saveReturnContext } from "../../services/return-context/storage";
import type { PortalSessionSummary } from "../../types/auth";
import type { PortalLaunchMatrixItem } from "../../types/portal-api";
import type { PortalOsCard } from "../../types/os";
  ROUTES,
  buildLoginRoute,
  buildOsDetailRoute,
} from "../../lib/routing/routes";

type OsDetailPageProps = {
  os: PortalOsCard;
};

const RESULT_LABEL: Record<string, string> = {
  launchable: "Open Preview Launch",
  login_required: "Login to Continue",
  denied: "View Access Result",
  maintenance: "View Maintenance Notice",
  error: "View Error Page",
};

export function OsDetailPage({ os }: OsDetailPageProps) {
  const router = useRouter();

  const [session, setSession] = useState<PortalSessionSummary>({
    isLoggedIn: false,
    entityType: "guest",
    affiliations: [],
    contractTier: "none",
    betaFlags: [],
    region: "JP",
  });

  const [launchItem, setLaunchItem] = useState<PortalLaunchMatrixItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const bridgeMode = getActiveAuthBridgeMode();
  const recentRecordedRef = useRef(false);

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

        const response = await requestPortalLaunchDecision({
          requestedOsCode: os.code,
          requestSource: "os-detail",
          session: currentSession,
        });

        if (!active) {
          return;
        }

        setLaunchItem(response.data.item);
      } catch (error) {
        if (!active) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Launch evaluation could not be completed.";
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
  }, [os.code]);

  useEffect(() => {
    const recordRecent = async () => {
      if (
        recentRecordedRef.current ||
        !session.isLoggedIn ||
        !session.civilizationUserId
      ) {
        return;
      }

      recentRecordedRef.current = true;

      try {
        await requestPersonalRecentAppend({
          session,
          actionCode: "os_detail_view",
          actionLabel: "Viewed OS detail",
          targetCode: os.code,
          targetTitle: os.name,
          targetHref: buildOsDetailRoute(os.code),
          targetKind: "os",
        });
      } catch {
        return;
      }
    };

    recordRecent();
  }, [session.isLoggedIn, session.civilizationUserId, os.code, os.name]);

  const requireLoginForPersonalAction = () => {
    router.push(buildLoginRoute(buildOsDetailRoute(os.code), os.code));
  };

  useEffect(() => {
    const currentSession = getGatewaySessionSummary();
    requestPublicAnalyticsEventAppend({
      session: currentSession,
      surface: "os-detail",
      action: "page_view",
      targetCode: os.code,
      targetTitle: os.name,
      targetKind: "os",
      metadata: "analytics_os_detail_page_view",
    }).catch(() => undefined);
  }, [os.code]);

  const handlePrimaryAction = async () => {
    if (!launchItem) {
      return;
    }

    if (launchItem.decision.result === "login_required") {
      saveReturnContext({
        requestedOsCode: os.code,
        returnTarget: buildOsDetailRoute(os.code),
        requestTimestamp: new Date().toISOString(),
      });
      router.push(launchItem.decision.target);
      return;
    }

    if (session.isLoggedIn && session.civilizationUserId) {
      try {
        await requestPersonalRecentAppend({
          session,
          actionCode: "os_primary_open",
          actionLabel: "Opened OS from detail page",
          targetCode: os.code,
          targetTitle: os.name,
          targetHref: launchItem.decision.target,
          targetKind: "os",
        });
      } catch {
        return router.push(launchItem.decision.target);
      }
    }

    router.push(launchItem.decision.target);
  };

  const handleSaveFavorite = async () => {
    if (!session.isLoggedIn || !session.civilizationUserId) {
      requireLoginForPersonalAction();
      return;
    }

    try {
      setActionMessage(null);

      await requestPersonalFavoriteUpsert({
        session,
        code: `favorite-${os.code}`,
        title: os.name,
        href: buildOsDetailRoute(os.code),
        targetKind: "os",
        reason: `Saved from ${os.name} detail page`,
      });

      await requestPersonalRecentAppend({
        session,
        actionCode: "favorite_save",
        actionLabel: "Saved favorite entry",
        targetCode: os.code,
        targetTitle: os.name,
        targetHref: buildOsDetailRoute(os.code),
        targetKind: "os",
      });

      await requestPublicAnalyticsEventAppend({
        session,
        surface: "os-detail",
        action: "save_favorite",
        targetCode: os.code,
        targetTitle: os.name,
        targetKind: "os",
        metadata: "analytics_os_detail_save_favorite",
      }).catch(() => undefined);

      setActionMessage("Favorite entry saved.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Favorite entry could not be saved.";
      setActionMessage(message);
    }
  };

  const handleSaveShortcut = async () => {
    if (!session.isLoggedIn || !session.civilizationUserId) {
      requireLoginForPersonalAction();
      return;
    }

    try {
      setActionMessage(null);

      await requestPersonalShortcutUpsert({
        session,
        code: `shortcut-${os.code}`,
        title: os.name,
        href: buildOsDetailRoute(os.code),
        targetKind: "os",
        note: `Saved from ${os.name} detail page`,
        sortOrder: 100,
      });

      await requestPersonalRecentAppend({
        session,
        actionCode: "shortcut_save",
        actionLabel: "Saved shortcut entry",
        targetCode: os.code,
        targetTitle: os.name,
        targetHref: buildOsDetailRoute(os.code),
        targetKind: "os",
      });

      await requestPublicAnalyticsEventAppend({
        session,
        surface: "os-detail",
        action: "save_shortcut",
        targetCode: os.code,
        targetTitle: os.name,
        targetKind: "os",
        metadata: "analytics_os_detail_save_shortcut",
      }).catch(() => undefined);

      setActionMessage("Shortcut entry saved.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Shortcut entry could not be saved.";
      setActionMessage(message);
    }
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow={os.category}
        title={os.name}
        description={os.summary}
      />

      <StatusMessage
        title={`Auth bridge mode: ${bridgeMode}`}
        message="The OS detail page now records favorite, shortcut, and recent-action flows through exact personalization payloads."
        variant="info"
      />

      {errorMessage ? (
        <StatusMessage
          title="Unable to evaluate entry"
          message={errorMessage}
          variant="danger"
        />
      ) : null}

      {actionMessage ? (
        <StatusMessage
          title="Personal action update"
          message={actionMessage}
          variant="success"
        />
      ) : null}

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Entry summary</h2>
            <p className="card-copy">{os.tagline}</p>
            <div className="chip-row">
              <span className="chip">Availability: {os.availability}</span>
              <span className="chip">Access: {os.accessLevel}</span>
            </div>
            <ul className="list">
              {os.heroPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={handleSaveFavorite}
              >
                Save Favorite
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleSaveShortcut}
              >
                Save Shortcut
              </button>
            </div>
          </article>

          <article className="card">
            <h2 className="section-title">Current decision</h2>
            {loading ? (
              <StatusMessage
                title="Evaluating"
                message="Requesting the current launch decision from the portal API."
                variant="info"
              />
            ) : launchItem ? (
              <StatusMessage
                title={`Decision: ${launchItem.decision.result}`}
                message={launchItem.decision.reason}
                variant={
                  launchItem.decision.result === "launchable"
                    ? "success"
                    : launchItem.decision.result === "login_required"
                    ? "warning"
                    : launchItem.decision.result === "maintenance"
                    ? "warning"
                    : "danger"
                }
              />
            ) : (
              <StatusMessage
                title="No decision"
                message="No launch decision is available."
                variant="danger"
              />
            )}

            <div className="button-row">
              <button
                type="button"
                className="button-link"
                onClick={handlePrimaryAction}
                disabled={!launchItem}
              >
                {launchItem
                  ? RESULT_LABEL[launchItem.decision.result]
                  : "Waiting for Decision"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => router.push(ROUTES.osCatalog)}
              >
                Back to Catalog
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Current session summary</h2>
          <ul className="list">
            <li>Logged in: {session.isLoggedIn ? "yes" : "no"}</li>
            <li>Entity type: {session.entityType}</li>
            <li>Contract tier: {session.contractTier}</li>
            <li>
              Affiliations: {session.affiliations.length > 0 ? session.affiliations.join(", ") : "none"}
            </li>
            <li>
              Personal actions: {session.isLoggedIn ? "available" : "login required"}
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
