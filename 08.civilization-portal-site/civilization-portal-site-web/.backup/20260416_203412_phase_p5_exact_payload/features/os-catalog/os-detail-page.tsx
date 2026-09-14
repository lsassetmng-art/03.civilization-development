"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { getPortalSessionSummary } from "../../services/civilization-auth/mock-session";
import { saveReturnContext } from "../../services/return-context/storage";
import { evaluateOsEntry } from "../../services/os-launch/evaluate-os-entry";
import type { PortalSessionSummary } from "../../types/auth";
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

  useEffect(() => {
    setSession(getPortalSessionSummary());
  }, []);

  const decision = evaluateOsEntry(os, session);

  const handlePrimaryAction = () => {
    if (decision.result === "login_required") {
      saveReturnContext({
        requestedOsCode: os.code,
        returnTarget: buildOsDetailRoute(os.code),
        requestTimestamp: new Date().toISOString(),
      });
      router.push(decision.target);
      return;
    }

    if (decision.result === "launchable") {
      router.push(decision.target);
      return;
    }

    router.push(decision.target);
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow={os.category}
        title={os.name}
        description={os.summary}
      />

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
            <StatusMessage
              title={`Decision: ${decision.result}`}
              message={decision.reason}
              variant={
                decision.result === "launchable"
                  ? "success"
                  : decision.result === "login_required"
                  ? "warning"
                  : decision.result === "maintenance"
                  ? "warning"
                  : "danger"
              }
            />
            <div className="button-row">
              <button type="button" className="button-link" onClick={handlePrimaryAction}>
                {RESULT_LABEL[decision.result]}
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
