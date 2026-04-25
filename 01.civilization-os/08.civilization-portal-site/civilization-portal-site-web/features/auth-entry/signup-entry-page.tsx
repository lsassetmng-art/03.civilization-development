"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import {
  getActiveAuthBridgeMode,
  startPortalAuth,
} from "../../services/civilization-auth/auth-gateway";
import type { PortalAuthProfilePreset } from "../../types/portal-api";
import { ROUTES } from "../../lib/routing/routes";

export function SignupEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busyPreset, setBusyPreset] = useState<PortalAuthProfilePreset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bridgeMode = getActiveAuthBridgeMode();
  const returnTarget = searchParams.get("return_target") ?? ROUTES.launcher;
  const requestedOsCode = searchParams.get("requested_os_code") ?? undefined;

  const runSignup = async (preset: PortalAuthProfilePreset) => {
    try {
      setBusyPreset(preset);
      setErrorMessage(null);

      const result = await startPortalAuth({
        mode: "signup",
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
        error instanceof Error ? error.message : "Signup could not be started.";
      setErrorMessage(message);
    } finally {
      setBusyPreset(null);
    }
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Sign-up Entry"
        title="Signup guidance"
        description="Canonical sign-up remains owned by CivilizationOS. The portal now starts sign-up only through the fixed auth gateway interface."
      />

      <StatusMessage
        title={`Auth bridge mode: ${bridgeMode}`}
        message="This screen validates that sign-up can later switch from the mock bridge to a real CivilizationOS bridge without page-level rewrites."
        variant="info"
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
          <h2 className="section-title">Mock signup profiles</h2>
          <p className="section-copy">
            Choose a test profile to validate return routing and downstream launcher decisions.
          </p>

          <div className="button-row">
            <button
              type="button"
              className="button-link"
              onClick={() => runSignup("free-member")}
              disabled={busyPreset !== null}
            >
              {busyPreset === "free-member"
                ? "Starting..."
                : "Mock Signup as Free Member"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => runSignup("staticart-beta-creator")}
              disabled={busyPreset !== null}
            >
              {busyPreset === "staticart-beta-creator"
                ? "Starting..."
                : "Mock Signup as StaticArt Beta Creator"}
            </button>
          </div>

          <div className="button-row">
            <Link href={ROUTES.login} className="secondary-link">
              Back to Login Guidance
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
