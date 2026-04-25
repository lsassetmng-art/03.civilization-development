"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { buildMockAuthReturnUrl, clearPortalSession } from "../../services/civilization-auth/mock-session";
import { saveReturnContext } from "../../services/return-context/storage";
import { ROUTES } from "../../lib/routing/routes";

export function LoginEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTarget = searchParams.get("return_target") ?? ROUTES.launcher;
  const requestedOsCode = searchParams.get("requested_os_code") ?? undefined;

  const handleMockLogin = () => {
    saveReturnContext({
      requestedOsCode,
      returnTarget,
      requestTimestamp: new Date().toISOString(),
    });

    router.push(buildMockAuthReturnUrl("login", returnTarget, requestedOsCode));
  };

  const handleClearMockState = () => {
    clearPortalSession();
    window.location.reload();
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Authentication Entry"
        title="Login guidance"
        description="Canonical authentication belongs to CivilizationOS. This page currently uses a mock bridge so portal return-context routing can be validated."
      />

      <StatusMessage
        title="Mock bridge active"
        message="This implementation simulates the post-authentication return flow before real CivilizationOS integration is connected."
        variant="warning"
      />

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Requested destination</h2>
          <ul className="list">
            <li>Return target: {returnTarget}</li>
            <li>Requested OS: {requestedOsCode ?? "not specified"}</li>
          </ul>

          <div className="button-row">
            <button type="button" className="button-link" onClick={handleMockLogin}>
              Mock Login as Business Operator
            </button>
            <Link href={ROUTES.signup} className="secondary-link">
              Go to Signup Guidance
            </Link>
            <button type="button" className="secondary-button" onClick={handleClearMockState}>
              Clear Mock Session
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
