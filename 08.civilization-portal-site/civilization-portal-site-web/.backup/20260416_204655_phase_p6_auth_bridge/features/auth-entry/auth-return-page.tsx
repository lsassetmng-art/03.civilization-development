"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import {
  clearPendingAuthResponse,
  readPendingAuthResponse,
  savePortalSession,
} from "../../services/civilization-auth/mock-session";
  clearReturnContext,
  readReturnContext,
} from "../../services/return-context/storage";
import { ROUTES } from "../../lib/routing/routes";

export function AuthReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resolvedTarget, setResolvedTarget] = useState<string>(ROUTES.launcher);
  const [resolvedMode, setResolvedMode] = useState<string>("login");
  const [resolvedMessage, setResolvedMessage] = useState<string>(
    "Resolving authentication return...",
  );
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const pending = readPendingAuthResponse();
    const storedReturnContext = readReturnContext();
    const status = searchParams.get("status") ?? "success";
    const mode = searchParams.get("mode") ?? "login";
    const fallbackTarget =
      searchParams.get("return_target") ??
      storedReturnContext?.returnTarget ??
      ROUTES.launcher;

    setResolvedMode(mode);

    if (status !== "success") {
      setResolvedTarget(ROUTES.error);
      setResolvedMessage("Authentication did not finish successfully.");
      setIsError(true);
      clearPendingAuthResponse();
      clearReturnContext();
      return;
    }

    if (!pending) {
      setResolvedTarget(ROUTES.error);
      setResolvedMessage("No pending authentication payload could be found.");
      setIsError(true);
      clearReturnContext();
      return;
    }

    savePortalSession(pending.session);

    const target = pending.returnContext.returnTarget || fallbackTarget;
    setResolvedTarget(target);
    setResolvedMessage(
      `Authentication completed. Returning to ${target}.`,
    );
    setIsError(false);

    clearPendingAuthResponse();
    clearReturnContext();
  }, [searchParams]);

  useEffect(() => {
    if (!resolvedTarget) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(resolvedTarget);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [resolvedTarget, router]);

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Auth Return"
        title="Completing portal return"
        description="The auth return page now commits the exact pending auth payload into local mock session storage before redirecting."
      />

      <StatusMessage
        title={`Mode: ${resolvedMode}`}
        message={resolvedMessage}
        variant={isError ? "danger" : "success"}
      />

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Resolved target</h2>
          <p className="card-copy">{resolvedTarget}</p>
          <div className="button-row">
            <Link href={resolvedTarget} className="button-link">
              Continue now
            </Link>
            <Link href={ROUTES.launcher} className="secondary-link">
              Open Launcher Instead
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
