"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import {
  getActiveAuthBridgeMode,
  getGatewaySessionSummary,
} from "../../services/civilization-auth/auth-gateway";
import { requestPortalLaunchDecision } from "../../services/portal-api/launch-client";
import { saveReturnContext } from "../../services/return-context/storage";
import type { PortalSessionSummary } from "../../types/auth";
import type { PortalLaunchMatrixItem } from "../../types/portal-api";
import type { PortalOsCard } from "../../types/os";
import { ROUTES, buildOsDetailRoute } from "../../lib/routing/routes";

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

  const handlePrimaryAction = () => {
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

    router.push(launchItem.decision.target);
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
        message="The OS detail page now reads session state from the auth gateway instead of direct mock storage access."
        variant="info"
      />

      {errorMessage ? (
        <StatusMessage
          title="Unable to evaluate entry"
          message={errorMessage}
          variant="danger"
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
              Beta flags: {session.betaFlags.length > 0 ? session.betaFlags.join(", ") : "none"}
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
