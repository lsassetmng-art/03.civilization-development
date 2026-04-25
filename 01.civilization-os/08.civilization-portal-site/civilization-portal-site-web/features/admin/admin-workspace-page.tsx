"use client";

import { useMemo, useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { getGatewaySessionSummary } from "../../services/civilization-auth/auth-gateway";
import { AdminAnalyticsPanel } from "./admin-analytics-panel";

function isOperatorSession(input: {
  isLoggedIn: boolean;
  entityType?: string;
  contractTier?: string;
  affiliations?: string[];
}): boolean {
  return (
    input.isLoggedIn &&
    input.entityType === "human" &&
    input.contractTier === "business" &&
    Array.isArray(input.affiliations) &&
    input.affiliations.includes("operator")
  );
}

export function AdminWorkspacePage() {
  const session = getGatewaySessionSummary();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const canOperate = useMemo(
    () =>
      isOperatorSession({
        isLoggedIn: session.isLoggedIn,
        entityType: session.entityType,
        contractTier: session.contractTier,
        affiliations: session.affiliations,
      }),
    [
      session.isLoggedIn,
      session.entityType,
      session.contractTier,
      session.affiliations,
    ],
  );

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Portal Admin"
        title="Admin workspace"
        description="Compile-safe normalized admin workspace for operator review and final stabilization."
      />

      <StatusMessage
        title="Admin workspace normalization"
        message="This workspace was normalized during final compile repair to remove broken panel insertion points."
        variant="info"
      />

      {globalError ? (
        <StatusMessage
          title="Admin panel error"
          message={globalError}
          variant="danger"
        />
      ) : null}

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Session summary</h2>
          <ul className="list">
            <li>Logged in: {session.isLoggedIn ? "yes" : "no"}</li>
            <li>Display name: {session.displayName ?? "unknown"}</li>
            <li>Entity type: {session.entityType}</li>
            <li>Contract tier: {session.contractTier}</li>
            <li>
              Affiliations:{" "}
              {session.affiliations.length > 0
                ? session.affiliations.join(", ")
                : "none"}
            </li>
            <li>Operator access: {canOperate ? "allowed" : "denied"}</li>
          </ul>
        </article>
      </section>

      {canOperate ? (
        <AdminAnalyticsPanel
          session={session}
          canOperate={canOperate}
          onError={setGlobalError}
        />
      ) : (
        <StatusMessage
          title="Access denied"
          message="Operator privileges are required to open the normalized admin workspace."
          variant="warning"
        />
      )}
    </div>
  );
}

export default AdminWorkspacePage;
