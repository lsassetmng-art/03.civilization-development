"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { buildMockAuthReturnUrl } from "../../services/civilization-auth/mock-session";
import { saveReturnContext } from "../../services/return-context/storage";
import { ROUTES } from "../../lib/routing/routes";

export function SignupEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTarget = searchParams.get("return_target") ?? ROUTES.launcher;
  const requestedOsCode = searchParams.get("requested_os_code") ?? undefined;

  const handleMockSignup = () => {
    saveReturnContext({
      requestedOsCode,
      returnTarget,
      requestTimestamp: new Date().toISOString(),
    });

    router.push(buildMockAuthReturnUrl("signup", returnTarget, requestedOsCode));
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Sign-up Entry"
        title="Signup guidance"
        description="Canonical sign-up belongs to CivilizationOS. This screen provides the portal-side bridge and return-context handling for the current mock implementation."
      />

      <StatusMessage
        title="Portal-side guidance only"
        message="The real sign-up owner remains CivilizationOS. This page is here to validate routing and state restoration."
        variant="info"
      />

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Next action</h2>
          <p className="section-copy">
            The mock sign-up path creates a signed-in free-tier human session and resolves
            the saved return target through the auth return page.
          </p>

          <div className="button-row">
            <button type="button" className="button-link" onClick={handleMockSignup}>
              Mock Signup as Free Member
            </button>
            <Link href={ROUTES.login} className="secondary-link">
              Back to Login Guidance
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
