"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import {
  clearGatewaySession,
  getActiveAuthBridgeMode,
  startPortalAuth,
} from "../../services/civilization-auth/auth-gateway";
import type { PortalAuthProfilePreset } from "../../types/portal-api";
import { ROUTES } from "../../lib/routing/routes";

export function LoginEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busyPreset, setBusyPreset] = useState<PortalAuthProfilePreset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bridgeMode = getActiveAuthBridgeMode();
  const returnTarget = searchParams.get("return_target") ?? ROUTES.launcher;
  const requestedOsCode = searchParams.get("requested_os_code") ?? undefined;

  const runLogin = async (preset: PortalAuthProfilePreset) => {
    try {
      setBusyPreset(preset);
      setErrorMessage(null);

      const result = await startPortalAuth({
        mode: "login",
        profilePreset: preset,
        returnContext: {
          requestedOsCode,
          returnTarget,
          requestTimestamp: new Date().toISOString(),
        },
      });

      router.push(result.redirectUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login could not be started.";
      setErrorMessage(message);
    } finally {
      setBusyPreset(null);
    }
  };

  const handleClearState = () => {
    clearGatewaySession();
    window.location.reload();
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Authentication Entry"
        title="Login guidance"
        description="Canonical authentication belongs to CivilizationOS. The portal now starts authentication only through the fixed auth gateway interface."
      />

      <StatusMessage
        title={`Auth bridge mode: ${bridgeMode}`}
        message="The login screen no longer talks to mock session storage directly. It only uses the bridge gateway."
        variant="warning"
      />

      {errorMessage ? (
        <StatusMessage
          title="Unable to continue"
          message={errorMessage}
          variant="danger"
        />
      ) : null}

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Requested destination</h2>
          <ul className="list">
            <li>Return target: {returnTarget}</li>
            <li>Requested OS: {requestedOsCode ?? "not specified"}</li>
          </ul>

          <div className="button-row">
            <button
              type="button"
              className="button-link"
              onClick={() => runLogin("business-operator")}
              disabled={busyPreset !== null}
            >
              {busyPreset === "business-operator"
                ? "Starting..."
                : "Mock Login as Business Operator"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => runLogin("free-member")}
              disabled={busyPreset !== null}
            >
              {busyPreset === "free-member"
                ? "Starting..."
                : "Mock Login as Free Member"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => runLogin("staticart-beta-creator")}
              disabled={busyPreset !== null}
            >
              {busyPreset === "staticart-beta-creator"
                ? "Starting..."
                : "Mock Login as StaticArt Beta Creator"}
            </button>
          </div>

          <div className="button-row">
            <Link href={ROUTES.signup} className="secondary-link">
              Go to Signup Guidance
            </Link>
            <button
              type="button"
              className="secondary-button"
              onClick={handleClearState}
            >
              Clear Gateway Session
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
