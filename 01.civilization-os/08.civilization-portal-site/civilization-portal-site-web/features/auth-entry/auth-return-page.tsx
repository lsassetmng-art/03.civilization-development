"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import {
  getActiveAuthBridgeMode,
  resolvePortalAuthReturn,
} from "../../services/civilization-auth/auth-gateway";
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

  const bridgeMode = getActiveAuthBridgeMode();

  useEffect(() => {
    let active = true;

    const run = async () => {
      const status = searchParams.get("status") === "error" ? "error" : "success";
      const mode = searchParams.get("mode") === "signup" ? "signup" : "login";
      const searchReturnTarget = searchParams.get("return_target") ?? undefined;
      const requestedOsCode = searchParams.get("requested_os_code") ?? undefined;

      try {
        const result = await resolvePortalAuthReturn({
          status,
          mode,
          searchReturnTarget,
          requestedOsCode,
        });

        if (!active) {
          return;
        }

        setResolvedMode(result.mode);
        setResolvedTarget(result.returnTarget);
        setResolvedMessage(result.message);
        setIsError(result.status === "error");
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Authentication return could not be resolved.";

        setResolvedMode(mode);
        setResolvedTarget(ROUTES.error);
        setResolvedMessage(message);
        setIsError(true);
      }
    };

    run();

    return () => {
      active = false;
    };
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
        description="The auth return page now resolves only through the auth gateway interface, so the active bridge can later be swapped without page-level rewrites."
      />

      <StatusMessage
        title={`Bridge mode: ${bridgeMode} / Flow mode: ${resolvedMode}`}
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
