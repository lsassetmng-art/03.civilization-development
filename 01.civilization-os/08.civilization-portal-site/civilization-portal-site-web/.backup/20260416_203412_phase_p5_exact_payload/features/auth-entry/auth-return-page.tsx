"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { clearReturnContext, readReturnContext } from "../../services/return-context/storage";
import { setMockPortalSession } from "../../services/civilization-auth/mock-session";
import { ROUTES } from "../../lib/routing/routes";

export function AuthReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resolvedTarget, setResolvedTarget] = useState<string>(ROUTES.launcher);
  const [resolvedMode, setResolvedMode] = useState<string>("login");
  const [resolvedMessage, setResolvedMessage] = useState<string>("Resolving return context...");

  const status = searchParams.get("status") ?? "success";
  const mode = searchParams.get("mode") ?? "login";

  const returnContext = useMemo(() => readReturnContext(), []);

  useEffect(() => {
    const returnTarget =
      searchParams.get("return_target") ??
      returnContext?.returnTarget ??
      ROUTES.launcher;

    const requestedOsCode =
      searchParams.get("requested_os_code") ?? returnContext?.requestedOsCode ?? undefined;

    if (status === "success") {
      if (mode === "signup") {
        setMockPortalSession({
          displayName: "New Explorer",
          entityType: "human",
          contractTier: "free",
          affiliations: ["public"],
          betaFlags: [],
        });
      } else {
        setMockPortalSession({
          displayName: "Portal Operator",
          entityType: "human",
          contractTier: "business",
          affiliations: ["public", "operator"],
          betaFlags: [],
        });
      }

      setResolvedTarget(returnTarget);
      setResolvedMode(mode);
      setResolvedMessage(
        requestedOsCode
          ? `Authentication completed. Returning to the saved destination for ${requestedOsCode}.`
          : "Authentication completed. Returning to the saved destination.",
      );
      clearReturnContext();
      return;
    }

    setResolvedTarget(ROUTES.error);
    setResolvedMode(mode);
    setResolvedMessage("Authentication could not be completed.");
    clearReturnContext();
  }, [mode, returnContext, searchParams, status]);

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
        description="This page resolves the saved return context and restores the requested portal destination."
      />

      <StatusMessage
        title={`Mode: ${resolvedMode}`}
        message={resolvedMessage}
        variant={status === "success" ? "success" : "danger"}
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
